'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Download, Upload } from 'lucide-react'
import { useState } from 'react'
import { BrandingConfig } from '@/config/branding'

interface ThemeExporterProps {
  currentTheme: Partial<BrandingConfig>;
  onThemeImport: (theme: Partial<BrandingConfig>) => void;
}

export function ThemeExporter({ currentTheme, onThemeImport }: ThemeExporterProps) {
  const { toast } = useToast()
  const [isImporting, setIsImporting] = useState(false)
  
  const handleExport = () => {
    try {
      const themeData = JSON.stringify(currentTheme)
      const blob = new Blob([themeData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = 'formix-theme.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      toast({
        title: "Theme exported",
        description: "Your theme settings have been exported to a file."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export theme"
      })
    }
  }
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        if (typeof event.target?.result !== 'string') {
          throw new Error("Invalid file format")
        }
        
        const theme = JSON.parse(event.target.result) as Partial<BrandingConfig>
        
        // Validate that we have at least the colors
        if (!theme.colors || typeof theme.colors !== 'object') {
          throw new Error("Invalid theme format: missing colors")
        }
        
        // Apply the imported theme
        onThemeImport(theme)
        
        toast({
          title: "Theme imported",
          description: "The theme settings have been applied."
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: error instanceof Error ? error.message : "Invalid theme file"
        })
      } finally {
        setIsImporting(false)
        // Reset input value so the same file can be selected again
        e.target.value = ''
      }
    }
    
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "Failed to read the theme file."
      })
      setIsImporting(false)
    }
    
    reader.readAsText(file)
  }
  
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button variant="outline" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export Theme
      </Button>
      <Button variant="outline" asChild disabled={isImporting}>
        <label className="cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          {isImporting ? 'Importing...' : 'Import Theme'}
          <input 
            type="file" 
            accept=".json" 
            className="sr-only" 
            onChange={handleImport}
            disabled={isImporting}
          />
        </label>
      </Button>
    </div>
  )
}