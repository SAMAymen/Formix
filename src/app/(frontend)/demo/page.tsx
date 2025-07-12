"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileSpreadsheet, ExternalLink, ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DemoPage() {
  const videoId = "XGHaSAiZWvs";
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const [imageError, setImageError] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
        
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center mb-4">
            <span className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white mr-3">
              <FileSpreadsheet className="h-6 w-6" />
            </span>
            <h1 className="text-3xl font-bold text-gray-800">
              Formix Demo
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how easy it is to create beautiful forms that automatically sync with Google Sheets
          </p>
        </motion.div>
        
        {/* Video Thumbnail Container */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-green-100">
            {/* Decorative browser header */}
            <div className="w-full p-2 bg-gray-50 border-b border-green-100 flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            
            {/* Video Thumbnail */}
            <div 
              className="aspect-video relative cursor-pointer group hover:bg-gray-50 transition-colors"
              onClick={() => window.open(youtubeUrl, '_blank')}
            >
              {!imageError ? (
                <img 
                  src={thumbnailUrl} 
                  alt="Formix Demo Video Thumbnail" 
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  onError={() => setImageError(true)}
                />
              ) : (
                // Fallback when YouTube thumbnail fails
                <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileSpreadsheet className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Formix Demo Video</h3>
                    <p className="text-gray-600">Click to watch on YouTube</p>
                  </div>
                </div>
              )}
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="h-10 w-10 text-white ml-1" />
                </div>
              </div>
              
              {/* YouTube branding */}
              <div className="absolute bottom-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                YouTube
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Demo Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Simple Form Building",
              description: "Create custom forms with our intuitive drag-and-drop builder - no coding required."
            },
            {
              title: "Real-time Sync", 
              description: "Form submissions are automatically sent to your Google Sheet in real-time."
            },
            {
              title: "Beautiful Design",
              description: "Customize colors, fonts and styles to match your brand identity."
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
              className="bg-white rounded-xl p-6 shadow-md border border-green-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
        
        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-lg mb-6 text-gray-700">
            Ready to try Formix for yourself?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Link href="/dashboard">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}