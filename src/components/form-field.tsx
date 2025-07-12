// src/components/form-field.tsx
'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from './ui/button'
import { FieldType } from '@/lib/types'

export function FormField({ 
  field,
  onUpdate,
  onRemove
}: { 
  field: FieldType
  onUpdate: (field: FieldType) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-background p-4 rounded-lg border mb-4">
      <div className="flex items-center gap-4 mb-4">
        <button {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <Input
          value={field.label}
          onChange={(e) => onUpdate({ ...field, label: e.target.value })}
          placeholder="Field Label"
        />
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
      
      {field.type === 'text' && (
        <Input placeholder="Text input" disabled />
      )}
      
      {field.type === 'select' && field.options && (
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option, i) => (
              <SelectItem key={i} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}