// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Form } from "@/lib/types";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

type SearchParams = {
  layout?: 'card' | 'leaderboard' | 'achievement';
  page?: string;
  pageSize?: string;
}

// Client-side components
import ThemeDependentComponents from "@/components/theme-dependent-components";

export default async function DashboardPage(
  props: {
    searchParams: Promise<SearchParams>
  }
) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const activeLayout = searchParams.layout || "card";

  // Pagination parameters
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = parseInt(searchParams.pageSize || "6", 10);
  const skip = (page - 1) * pageSize;

  // Get total forms count for pagination
  const totalFormsCount = await prisma.form.count({
    where: {
      userId: session?.user.id,
      isArchived: false
    }
  });

  const totalPages = Math.max(1, Math.ceil(totalFormsCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const [forms, archivedCount, allForms] = await Promise.all([
    // Paginated forms
    prisma.form.findMany({
      where: {
        userId: session?.user.id,
        isArchived: false
      },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    // Archived forms count
    prisma.form.count({
      where: {
        userId: session?.user.id,
        isArchived: true
      }
    }),
    // All forms (for stats)
    prisma.form.findMany({
      where: {
        userId: session?.user.id,
        isArchived: false
      },
      include: {
        submissions: true
      },
    })
  ]) as [Form[], number, Form[]];

  // Calculate total submissions from all forms (not just paginated ones)
  const totalSubmissions = allForms.reduce(
    (acc, form) => acc + (form.submissions?.length || 0),
    0
  );

  // Correct achievements calculation
  const achievementThresholds = [1, 5, 20, 50, 100];
  const achievementsEarned = achievementThresholds.filter(
    threshold => totalSubmissions >= threshold
  ).length;

  // Adjusted progress calculations
  const formsTarget = 20; // Adjust this based on desired target
  const submissionsTarget = 100; // Adjust this based on desired target

  // Pass all data to the client-side component
  const dashboardData = {
    forms,
    totalFormsCount,
    archivedCount,
    totalSubmissions,
    achievementsEarned,
    achievementThresholds,
    formsTarget,
    submissionsTarget,
    currentPage,
    totalPages,
    activeLayout,
    userName: session?.user?.name || "User"
  };

  return (
    <ThemeDependentComponents 
      data={dashboardData}
    />
  );
}