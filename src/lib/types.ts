import { DefaultSession } from "next-auth";
import { JsonValue } from "next-auth/adapters";
import { FormColors } from '@/app/(dashboard)/forms/[formId]/_components/settings/FormThemeCustomizer';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      googleEmail?: string;
      googleAuthUser?: string;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      refreshTokenExpires?: number;
    } & DefaultSession["user"];
  }
}

export interface FieldType {
  id: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 
        'checkbox' | 'radio' | 'textarea' | 'file' | 'cta' | 
        'password' | 'url' | 'range' | 'search';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  checkboxOptions?: string[];
  radioOptions?: string[];
  checkboxLabel?: string;
  radioLabel?: string;
  min?: number;
  max?: number;
  rows?: number;
  pattern?: string;
  helpText?: string;
  
  // Layout properties
  columnSpan: number; // 1-12 columns (default: 12)
  rowId?: string; // For grouping fields in rows
  
  // File upload properties
  fileAccept?: string;
  fileMultiple?: boolean;
  fileMaxSize?: number; // MB
  
  // CTA properties
  ctaText?: string;
  ctaType?: 'button' | 'link' | 'submit';
  ctaStyle?: 'primary' | 'secondary' | 'outline' | 'ghost';
  ctaAction?: 'link' | 'nextStep' | 'prevStep' | 'submit';
  ctaIcon?: string;
  ctaLink?: string;
  
  // Advanced
  customType?: string; // For HTML5 special input types
  validation?: {
    regex?: string;
    minLength?: number;
    maxLength?: number;
  };
}


export interface FormConfig {
  fields: FieldType[]
  settings?: {
    columnsLayout?: number // 1-3 columns
    submitButtonText?: string
    successMessage?: string
  }
}

export type Form = {
  id: string;
  title: string;
  description?: string | null;
  fields: FieldType[] | JsonValue;
  userId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  submissions?: Submission[];
  config?: FormConfig;
  scriptId?: string | null;
  scriptUrl?: string | null;
  sheetId?: string | null;
  deploymentId?: string | null;
  sheetUrl?: string | null;
  submitButtonText?: string | null;
  colors?: FormColors | JsonValue; // Accept both FormColors and JsonValue
  isArchived?: boolean; // Add this if it's in your database
};

export type Submission = {
  id: string;
  createdAt: Date;
  data: JsonValue;
  formId: string;
};

export type UserMenuProps = {
  name?: string | null;
  image?: string;
};

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  refreshTokenExpires?: number;
  googleAuthUser?: string;
}

export interface ExtendedSession {
  user?: SessionUser;
  expires: string;
}