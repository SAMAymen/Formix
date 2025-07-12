"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Paintbrush, RotateCcw, Save, Check } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { getThemeColors } from '@/lib/colors';
import { ColorPicker } from "@/components/custom/ColorPicker";

export interface FormColors {
  primary: string;
  border: string;
  background: string;
  text: string;
  lightText: string;
  error: string;
  success: string;
  // New color properties
  inputBackground: string;
  inputText: string;
  buttonHover: string;
  inputBorderFocus: string;
  placeholderText: string;
  checkboxBackground: string;
  radioBorder: string;
  cardBackground: string;
}

// Default colors for light and dark themes
const defaultLightColors: FormColors = {
  primary: "#16a34a",
  border: "#e5e7eb",
  background: "#ffffff",
  text: "#202124",
  lightText: "#5f6368",
  error: "#dc2626",
  success: "#16a34a",
  // New light theme defaults
  inputBackground: "#fcfcfc",
  inputText: "#202124",
  buttonHover: "#15803d",
  inputBorderFocus: "#86efac",
  placeholderText: "#9ca3af",
  checkboxBackground: "#ffffff",
  radioBorder: "#d1d5db",
  cardBackground: "#f8faf8",
};

const defaultDarkColors: FormColors = {
  primary: "#10b981",
  border: "#374151",
  background: "#1f2937",
  text: "#f1f5f9",
  lightText: "#94a3b8",
  error: "#ef4444",
  success: "#10b981",
  // New dark theme defaults
  inputBackground: "#111827",
  inputText: "#e5e7eb",
  buttonHover: "#059669",
  inputBorderFocus: "#065f46",
  placeholderText: "#6b7280",
  checkboxBackground: "#111827",
  radioBorder: "#4b5563",
  cardBackground: "#1e293b",
};

interface FormThemeCustomizerProps {
  colors: FormColors;
  onColorsChange: (colors: FormColors) => void;
  onSave?: () => void; // Add this line
}

// Update the FormThemeCustomizer component

export function FormThemeCustomizer({ colors, onColorsChange, onSave }: FormThemeCustomizerProps) {
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();
  
  // Initialize with database colors if available, otherwise use defaults
  const initialColors = colors || getDefaultColors(resolvedTheme === 'dark' ? 'dark' : 'light');
  const [localColors, setLocalColors] = useState<FormColors>(initialColors);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // When resolvedTheme changes, update localColors only if no database colors are present
  useEffect(() => {
    if (!colors) {
      setLocalColors(getDefaultColors(resolvedTheme === 'dark' ? 'dark' : 'light'));
    }
  }, [resolvedTheme, colors]);

  const handleColorChange = (key: keyof FormColors, value: string) => {
    const newColors = { ...localColors, [key]: value };
    setLocalColors(newColors);
    onColorsChange(newColors);
  };

  const resetToDefaults = () => {
    const defaults = resolvedTheme === 'dark' ? defaultDarkColors : defaultLightColors;
    setLocalColors(defaults);
    onColorsChange(defaults);
  };

  const saveColors = async () => {
    setIsSaving(true);
    
    try {
      const pathname = window.location.pathname;
      const formId = pathname.split('/').pop();
      
      const response = await fetch(`/api/forms/${formId}/colors`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ colors: localColors }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save colors');
      }
      
      // Show success state
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      
      toast({
        title: "Colors saved",
        description: "Your form color theme has been updated",
      });
      
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not save colors",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cardClasses = resolvedTheme === 'dark'
    ? "border-gray-700 bg-gray-800"
    : "border-green-100";

  const cardTitleClasses = resolvedTheme === 'dark'
    ? "text-gray-200"
    : "text-gray-800";

  const labelClasses = resolvedTheme === 'dark'
    ? "font-medium text-gray-300"
    : "font-medium";

  return (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-lg font-semibold ${cardTitleClasses}`}>
          <Paintbrush className="w-5 h-5 inline-block mr-2" />
          Form Theme
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          className={resolvedTheme === 'dark' ? "text-gray-300" : ""}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={saveColors}
          disabled={isSaving}
          className={resolvedTheme === 'dark' ? "bg-emerald-700 hover:bg-emerald-600 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
        >
          {isSaving ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Saving...
            </span>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Colors
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className={labelClasses}>Primary Color</Label>
            <ColorPicker
              value={localColors.primary}
              onChange={(value) => handleColorChange('primary', value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className={labelClasses}>Border Color</Label>
            <ColorPicker
              value={localColors.border}
              onChange={(value) => handleColorChange('border', value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className={labelClasses}>Background Color</Label>
            <ColorPicker
              value={localColors.background}
              onChange={(value) => handleColorChange('background', value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className={labelClasses}>Text Color</Label>
            <ColorPicker
              value={localColors.text}
              onChange={(value) => handleColorChange('text', value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className={labelClasses}>Error Color</Label>
            <ColorPicker
              value={localColors.error}
              onChange={(value) => handleColorChange('error', value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className={labelClasses}>Success Color</Label>
            <ColorPicker
              value={localColors.success}
              onChange={(value) => handleColorChange('success', value)}
            />
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6 border-gray-200 dark:border-gray-700">
          <h3 className={`text-md font-semibold mb-4 ${cardTitleClasses}`}>
            Advanced Colors
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={labelClasses}>Input Background</Label>
              <ColorPicker
                value={localColors.inputBackground}
                onChange={(value) => handleColorChange('inputBackground', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className={labelClasses}>Input Text</Label>
              <ColorPicker
                value={localColors.inputText}
                onChange={(value) => handleColorChange('inputText', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className={labelClasses}>Button Hover</Label>
              <ColorPicker
                value={localColors.buttonHover}
                onChange={(value) => handleColorChange('buttonHover', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className={labelClasses}>Input Focus Border</Label>
              <ColorPicker
                value={localColors.inputBorderFocus}
                onChange={(value) => handleColorChange('inputBorderFocus', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className={labelClasses}>Placeholder Text</Label>
              <ColorPicker
                value={localColors.placeholderText}
                onChange={(value) => handleColorChange('placeholderText', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className={labelClasses}>Card Background</Label>
              <ColorPicker
                value={localColors.cardBackground}
                onChange={(value) => handleColorChange('cardBackground', value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const getDefaultColors = (theme: 'light' | 'dark'): FormColors => {
  return getThemeColors(theme);
};