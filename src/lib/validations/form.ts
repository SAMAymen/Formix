// src/lib/validations/form.ts
import { z } from 'zod'

export const FieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(['text', 'select', 'checkbox', /* other types */]),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  // Add these new fields
  checkboxOptions: z.array(z.string()).optional(),
  checkboxLabel: z.string().optional()
})

export const FormCreateSchema = z.object({
  title: z.string().min(1, "Form title is required").max(100),
  description: z.string().max(200).optional(),
  fields: z.array(FieldSchema).min(1, "At least one field is required")
})

export const DeploymentSchema = z.object({
  code: z.string().min(1, "Script code is required"),
  sheetId: z.string().min(1, "Sheet ID is required")
})

export type FormCreateValues = z.infer<typeof FormCreateSchema>
export type DeploymentValues = z.infer<typeof DeploymentSchema>