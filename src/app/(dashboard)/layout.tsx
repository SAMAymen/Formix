import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation'
import { authOptions } from "@/lib/auth";
import { DashboardClientWrapper } from "@/components/dashboard-client-wrapper"
import { DashboardThemeProvider } from "@/providers/dashboard-theme-provider"
import { GoogleTokenMonitor } from '@/components/GoogleTokenMonitor'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <DashboardThemeProvider>
      <GoogleTokenMonitor />
      <DashboardClientWrapper user={{
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined
      }}>
        {children}
      </DashboardClientWrapper>
    </DashboardThemeProvider>
  )
}