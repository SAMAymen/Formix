// components/layout-selector.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, LayoutDashboard, ListFilter } from "lucide-react";
import { Form } from "@/lib/types";
import LeaderboardLayout from "./leaderboard-layout";
import AchievementLayout from "./achievement-layout";
import CardLayout from "./card-layout";

interface LayoutSelectorProps {
    forms: Form[];
}

export default function LayoutSelector({ forms }: LayoutSelectorProps) {
  const [activeLayout, setActiveLayout] = useState("card");

  return (
    <div className="mb-8">
      <Tabs defaultValue="card" value={activeLayout} onValueChange={setActiveLayout}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Your Form Collection</h2>
          <TabsList className="bg-green-50">
            <TabsTrigger value="card" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Card View
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <ListFilter className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="achievement" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="mt-6">
          <TabsContent value="card">
            <CardLayout forms={forms} />
          </TabsContent>
          <TabsContent value="leaderboard">
            <LeaderboardLayout forms={forms} />
          </TabsContent>
          <TabsContent value="achievement">
            <AchievementLayout forms={forms} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}