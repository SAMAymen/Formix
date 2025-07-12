import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="shadow border-0">
          <CardContent className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">We couldn't find this form</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-gray-500 mb-6">The form you're looking for might have been moved or deleted.</p>
            <Link href="/dashboard">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
