import { JsonValue } from '@prisma/client/runtime/library';
import { FormColors } from '@/app/(dashboard)/forms/[formId]/_components/settings/FormThemeCustomizer';

export function colorsToPrisma(colors: FormColors): JsonValue {
  return colors as unknown as JsonValue;
}

export function colorsFromPrisma(jsonValue: JsonValue): FormColors {
  return jsonValue as unknown as FormColors;
}