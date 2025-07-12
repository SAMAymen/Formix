'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  disabled?: boolean
}

export function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
  const [color, setColor] = useState(value || '#000000')
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    setColor(value)
  }, [value])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }
  
  const handleSave = () => {
    onChange(color)
    setIsOpen(false)
  }
  
  const handleCancel = () => {
    setColor(value)
    setIsOpen(false)
  }
  
  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-between" 
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full border border-gray-200" 
                style={{ backgroundColor: color }}
              />
              <span>{color}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-4">
            <div>
              <div 
                className="w-full h-24 rounded-md mb-2" 
                style={{ backgroundColor: color }} 
              />
              <Input 
                type="color" 
                value={color}
                onChange={handleChange}
                className="h-10 w-full" 
              />
            </div>
            <Input 
              type="text" 
              value={color} 
              onChange={handleChange}
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button 
                type="button" 
                size="sm"
                onClick={handleSave}
              >
                <Check className="h-4 w-4 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}