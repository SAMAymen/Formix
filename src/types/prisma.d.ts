import { Form as PrismaForm, Submission as PrismaSubmission } from '@prisma/client';

declare module '@prisma/client' {
  interface Form extends PrismaForm {
    submissions: PrismaSubmission[];
  }
  
  interface Submission extends PrismaSubmission {
    data: Record<string, any>;
  }
}