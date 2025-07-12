// app/submissions/[formId]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  SubmissionsPageClient,
  SubmissionsErrorClient,
} from "./submissions-client";

interface Field {
  id: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface FormWithSubmissions {
  id: string;
  title: string;
  fields: Field[];
  submissions: Array<{
    id: string;
    createdAt: Date;
    data: Record<string, any>;
  }>;
}

function isFieldArray(value: unknown): value is Field[] {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      const field = item as Field;
      return (
        typeof field === "object" &&
        typeof field.id === "string" &&
        typeof field.label === "string" &&
        typeof field.type === "string"
      );
    })
  );
}

// At the top of your page.tsx file, outside any component
async function exportData(formData: FormData) {
  "use server";

  const format = formData.get("format")?.toString();
  const formId = formData.get("formId")?.toString();

  if (!format || !["csv", "json"].includes(format) || !formId) {
    return new Response("Invalid request parameters", { status: 400 });
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { title: true, fields: true },
  });

  if (!form || !isFieldArray(form.fields)) {
    return new Response("Invalid form configuration", { status: 400 });
  }

  const fields = form.fields;
  const submissions = await prisma.submission.findMany({
    where: { formId },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["Timestamp", ...fields.map((f) => f.label)];

  if (format === "csv") {
    const csvContent = [
      headers.join(","),
      ...submissions.map((sub) => {
        const data = sub.data as Record<string, any>;
        return [
          new Date(sub.createdAt).toISOString(),
          ...fields.map(
            (f) =>
              `"${(data[f.label]?.toString() || "").replace(/"/g, '""')}"`
          ),
        ].join(",");
      }),
    ].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${form.title}_submissions.csv"`,
      },
    });
  }

  const jsonData = submissions.map((sub) => ({
    timestamp: sub.createdAt.toISOString(),
    ...Object.fromEntries(
      fields.map((f) => [
        f.label,
        (sub.data as Record<string, any>)[f.label] || null,
      ])
    ),
  }));

  return new Response(JSON.stringify(jsonData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${form.title}_submissions.json"`,
    },
  });
}

export default async function SubmissionsPage(
  props: {
    params: Promise<{ formId: string }>;
  }
) {
  const params = await props.params;
  try {
    const form = await prisma.form.findUnique({
      where: { id: params.formId },
      include: {
        submissions: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
    });

    if (!form) return notFound();

    if (!isFieldArray(form.fields)) {
      throw new Error("Form configuration error");
    }

    const typedForm: FormWithSubmissions = {
      id: form.id,
      title: form.title,
      fields: form.fields,
      submissions: form.submissions.map((sub) => ({
        id: sub.id,
        createdAt: sub.createdAt,
        data: sub.data as Record<string, any>,
      })),
    };

    return (
      <SubmissionsPageClient
        formId={params.formId}
        typedForm={typedForm}
        exportData={exportData}
      />
    );
  } catch (error) {
    console.error("Error loading submissions:", error);
    return <SubmissionsErrorClient />;
  }
}
