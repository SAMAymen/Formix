'use client'
import { DndContext, closestCenter, DragEndEvent, TouchSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { FieldType } from '@/lib/types'
import { useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useTheme } from '@/providers/theme-provider'

interface FormBuilderProps {
  fields: FieldType[]
  onChange: (fields: FieldType[]) => void
  theme?: 'dark' | 'light'
  submitButtonText: string;
  onSubmitButtonTextChange: (text: string) => void;
}

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  theme?: string // Add theme prop
}

// Update the TagInput component for better mobile support
const TagInput = ({ value, onChange, disabled, theme = 'light' }: TagInputProps) => {
  const { resolvedTheme } = useTheme()
  const actualTheme = resolvedTheme || theme

  // Update all conditionals to use actualTheme
  const inputClasses = actualTheme === 'dark'
    ? "bg-gray-700 border-gray-600 text-gray-200"
    : "";
    
  const badgeClasses = actualTheme === 'dark'
    ? "bg-emerald-900/30 text-emerald-300 border-emerald-800"
    : "bg-primary text-primary-foreground";
    
  const buttonClasses = actualTheme === 'dark'
    ? "bg-emerald-800 hover:bg-emerald-700 text-emerald-100"
    : "";

  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !inputValue.trim()) return
    if (['Enter', 'Tab', ','].includes(e.key)) {
      e.preventDefault()
      onChange([...new Set([...value, inputValue.trim()])])
      setInputValue('')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {value.map((tag, index) => (
          <Badge key={index} variant="outline" className={`px-2 sm:px-3 py-1 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 ${badgeClasses}`}>
            {tag}
            {!disabled && (
              <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="text-muted-foreground hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {!disabled && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Input 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder="Type option text" 
            className={`text-sm ${inputClasses}`}
          />
          <Button 
            type="button" 
            onClick={() => inputValue.trim() && onChange([...value, inputValue.trim()])} 
            size="sm"
            className={`mt-1 sm:mt-0 ${buttonClasses}`}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  )
}

// Update OptionsConfigurator for better mobile support
const OptionsConfigurator = ({ options, label, onUpdateOptions, onUpdateLabel, disabled, type, theme = 'light' }: {
  options: string[]
  label: string
  onUpdateOptions: (options: string[]) => void
  onUpdateLabel: (label: string) => void
  disabled?: boolean
  type: 'checkbox' | 'radio'
  theme?: string
}) => {
  // Add this to get system theme preferences
  const { resolvedTheme } = useTheme()
  // Use resolvedTheme with fallback to the prop
  const actualTheme = resolvedTheme || theme
  
  // Update all conditionals to use actualTheme
  const labelClasses = actualTheme === 'dark'
    ? "text-gray-400"
    : "text-muted-foreground";
    
  const inputClasses = actualTheme === 'dark'
    ? "bg-gray-700 border-gray-600 text-gray-200"
    : "";
    
  const buttonClasses = actualTheme === 'dark'
    ? "border-gray-600 hover:bg-gray-700 text-gray-300"
    : "";
  
  const destructiveButtonClasses = actualTheme === 'dark'
    ? "text-red-400 hover:text-red-300"
    : "text-destructive hover:text-destructive/80";
    
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className={`text-xs sm:text-sm ${labelClasses}`}>Main Question</Label>
        <Input 
          value={label} 
          onChange={e => onUpdateLabel(e.target.value)} 
          placeholder={`Enter ${type} question`} 
          disabled={disabled} 
          className={`text-sm ${inputClasses}`}
        />
      </div>
      <div className="space-y-1">
        <Label className={`text-xs sm:text-sm ${labelClasses}`}>Options</Label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-1 sm:gap-2 mt-2">
            <Input 
              value={option} 
              onChange={e => onUpdateOptions(options.map((o, i) => i === index ? e.target.value : o))} 
              placeholder={`Option ${index + 1}`} 
              disabled={disabled}
              className={`text-sm ${inputClasses}`}
            />
            {!disabled && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onUpdateOptions(options.filter((_, i) => i !== index))} 
                className={`p-1 ${destructiveButtonClasses}`}
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
        ))}
        {!disabled && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onUpdateOptions([...options, `Option ${options.length + 1}`])} 
            className={`w-full mt-2 border-dashed text-xs sm:text-sm ${buttonClasses}`}
          >
            <Plus className="w-3 h-3 mr-1 sm:mr-2" /> Add Option
          </Button>
        )}
      </div>
    </div>
  )
}

function FormFieldComponent({ field, onUpdate, onRemove, isDisabled, theme = 'light' }: {
  field: FieldType
  onUpdate: (field: FieldType) => void
  onRemove: () => void
  isDisabled?: boolean
  theme?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id, disabled: isDisabled })

  const style = { transform: CSS.Transform.toString(transform), transition }

  const { resolvedTheme } = useTheme()
  const actualTheme = resolvedTheme || theme

  // Improved column span classes with better small screen handling
  const getColumnSpanClass = (span?: number) => {
    switch (span) {
      case 1: return 'col-span-12 md:col-span-12';
      case 2: return 'col-span-12 sm:col-span-6 md:col-span-6';
      case 3: return 'col-span-12 sm:col-span-6 md:col-span-4';
      default: return 'col-span-12';
    }
  };

  // Theme-specific styles
  const themeClasses = {
    fieldBorder: actualTheme === 'dark' 
      ? "border-gray-700 bg-gray-800 hover:border-emerald-700" 
      : "bg-background hover:border-primary",
    dragHandle: actualTheme === 'dark'
      ? "text-gray-400 hover:bg-gray-700"
      : "text-muted-foreground hover:bg-accent",
    expandButton: actualTheme === 'dark'
      ? "text-gray-400 hover:bg-gray-700"
      : "text-muted-foreground hover:bg-accent",
    destructiveButton: actualTheme === 'dark'
      ? "text-red-400 hover:text-red-300"
      : "text-destructive hover:text-destructive/80",
    borderTop: actualTheme === 'dark'
      ? "border-gray-700"
      : "",
    select: actualTheme === 'dark'
      ? "bg-gray-700 text-gray-200 border-gray-600"
      : "bg-background",
    label: actualTheme === 'dark'
      ? "text-gray-300"
      : "",
    subLabel: actualTheme === 'dark'
      ? "text-gray-400"
      : "text-muted-foreground",
    input: actualTheme === 'dark'
      ? "bg-gray-700 border-gray-600 text-gray-200"
      : ""
  }

  const handleUpdateOptions = useCallback((options: string[]) => {
    const key = field.type === 'checkbox' ? 'checkboxOptions' : 'radioOptions'
    onUpdate({ ...field, [key]: options })
  }, [field, onUpdate])

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "group relative p-3 sm:p-4 mb-3 sm:mb-4 border rounded-lg", 
        getColumnSpanClass(field.columnSpan),
        !isDisabled && "hover:shadow-sm", 
        themeClasses.fieldBorder
      )}
    >
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          {!isDisabled && (
            <button 
              {...attributes} 
              {...listeners} 
              className={`cursor-grab p-1 sm:p-2 rounded-md ${themeClasses.dragHandle}`}
            >
              <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          <Input 
            value={field.label} 
            onChange={e => onUpdate({ ...field, label: e.target.value })} 
            placeholder="Field label" 
            readOnly={isDisabled} 
            className={`text-sm sm:text-base ${themeClasses.input}`}
          />
          <button 
            type="button" 
            onClick={() => setExpanded(!expanded)} 
            className={`p-1 sm:p-2 rounded-md ${themeClasses.expandButton}`}
          >
            {expanded ? 
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : 
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            }
          </button>
          {!isDisabled && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRemove} 
              className={`p-1 ${themeClasses.destructiveButton}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        {expanded && (
          <div className={`space-y-3 sm:space-y-4 pt-2 border-t ${themeClasses.borderTop}`}>
            {/* Field type and settings - Improved layout wrapping */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* Field type selector */}
              <div className="w-full">
                <Select 
                  value={field.type} 
                  onValueChange={value => onUpdate({ ...field, type: value as FieldType['type'] })} 
                  disabled={isDisabled}
                >
                  <SelectTrigger className={`w-full ${themeClasses.select}`}>
                    <SelectValue placeholder="Field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['text','email','tel','number','date','select','checkbox','radio','textarea','cta'].map(type => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Controls layout - make layout more flexible */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Column Span Selector - more compact */}
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Label className={`${themeClasses.label} whitespace-nowrap text-sm`}>Width:</Label>
                  <Select 
                    value={(field.columnSpan || 1).toString()}
                    onValueChange={v => onUpdate({ ...field, columnSpan: Number(v) })}
                  >
                    <SelectTrigger className={`w-full ${themeClasses.select}`}>
                      <SelectValue placeholder="Columns" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3].map(cols => (
                        <SelectItem key={cols} value={cols.toString()}>
                          {cols === 1 ? 'Full' : cols === 2 ? '1/2' : '1/3'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Required toggle control - more compact */}
                {field.type !== 'cta' && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Switch 
                      checked={field.required} 
                      onCheckedChange={required => onUpdate({ ...field, required })} 
                      disabled={isDisabled} 
                      className={actualTheme === 'dark' 
                        ? "data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-gray-600" 
                        : "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200"
                      }
                    >
                      <span className="sr-only">Required</span>
                    </Switch>
                    <Label className={`${themeClasses.label} text-sm`}>Required</Label>
                  </div>
                )}
              </div>
            </div>
            
            {/* CTA Configuration */}
            {field.type === 'cta' && (
              <div className="space-y-2">
                <Label className={`text-sm ${themeClasses.label}`}>Button Text</Label>
                <Input
                  value={field.ctaText || 'Submit'}
                  onChange={e => onUpdate({ ...field, ctaText: e.target.value })}
                  className={themeClasses.input}
                />
              </div>
            )}

            {field.type === 'select' && (
              <div className="space-y-2">
                <Label className={`text-sm ${themeClasses.label}`}>Options</Label>
                <TagInput 
                  value={field.options || []} 
                  onChange={options => onUpdate({ ...field, options })} 
                  disabled={isDisabled} 
                  theme={actualTheme}
                />
              </div>
            )}
            {(field.type === 'checkbox' || field.type === 'radio') && (
              <OptionsConfigurator
                type={field.type}
                options={field.type === 'checkbox' ? field.checkboxOptions || [] : field.radioOptions || []}
                label={field.type === 'checkbox' ? field.checkboxLabel || '' : field.radioLabel || ''}
                onUpdateOptions={handleUpdateOptions}
                onUpdateLabel={label => onUpdate({ ...field, [`${field.type}Label`]: label })}
                disabled={isDisabled}
                theme={actualTheme}
              />
            )}
            {field.type === 'number' && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="w-full sm:flex-1">
                  <Label className={`block text-sm mb-1 ${themeClasses.subLabel}`}>Minimum value</Label>
                  <Input 
                    type="number" 
                    value={field.min?.toString() || ''} 
                    onChange={e => onUpdate({ ...field, min: Number(e.target.value) })}
                    className={themeClasses.input}
                  />
                </div>
                <div className="w-full sm:flex-1">
                  <Label className={`block text-sm mb-1 ${themeClasses.subLabel}`}>Maximum value</Label>
                  <Input 
                    type="number" 
                    value={field.max?.toString() || ''} 
                    onChange={e => onUpdate({ ...field, max: Number(e.target.value) })}
                    className={themeClasses.input}
                  />
                </div>
              </div>
            )}
            {field.type === 'textarea' && (
              <div className="flex items-center gap-2">
                <div className="w-24 sm:w-32">
                  <Label className={`block text-sm mb-1 ${themeClasses.subLabel}`}>Rows</Label>
                  <Input 
                    type="number" 
                    value={field.rows?.toString() || ''} 
                    onChange={e => onUpdate({ ...field, rows: Number(e.target.value) })}
                    className={themeClasses.input}
                  />
                </div>
                <span className={`text-xs sm:text-sm ${themeClasses.subLabel}`}>Textarea height</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function FormBuilder({ fields, onChange, theme: themeProp = 'light', submitButtonText, onSubmitButtonTextChange }: FormBuilderProps) {
  const { resolvedTheme } = useTheme()
  const actualTheme = resolvedTheme || themeProp
  const [selectedType, setSelectedType] = useState<FieldType['type']>('text')
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  // Theme-specific styles - use actualTheme
  const buttonClasses = actualTheme === 'dark'
    ? "border-gray-600 hover:bg-gray-700 text-gray-300"
    : "";

  const selectClasses = actualTheme === 'dark'
    ? "bg-gray-700 text-gray-200 border-gray-600"
    : "bg-background";

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    if (!over) return
    const oldIndex = fields.findIndex(f => f.id === active.id)
    const newIndex = fields.findIndex(f => f.id === over.id)
    onChange(arrayMove(fields, oldIndex, newIndex))
  }, [fields, onChange])

  const addNewField = () => {
    const newField: FieldType = {
      id: `field-${Date.now()}`,
      type: selectedType,
      label: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Field`,
      required: false,
      columnSpan: 1,
      ...(selectedType === 'cta' && { ctaText: 'Submit' })
    }
    onChange([...fields, newField])
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-12 gap-2 sm:gap-4">
            {fields.map(field => (
              <FormFieldComponent
                key={field.id}
                field={field}
                onUpdate={updated => onChange(fields.map(f => f.id === updated.id ? updated : f))}
                onRemove={() => onChange(fields.filter(f => f.id !== field.id))}
                isDisabled={false}
                theme={actualTheme}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
        <Select value={selectedType} onValueChange={v => setSelectedType(v as FieldType['type'])}>
          <SelectTrigger className={`w-full sm:w-[200px] ${selectClasses}`}>
            <SelectValue placeholder="Select field type" />
          </SelectTrigger>
          <SelectContent>
            {['text','email','tel','number','date','select','checkbox','radio','textarea','cta'].map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={addNewField}
          className={`w-full sm:w-auto mt-1 sm:mt-0 ${buttonClasses}`}
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Add Field
        </Button>
      </div>
    </div>
  )
}