'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

interface ThemePreviewProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  }
}

export function ThemePreview({ colors }: ThemePreviewProps) {
  return (
    <div className="rounded-md border p-4 bg-card">
      <h3 className="mb-4 font-medium">Theme Preview</h3>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {/* Color swatches */}
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-12 rounded-md shadow-sm" 
              style={{ backgroundColor: colors.primary }}
            />
            <span className="text-xs mt-1">Primary</span>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-12 rounded-md shadow-sm" 
              style={{ backgroundColor: colors.secondary }}
            />
            <span className="text-xs mt-1">Secondary</span>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-12 rounded-md shadow-sm" 
              style={{ backgroundColor: colors.accent }}
            />
            <span className="text-xs mt-1">Accent</span>
          </div>
        </div>
        
        {/* UI element previews */}
        <Card className="p-3 space-y-2">
          <div 
            className="h-8 rounded-md flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: colors.primary }}
          >
            Button
          </div>
          <div className="flex gap-2">
            <div 
              className="h-6 w-6 rounded-md"
              style={{ backgroundColor: colors.secondary }}
            ></div>
            <div className="h-6 bg-background flex-1 rounded-md border"></div>
          </div>
          <div 
            className="h-1 rounded-full"
            style={{ backgroundColor: colors.accent }}
          ></div>
        </Card>
      </div>
    </div>
  )
}