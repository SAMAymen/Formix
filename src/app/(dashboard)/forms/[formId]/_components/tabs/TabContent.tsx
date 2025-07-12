// app/forms/[formId]/components/tabs/TabContent.tsx
interface TabContentProps {
    active: boolean;
    children: React.ReactNode;
  }
  
  export function TabContent({ active, children }: TabContentProps) {
    if (!active) return null;
    return <div className="space-y-4">{children}</div>;
  }