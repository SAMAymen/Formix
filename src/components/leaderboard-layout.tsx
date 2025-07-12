// components/leaderboard-layout.tsx
"use client";

import Link from "next/link";
import { Trophy, Flame, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/lib/types";
import { useTheme } from "@/providers/theme-provider";

const calculateLevel = (submissionsCount: number) => {
  if (submissionsCount > 100) return { level: 5, icon: <Trophy className="text-yellow-500" /> };
  if (submissionsCount > 50) return { level: 4, icon: <Flame className="text-orange-500" /> };
  if (submissionsCount > 20) return { level: 3, icon: <Star className="text-blue-500" /> };
  if (submissionsCount > 5) return { level: 2, icon: <Award className="text-green-500" /> };
  return { level: 1, icon: <Award className="text-gray-500 dark:text-gray-400" /> };
};

export default function LeaderboardLayout({ forms }: { forms: Form[] }) {
  const { theme, resolvedTheme } = useTheme();

  // Theme-based styles
  const cardClasses = resolvedTheme === 'dark'
    ? "w-full bg-gray-800 border-gray-700"
    : "w-full";

  const cardTitleClasses = resolvedTheme === 'dark'
    ? "text-xl font-bold flex items-center text-gray-200"
    : "text-xl font-bold flex items-center";

  const tableHeaderClasses = resolvedTheme === 'dark'
    ? "border-b border-gray-700"
    : "border-b";

  const thClasses = resolvedTheme === 'dark'
    ? "text-left p-3 text-gray-300"
    : "text-left p-3";

  const rowClasses = resolvedTheme === 'dark'
    ? "border-b border-gray-700 hover:bg-green-900/10 transition-colors"
    : "border-b hover:bg-green-50 transition-colors";

  const rankClasses = resolvedTheme === 'dark'
    ? "p-3 font-bold text-gray-200"
    : "p-3 font-bold";

  const titleClasses = resolvedTheme === 'dark'
    ? "p-3 font-medium text-gray-200"
    : "p-3 font-medium";

  const levelColClasses = resolvedTheme === 'dark'
    ? "p-3 text-center text-gray-300"
    : "p-3 text-center";

  const badgeClasses = resolvedTheme === 'dark'
    ? "bg-green-900/30 text-green-300 border-green-900"
    : "bg-green-50 text-green-700";

  const progressBgClasses = resolvedTheme === 'dark'
    ? "bg-gray-700"
    : "bg-gray-200";

  const progressBarClasses = resolvedTheme === 'dark'
    ? "bg-green-500"
    : "bg-green-600";

  const dateClasses = resolvedTheme === 'dark'
    ? "p-3 text-center text-sm text-gray-400"
    : "p-3 text-center text-sm text-gray-600";

  const editButtonClasses = resolvedTheme === 'dark'
    ? "h-8 border-gray-700 text-gray-200 hover:bg-gray-700"
    : "h-8";

  const analyticsButtonClasses = resolvedTheme === 'dark'
    ? "h-8 bg-green-900/30 text-green-300 hover:bg-green-800/50"
    : "h-8 bg-green-50 text-green-700 hover:bg-green-100";

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <CardTitle className={cardTitleClasses}>
          <Trophy className="mr-2 text-yellow-500" />
          Form Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={tableHeaderClasses}>
                <th className={thClasses}>Rank</th>
                <th className={thClasses}>Form</th>
                <th className={`${thClasses} text-center`}>Level</th>
                <th className={`${thClasses} text-center`}>Submissions</th>
                <th className={`${thClasses} text-center`}>Progress</th>
                <th className={`${thClasses} text-center`}>Last Updated</th>
                <th className={`${thClasses} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms
                .sort((a, b) => (b.submissions?.length ?? 0) - (a.submissions?.length ?? 0))
                .map((form, index) => {
                  const { level, icon } = calculateLevel(form.submissions?.length ?? 0);
                  return (
                    <tr 
                      key={form.id} 
                      className={rowClasses}
                    >
                      <td className={rankClasses}>
                        {index === 0 && <span className="text-yellow-500">#1 🏆</span>}
                        {index === 1 && <span className={resolvedTheme === 'dark' ? "text-gray-400" : "text-gray-500"}>#2 🥈</span>}
                        {index === 2 && <span className={resolvedTheme === 'dark' ? "text-amber-500" : "text-amber-700"}>#3 🥉</span>}
                        {index > 2 && <span className={resolvedTheme === 'dark' ? "text-gray-300" : ""}>{`#${index + 1}`}</span>}
                      </td>
                      <td className={titleClasses}>{form.title}</td>
                      <td className={levelColClasses}>
                        <div className="flex items-center justify-center">
                          {icon} <span className="ml-1">{level}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className={badgeClasses}>
                          {form.submissions?.length ?? 0}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className={`w-full ${progressBgClasses} rounded-full h-2`}>
                          <div
                            className={`${progressBarClasses} h-2 rounded-full`}
                            style={{ width: `${Math.min((form.submissions?.length ?? 0) * 2, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className={dateClasses}>
                        {form.updatedAt ? new Date(form.updatedAt).toLocaleDateString('en-US') : 'N/A'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className={editButtonClasses} asChild>
                            <Link href={`/forms/${form.id}`}>Edit</Link>
                          </Button>
                          <Button variant="secondary" size="sm" className={analyticsButtonClasses} asChild>
                            <Link href={`/submissions/${form.id}`}>Analytics</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}