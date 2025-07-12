// app/dashboard/archived/page.tsx
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Form } from "@/lib/types";
import { ArchivedPageClient } from "./archived-client";

export default async function ArchivedFormsPage() {
  const session = await getServerSession(authOptions);

  const archivedForms = await prisma.form.findMany({
    where: {
      userId: session?.user.id,
      isArchived: true
    },
    include: {
      submissions: true
    }
  }) as Form[];

  return <ArchivedPageClient forms={archivedForms} />;
}