'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Star, Trophy } from "lucide-react";

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stars, setStars] = useState(0);
  
  useEffect(() => {
    setTimeout(() => setProgress(65), 500);
  }, []);
  
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setStars(stars + 5);
    }
  };
  
  const phases = [
    { label: "Phase 1", name: "Planning", status: "Completed", color: "text-green-600" },
    { label: "Phase 2", name: "Development", status: "In Progress", color: "text-yellow-600" },
    { label: "Phase 3", name: "Launch", status: "Pending", color: "text-gray-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
              <Trophy className="h-6 w-6" />Development Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Development Status</span>
                <span className="text-green-600">{progress}%</span>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                  style={{ width: `${progress}%`, transition: 'width 1.5s ease-out' }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-6">
                {phases.map((phase, i) => (
                  <div key={i} className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                    <Badge className="mb-2 bg-green-100 text-green-800">{phase.label}</Badge>
                    <span className="text-xs">{phase.name}</span>
                    <span className={`${phase.color} font-bold`}>{phase.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Something Awesome Is Coming
          </h2>
          
          <p className="text-lg text-gray-600 mt-4">
            We're working hard to bring you an amazing new feature. Stay tuned!
          </p>
          
          {!subscribed ? (
            <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-r-lg"
                >
                  Notify Me
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Get <span className="text-green-600 font-bold">5 bonus stars</span> when you subscribe!</p>
            </form>
          ) : (
            <div className="p-4 bg-green-100 rounded-lg text-green-800 mt-8 max-w-md mx-auto">
              Thanks for subscribing! We'll notify you when we launch.
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          {[
            { title: "Advanced Analytics", description: "Powerful insights to track and optimize your forms." },
            { title: "Custom Templates", description: "Create beautiful forms with our template system." },
            { title: "Integration Hub", description: "Connect forms with your favorite tools." }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-green-100 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              <Badge className="mt-4 bg-green-100 text-green-800">Coming Soon</Badge>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-green-100 py-8 px-4 mt-12 text-center text-gray-500 text-sm">
        <p className="mb-4">Have questions? Contact me at samoudiaymen.contact@gmail.com</p>
        <p>&copy; {new Date().getFullYear()} Formix. All rights reserved.</p>
      </footer>
    </div>
  );
}