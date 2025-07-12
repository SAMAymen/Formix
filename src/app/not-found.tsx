import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-8 max-w-7xl mx-auto bg-gradient-to-b from-green-50 to-emerald-50 min-h-screen flex items-center justify-center">
      <Card className="border-amber-100 bg-amber-50/50 max-w-md">
        <CardContent className="pt-6">
          <div className="mb-4 text-amber-600 mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <FileX className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-amber-800 mb-2">Page Not Found</h2>
          <p className="text-amber-700 mb-4">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <Button
            variant="outline"
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
            asChild
          >
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}