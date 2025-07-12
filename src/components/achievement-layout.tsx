// components/achievement-layout.tsx
"use client";

import Link from "next/link";
import { Inbox, TrendingUp, Star, Flame, Trophy, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/lib/types";
import { useTheme } from "@/providers/theme-provider";

const calculateLevel = (submissionsCount: number) => {
  if (submissionsCount > 100) return { level: 5, icon: <Trophy className="text-yellow-500" /> };
  if (submissionsCount > 50) return { level: 4, icon: <Flame className="text-orange-500" /> };
  if (submissionsCount > 20) return { level: 3, icon: <Star className="text-blue-500" /> };
  if (submissionsCount > 5) return { level: 2, icon: <Award className="text-green-500" /> };
  return { level: 1, icon: <Award className="text-gray-500" /> };
};

export default function AchievementLayout({ forms }: { forms: Form[] }) {
  const { theme, resolvedTheme } = useTheme();
  
  console.log("Current theme:", theme); // Add this for debugging

  // Theme-based styles
  const cardClasses = resolvedTheme === 'dark'
    ? "overflow-hidden bg-gray-800 border-gray-700"
    : "overflow-hidden bg-white border-green-50 shadow-sm hover:shadow-md";

  const headerBgClasses = resolvedTheme === 'dark'
    ? "bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white"
    : "bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white";

  const pointsBadgeClasses = resolvedTheme === 'dark'
    ? "flex items-center gap-1 bg-white bg-opacity-20 rounded-full px-3 py-1"
    : "flex items-center gap-1 bg-white bg-opacity-20 rounded-full px-3 py-1";

  const levelContainerClasses = resolvedTheme === 'dark'
    ? "w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
    : "w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center";

  const progressBarBgClasses = resolvedTheme === 'dark'
    ? "w-32 bg-white bg-opacity-30 rounded-full h-2 mt-1"
    : "w-32 bg-white bg-opacity-30 rounded-full h-2 mt-1";

  const progressBarFillClasses = resolvedTheme === 'dark'
    ? "bg-white h-2 rounded-full"
    : "bg-white h-2 rounded-full";
    
  const submissionLabelClasses = resolvedTheme === 'dark'
    ? "text-sm text-gray-400"
    : "text-sm text-gray-500";
    
  const submissionValueClasses = resolvedTheme === 'dark'
    ? "text-2xl font-bold text-gray-200"
    : "text-2xl font-bold text-gray-800";
    
  const updatedLabelClasses = resolvedTheme === 'dark'
    ? "text-sm text-gray-400"
    : "text-sm text-gray-500";
    
  const updatedValueClasses = resolvedTheme === 'dark'
    ? "text-gray-300"
    : "text-gray-700";
    
  const achievementHeaderClasses = resolvedTheme === 'dark'
    ? "font-semibold mb-3 flex items-center gap-2 text-gray-200"
    : "font-semibold mb-3 flex items-center gap-2 text-gray-800";
    
  const achievementIconClasses = resolvedTheme === 'dark'
    ? "text-green-500"
    : "text-green-600";
    
  const achievementUnlockedClasses = resolvedTheme === 'dark'
    ? "border-green-800 bg-green-900/20"
    : "border-green-200 bg-green-50";
    
  const achievementLockedClasses = resolvedTheme === 'dark'
    ? "border-gray-700 bg-gray-700/30 opacity-50"
    : "border-gray-200 bg-gray-50 opacity-50";

  const editButtonClasses = resolvedTheme === 'dark'
    ? "w-full border-gray-700 hover:bg-gray-700 text-gray-200"
    : "w-full border-gray-200 hover:bg-gray-50 text-gray-700";
    
  const analyticsButtonClasses = resolvedTheme === 'dark'
    ? "w-full bg-green-900/30 text-green-300 hover:bg-green-800/50"
    : "w-full bg-green-50 text-green-700 hover:bg-green-100";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {forms.map((form) => {
      const { level, icon } = calculateLevel((form.submissions ?? []).length);
      // Calculate achievements
      const achievements = [
        { 
          name: "First Submission", 
          icon: <Inbox className="w-6 h-6" />, 
          unlocked: (form.submissions ?? []).length >= 1,
          color: "text-blue-500"
        },
        { 
          name: "Five Submissions", 
          icon: <TrendingUp className="w-6 h-6" />, 
          unlocked: (form.submissions ?? []).length >= 5,
          color: "text-green-500"
        },
        { 
          name: "Twenty Submissions", 
          icon: <Star className="w-6 h-6" />, 
          unlocked: (form.submissions ?? []).length >= 20,
          color: "text-purple-500"
        },
        { 
          name: "Fifty Submissions", 
          icon: <Flame className="w-6 h-6" />, 
          unlocked: (form.submissions ?? []).length >= 50,
          color: "text-orange-500"
        },
        { 
          name: "One Hundred Submissions", 
          icon: <Trophy className="w-6 h-6" />, 
          unlocked: (form.submissions ?? []).length >= 100,
          color: "text-yellow-500"
        }
      ];
      
      const totalPoints = (form.submissions ?? []).length * 10;
      
      return (
        <Card key={form.id} className={cardClasses}>
          <div className={headerBgClasses}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{form.title}</h3>
              <div className={pointsBadgeClasses}>
                <Star className="text-yellow-300 w-4 h-4" />
                <span className="font-bold">{totalPoints} XP</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className={levelContainerClasses}>
                {icon}
              </div>
              <div>
                <div className="text-sm opacity-80">Current Level</div>
                <div className="text-2xl font-bold">Level {level}</div>
                <div className={progressBarBgClasses}>
                  <div 
                    className={progressBarFillClasses}
                    style={{ width: `${Math.min((form.submissions ?? []).length * 2, 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex justify-between mb-4">
              <div>
                <div className={submissionLabelClasses}>Submissions</div>
                <div className={submissionValueClasses}>{(form.submissions ?? []).length}</div>
              </div>
              <div>
                <div className={updatedLabelClasses}>Last Updated</div>
                <div className={updatedValueClasses}>{new Date(form.updatedAt ?? new Date()).toLocaleDateString('en-US')}</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className={achievementHeaderClasses}>
                <Award className={achievementIconClasses} />
                Achievements
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {achievements.map((achievement, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col items-center p-2 rounded-lg border ${
                      achievement.unlocked 
                        ? achievementUnlockedClasses
                        : achievementLockedClasses
                    }`}
                  >
                    <div className={achievement.unlocked ? achievement.color : resolvedTheme === 'dark' ? "text-gray-500" : "text-gray-400"}>
                      {achievement.icon}
                    </div>
                    <div className={`text-xs text-center mt-1 font-medium ${resolvedTheme === 'dark' ? "text-gray-300" : "text-gray-700"}`}>
                      {achievement.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="px-6 pb-6 pt-0 flex gap-3">
            <Button variant="outline" className={editButtonClasses} asChild>
              <Link href={`/forms/${form.id}`}>Edit Form</Link>
            </Button>
            <Button variant="secondary" className={analyticsButtonClasses} asChild>
              <Link href={`/submissions/${form.id}`}>Analytics</Link>
            </Button>
          </CardFooter>
        </Card>
      );
    })}
  </div>
  );
}