"use client";
import { Button } from "@/components/ui/button";
import { FormColors } from './FormThemeCustomizer';

interface FormColorPreviewProps {
  colors: FormColors;
  resolvedTheme: string;
  showMobileControls?: boolean;
  containerClassName?: string;
}

export function FormColorPreview({ 
  colors, 
  resolvedTheme, 
  showMobileControls = true,
  containerClassName = "relative md:h-[calc(100vh-200px)]"
}: FormColorPreviewProps) {
  return (
    <div className={containerClassName}>
      <div 
        id="color-preview"
        className="md:sticky md:top-4 border rounded-md p-6 overflow-auto" 
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
      >
        <h3 style={{ color: colors.text, fontWeight: 'bold', marginBottom: '1rem' }}>
          Form Color Preview
        </h3>
        
        <div className="mb-4">
          <label style={{ color: colors.text, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            Text Input
          </label>
          <input 
            type="text" 
            placeholder="Placeholder text"
            style={{ 
              width: '100%',
              padding: '0.75rem',
              backgroundColor: colors.inputBackground,
              color: colors.inputText,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.375rem',
              fontSize: '0.9rem'
            }}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            style={{ 
              backgroundColor: colors.primary, 
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.buttonHover}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary}
          >
            Submit Button
          </button>
          
          <div 
            style={{ 
              backgroundColor: '#fef2f2', 
              color: colors.error,
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              borderLeft: `4px solid ${colors.error}`
            }}
          >
            Error Message
          </div>
        </div>
        
        <div 
          style={{ 
            backgroundColor: colors.cardBackground, 
            padding: '1rem',
            borderRadius: '0.375rem',
            border: `1px solid ${colors.border}`
          }}
        >
          <p style={{ color: colors.text, marginBottom: '0.5rem' }}>Card Sample</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="sample-checkbox" 
              style={{ accentColor: colors.primary }}
            />
            <label 
              htmlFor="sample-checkbox" 
              style={{ color: colors.text, fontSize: '0.9rem' }}
            >
              Checkbox option
            </label>
          </div>
        </div>
        
        {/* Mobile-only button to scroll back to color options */}
        {showMobileControls && (
          <div className="md:hidden mt-4 text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={resolvedTheme === 'dark' ? "border-gray-700 bg-gray-800 text-gray-200" : ""}
            >
              Back to Color Options
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}