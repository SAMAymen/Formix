'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormBuilder } from '@/components/form-builder'
import { FieldType } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { PlusCircle, Save, X, Trophy, Zap, LayoutTemplate, FileSpreadsheet, ArrowLeft, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '@/providers/theme-provider' // Add theme provider import
import { getDefaultColors } from '../[formId]/_components/settings/FormThemeCustomizer'; // Add import for default colors

export default function NewFormPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme() // Get current theme and resolved theme
  const [formTitle, setFormTitle] = useState('Untitled Form')
  const [fields, setFields] = useState<FieldType[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [submitButtonText, setSubmitButtonText] = useState('Submit');

  // Theme-specific styles
  const pageBackgroundClasses = resolvedTheme === 'dark'
    ? "bg-gradient-to-b from-gray-900 to-gray-800"
    : "bg-gradient-to-b from-green-50 to-emerald-50";
    
  const backButtonClasses = resolvedTheme === 'dark'
    ? "text-emerald-400 hover:bg-gray-800"
    : "text-green-700 hover:bg-green-50";
    
  const titleClasses = resolvedTheme === 'dark'
    ? "text-gray-200"
    : "text-gray-800";
    
  const iconClasses = resolvedTheme === 'dark'
    ? "text-emerald-500"
    : "text-green-600";
    
  const badgeClasses = resolvedTheme === 'dark'
    ? "bg-emerald-900/30 text-emerald-300 border-emerald-800"
    : "bg-green-100 text-green-800";
    
  const cardClasses = resolvedTheme === 'dark'
    ? "border-gray-700 bg-gray-800 hover:shadow-gray-700"
    : "border-green-100 hover:shadow-lg";
    
  const cardHeaderLineClasses = resolvedTheme === 'dark'
    ? "bg-emerald-600"
    : "bg-green-400";
    
  const inputClasses = resolvedTheme === 'dark'
    ? "text-gray-200"
    : "";
    
  const cardFooterClasses = resolvedTheme === 'dark'
    ? "border-gray-700"
    : "border-green-100";
    
  const cancelButtonClasses = resolvedTheme === 'dark'
    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
    : "border-green-200 text-green-700 hover:bg-green-50";
    
  const saveButtonClasses = resolvedTheme === 'dark'
    ? "bg-emerald-700 hover:bg-emerald-600 text-white"
    : "bg-green-600 hover:bg-green-700 text-white";
    
  const statsCardClasses = resolvedTheme === 'dark'
    ? "border-gray-700 bg-gray-800/50"
    : "border-green-100 bg-green-50/50";
    
  const statsTextClasses = resolvedTheme === 'dark'
    ? "text-emerald-400"
    : "text-green-800";
    
  const statsValueClasses = resolvedTheme === 'dark'
    ? "text-emerald-500"
    : "text-green-700";
    
  const achievementCardClasses = resolvedTheme === 'dark'
    ? "bg-emerald-900/30 border-emerald-800"
    : "bg-green-100 border-green-200";
    
  const achievementTitleClasses = resolvedTheme === 'dark'
    ? "text-emerald-300"
    : "text-green-800";
    
  const achievementTextClasses = resolvedTheme === 'dark'
    ? "text-emerald-400"
    : "text-green-700";

  const addField = (type: FieldType['type']) => {
    const newFields = [...fields, {
      id: `field-${uuidv4()}`,
      type,
      label: 'New Field',
      required: false,
      countryCode: 'MA',
      options: type === 'select' ? ['Option 1'] : undefined,
      columnSpan: 1
    }]
    if(!validateField(newFields[newFields.length - 1])) return
    setFields(newFields)

    if (fields.length === 0) {
      setShowAchievement(true)
      setTimeout(() => setShowAchievement(false), 3000)
    }
  }

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast({
        title: 'Missing title',
        description: 'Please enter a title for your form',
        variant: 'destructive'
      })
      return
    }
    if (fields.length === 0) {
      toast({
        title: 'No fields',
        description: 'Please add at least one field to your form',
        variant: 'destructive'
      })
      return
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          fields: fields.map(field => ({
            ...field,
            options: field.type === 'select' ? field.options : undefined
          }))
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.error || 'Failed to save form');
  
      router.push(`/forms/${data.id}`);
  
      toast({
        title: "Form created successfully",
        description: `Redirecting to edit page...`,
      });
  
    } catch (error) {
      toast({
        title: "Error saving form",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error("Save error:", error);
    }
  };

  const handleCreateForm = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/forms/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formTitle,
          fields: fields,
          // Add default colors based on current theme
          colors: getDefaultColors(resolvedTheme === 'dark' ? 'dark' : 'light')
        }),
      });
      
      // Rest of function remains the same
    } catch (error) {
      toast({
        title: "Error creating form",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error("Create error:", error);
    }
  };

  const validateField = (field: FieldType) => {
    if (!field.label.trim()) return false;
    if (field.type === 'select' && !field.options?.length) return false;
    return true;
  };

  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-4 ${pageBackgroundClasses} min-h-screen`}>
      {showAchievement && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed top-4 right-4"
        >
          <Card className={`p-4 flex items-center gap-3 ${achievementCardClasses}`}>
            <Trophy className={`w-5 h-5 ${iconClasses}`} />
            <div>
              <p className={`font-medium ${achievementTitleClasses}`}>First Field Added!</p>
              <p className={`text-sm ${achievementTextClasses}`}>+50 XP earned</p>
            </div>
          </Card>
        </motion.div>
      )}

      <Button variant="ghost" className={`pl-0 ${backButtonClasses}`} asChild>
        <a href="/dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </a>
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className={`text-xl font-bold flex items-center gap-2 ${titleClasses}`}>
          <LayoutTemplate className={`w-5 h-5 ${iconClasses}`} />
          Build a New Form
        </h1>
        <Badge variant="outline" className={badgeClasses}>
          <Zap className="w-4 h-4 mr-1" />
          Manual save
        </Badge>
      </div>

      <Card className={`group transition-shadow relative overflow-hidden ${cardClasses}`}>
        <CardHeader className="pb-2 relative">
          <div className="flex items-center group">
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className={`text-2xl font-bold border-none shadow-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md focus:outline-none ${inputClasses}`}
              placeholder="Untitled Form"
            />
            <span className={`text-xs opacity-0 group-hover:opacity-100 absolute right-4 transition-opacity duration-200 ${iconClasses}`}>
              <Pencil className="w-4 h-4" />
            </span>
          </div>
          <div className={`h-0.5 w-0 group-hover:w-full transition-all duration-300 ${cardHeaderLineClasses}`} />
        </CardHeader>

        <CardContent className="py-4">
          <FormBuilder 
            fields={fields} 
            onChange={setFields} 
            theme={resolvedTheme as 'dark' | 'light'} 
            submitButtonText={submitButtonText}
            onSubmitButtonTextChange={setSubmitButtonText}
          />
        </CardContent>

        <CardFooter className={`flex justify-end gap-3 border-t pt-4 ${cardFooterClasses}`}>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            disabled={isSaving}
            className={`px-4 py-2 ${cancelButtonClasses}`}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formTitle.trim()}
            className={`px-4 py-2 ${saveButtonClasses}`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Saving...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Form
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className={statsCardClasses}>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${statsTextClasses}`}>Fields Added</span>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className={`w-4 h-4 ${iconClasses}`} />
              <span className={`font-medium ${statsValueClasses}`}>{fields.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}