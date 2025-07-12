// app/layout.tsx (Server Component)
import ClientLayout from "@/components/layout/client-layout";

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}