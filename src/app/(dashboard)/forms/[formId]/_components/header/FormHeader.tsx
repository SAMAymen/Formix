// _components/header/FormHeader.tsx
import { useTheme } from '@/providers/theme-provider'
import { useState } from 'react'
import { ChevronLeft, Save, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FormHeaderProps {
  title: string
  onTitleChange: (title: string) => void
  onSave: () => void
  onPreview: () => void
  onBack: () => void
  isSaving: boolean
  showSave: boolean
  showPreview: boolean
  theme?: string // Keep theme prop for backwards compatibility
}

export function FormHeader({
  title,
  onTitleChange,
  onSave,
  onPreview,
  onBack,
  isSaving,
  showSave,
  showPreview,
  theme: themeProp = 'light' // Rename to themeProp for clarity
}: FormHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localTitle, setLocalTitle] = useState(title)
  
  // Add this to get system theme preferences
  const { resolvedTheme } = useTheme()
  // Use resolvedTheme with fallback to the prop
  const actualTheme = resolvedTheme || themeProp

  // Theme-specific styles - update to use actualTheme
  const backButtonClasses = actualTheme === 'dark'
    ? "text-gray-300 hover:bg-gray-800"
    : "hover:bg-gray-100";
    
  const titleClasses = actualTheme === 'dark'
    ? "text-gray-200"
    : "text-gray-800";
    
  const inputClasses = actualTheme === 'dark'
    ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-emerald-700"
    : "border-gray-300 focus:ring-emerald-500";
    
  const saveButtonClasses = actualTheme === 'dark'
    ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border-blue-800"
    : "bg-blue-50 text-blue-600 hover:bg-blue-100";
    
  const previewButtonClasses = actualTheme === 'dark'
    ? "bg-green-900/30 text-green-400 hover:bg-green-900/50 border-green-800"
    : "bg-green-50 text-green-600 hover:bg-green-100";

  const handleTitleSubmit = () => {
    onTitleChange(localTitle)
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className={`h-8 w-8 md:h-10 md:w-10 ${backButtonClasses}`}
        >
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <Input
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className={`text-lg md:text-xl font-semibold ${inputClasses}`}
              autoFocus
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            />
            <Button 
              size="sm" 
              onClick={handleTitleSubmit}
              className={actualTheme === 'dark' ? "bg-emerald-700 hover:bg-emerald-600" : ""}
            >
              Save
            </Button>
          </div>
        ) : (
          <h1 
            className={`text-lg md:text-xl font-semibold cursor-pointer ${titleClasses}`}
            onClick={() => setIsEditing(true)}
          >
            {title}
          </h1>
        )}
      </div>

      <div className="flex gap-2 ml-auto w-full md:w-auto justify-end">
        {showSave && (
          <Button
            onClick={onSave}
            variant="outline"
            disabled={isSaving}
            className={`w-full md:w-auto ${saveButtonClasses}`}
          >
            {isSaving ? "Saving..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        )}
        
        {showPreview && (
          <Button
            variant="outline"
            onClick={onPreview}
            className={`w-full md:w-auto ${previewButtonClasses}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        )}
      </div>
    </div>
  )
}