import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { sendFormSubmissionEmail } from '@/lib/email';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  const requestId = crypto.randomUUID();
  const formId = params.formId;
  logger.info(`[${requestId}] Starting submission for form: ${formId}`);

  // Get the session first
  const session = await getServerSession(authOptions);

  const response = (data: any, status = 200) => {
    return NextResponse.json(data, {
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  };

  try {
    let formData: Record<string, any>;
    try {
      formData = await req.json();
    } catch (error) {
      logger.error(`[${requestId}] Invalid JSON data`, error);
      return response(
        {
          success: false,
          error: "Invalid JSON data format",
        },
        400
      );
    }

    if (!formId) {
      logger.warn(`[${requestId}] Missing form ID in request`);
      return response(
        {
          success: false,
          error: "Form ID is required",
        },
        400
      );
    }

    const origin = req.headers.get("origin");
    logger.info(
      `[${requestId}] Processing data from origin ${origin}: ` +
        JSON.stringify(formData)
    );

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { 
        user: { 
          select: { 
            email: true, 
            emailNotificationsEnabled: true 
          } 
        } 
      },
    });

    if (!form || !form.sheetId) {
      logger.warn(
        `[${requestId}] Form ID ${formId} not found or missing sheetId`
      );
      return response(
        {
          success: false,
          error: "Form or spreadsheet not found",
        },
        404
      );
    }

    logger.info(
      `[${requestId}] Found form: "${form.title}" with sheet ID: ${form.sheetId}`
    );

    const account = await prisma.account.findFirst({
      where: {
        userId: form.userId,
        provider: "google",
      },
    });

    // Check just the refresh token
    if (!account?.refresh_token) {
      logger.error(
        `[${requestId}] Missing Google refresh token for user ${form.userId}`
      );
      return response(
        {
          success: false,
          error: "Google account not connected or missing credentials",
        },
        401
      );
    }

    // If we have a refresh token but no access token, try to get a new access token
    if (!account?.access_token && account?.refresh_token) {
      logger.info(`[${requestId}] Access token missing, attempting to refresh`);
      try {
        const refreshResponse = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: account?.refresh_token,
            }),
          }
        );

        const data = await refreshResponse.json();
        if (!refreshResponse.ok) {
          logger.error(
            `[${requestId}] Token refresh failed: ${JSON.stringify(data)}`
          );
          throw new Error("Failed to refresh access token");
        }

        // Update the account with the new access token
        await prisma.account.update({
          where: { id: account.id },
          data: {
            access_token: data.access_token,
            expires_at:
              Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
          },
        });

        // Update the account object for this request
        account.access_token = data.access_token;
        account.expires_at =
          Math.floor(Date.now() / 1000) + (data.expires_in || 3600);

        logger.info(`[${requestId}] Successfully refreshed access token`);
      } catch (refreshError) {
        logger.error(`[${requestId}] Error refreshing token: ${refreshError}`);
        return response(
          {
            success: false,
            error: "Failed to refresh Google access token",
          },
          401
        );
      }
    }

    // Now proceed with the original OAuth client setup using the refreshed token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.NEXTAUTH_URL!
    );

    oauth2Client.setCredentials({
      access_token: account?.access_token,
      refresh_token: account?.refresh_token,
      expiry_date: account?.expires_at
        ? account.expires_at * 1000
        : Date.now() + 3600 * 1000,
    });

    oauth2Client.on("tokens", async (tokens) => {
      logger.info(`[${requestId}] Refreshing Google access token`);

      if (tokens.access_token) {
        await prisma.account.update({
          where: { id: account?.id },
          data: {
            access_token: tokens.access_token,
            expires_at: tokens.expiry_date
              ? Math.floor(tokens.expiry_date / 1000)
              : undefined,
          },
        });
      }
    });

    const sheetsAPI = google.sheets({ version: "v4", auth: oauth2Client });

    try {
      const spreadsheetInfo = await sheetsAPI.spreadsheets.get({
        spreadsheetId: form.sheetId,
      });

      if (
        !spreadsheetInfo.data.sheets ||
        spreadsheetInfo.data.sheets.length === 0
      ) {
        logger.error(`[${requestId}] No sheets found in spreadsheet`);
        return response(
          {
            success: false,
            error: "Spreadsheet contains no sheets",
          },
          400
        );
      }

      const firstSheet = spreadsheetInfo.data.sheets[0].properties;
      const sheetName = firstSheet?.title || "Sheet1";

      const fieldsData = form.fields as any[];
      if (!Array.isArray(fieldsData)) {
        logger.error(`[${requestId}] Form fields data is not an array`);
        return response(
          {
            success: false,
            error: "Invalid form structure",
          },
          500
        );
      }

      const sheetData = await sheetsAPI.spreadsheets.values.get({
        spreadsheetId: form.sheetId,
        range: `${sheetName}!A1:Z1`,
      });

      if (!sheetData.data.values || sheetData.data.values.length === 0) {
        logger.info(`[${requestId}] Sheet is empty, adding headers`);

        const headers = [
          ...fieldsData.map((field) => field.label || "Unnamed Field"),
          "Origin",
          "Timestamp",
        ];

        await sheetsAPI.spreadsheets.values.append({
          spreadsheetId: form.sheetId,
          range: sheetName,
          valueInputOption: "RAW",
          requestBody: {
            values: [headers],
          },
        });
      }

      const cleanValues: any[] = [];

      logger.info(
        `[${requestId}] Received form data keys: ${Object.keys(formData).join(
          ", "
        )}`
      );
      logger.info(
        `[${requestId}] Expected field IDs: ${fieldsData
          .map((f) => f.id)
          .join(", ")}`
      );

      fieldsData.forEach((field) => {
        const fieldId = field.id;
        let value = formData[fieldId];

        if (value === undefined) {
          const matchingKey = Object.keys(formData).find(
            (key) =>
              key === field.label || (field.label && key.includes(field.label))
          );

          if (matchingKey) {
            value = formData[matchingKey];
            logger.info(
              `[${requestId}] Found field "${fieldId}" by matching label "${matchingKey}"`
            );
          } else {
            logger.warn(
              `[${requestId}] Field "${fieldId}" (label: "${field.label}") not found in submitted data`
            );
            cleanValues.push("");
            return;
          }
        }

        if (field.type === "checkbox" || field.type === "multiselect") {
          if (Array.isArray(value)) {
            cleanValues.push(value.join(", "));
          } else if (
            typeof value === "object" &&
            value !== null &&
            "values" in value
          ) {
            const extracted = Array.isArray(value.values)
              ? value.values
                  .map((item: any) =>
                    typeof item === "object" && item.string_value
                      ? item.string_value
                      : String(item)
                  )
                  .join(", ")
              : "";
            cleanValues.push(extracted);
          } else {
            cleanValues.push(String(value));
          }
        } else {
          cleanValues.push(String(value));
        }

        logger.info(
          `[${requestId}] Processed field "${fieldId}" (${field.type}): ${
            cleanValues[cleanValues.length - 1]
          }`
        );
      });

      const formattedValues = [
        ...cleanValues,
        origin || "Unknown",
        new Date().toISOString(),
      ];

      const sheetsResponse = await sheetsAPI.spreadsheets.values.append({
        spreadsheetId: form.sheetId,
        range: sheetName,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [formattedValues],
        },
      });

      logger.info(
        `[${requestId}] Successfully appended data to sheet: ${sheetsResponse.data.updates?.updatedRange}`
      );

      await prisma.submission.create({
        data: {
          formId: form.id,
          data: formData,
          createdAt: new Date(),
        },
      });

      // Modified email notification logic - will work for embedded forms
      if (form.user.emailNotificationsEnabled && form.user.email) {
        // Send email notification using the form owner's email from the database
        await sendFormSubmissionEmail({
          to: form.user.email,
          formTitle: form.title,
          formId: form.id,
          formData,
          requestId,
        });
        logger.info(`[${requestId}] Email notification sent to form owner: ${form.user.email}`);
      } else {
        logger.info(`[${requestId}] Email notifications disabled by form owner or email missing`);
      }

      return response({
        success: true,
        message: "Data saved successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (sheetsError: any) {
      logger.error(
        `[${requestId}] Google Sheets API error: ${sheetsError.message}`
      );

      if (sheetsError.code === 403) {
        return response(
          {
            success: false,
            error:
              "Permission denied. The form owner needs to grant access to the spreadsheet.",
          },
          403
        );
      }

      if (sheetsError.code === 404) {
        return response(
          {
            success: false,
            error: "Spreadsheet not found. It may have been deleted or moved.",
          },
          404
        );
      }

      throw sheetsError;
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit data";
    logger.error(`[${requestId}] Submission error: ${errorMessage}`, error);

    return response(
      {
        success: false,
        error: errorMessage,
        requestId: requestId,
      },
      500
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
