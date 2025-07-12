import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

// Configure your email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendFormSubmissionEmail({
  to,
  formTitle,
  formId,
  formData,
  requestId,
}: {
  to: string;
  formTitle: string;
  formId: string;
  formData: Record<string, any>;
  requestId: string;
}) {
  try {
    // Format form data for email
    const formattedData = Object.entries(formData)
      .filter(([key]) => key !== 'csrf_token') // Filter out csrf_token
      .map(([key, value]) => {
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        return `<strong>${key}:</strong> ${displayValue}`;
      })
      .join('<br>');

    // Send email
    const info = await transporter.sendMail({
      from: `"Formix" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: `New submission: ${formTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #34A853;">New Form Submission</h2>
          <p>You have received a new submission for your form: <strong>${formTitle}</strong></p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Submission Details:</h3>
            <div>${formattedData}</div>
          </div>
          
          <a href="${process.env.NEXTAUTH_URL || ''}/submissions/${formId}" style="display: inline-block; background-color: #34A853; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 15px;">View Complete Submission</a>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            You're receiving this because you enabled email notifications for form submissions.
            <br>
            Form ID: ${requestId}
          </p>
        </div>
      `,
    });

    logger.info(`[${requestId}] Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`[${requestId}] Failed to send email notification`, error);
    return false;
  }
}