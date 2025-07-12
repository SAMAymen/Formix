'use client'
import { useEffect, useState, useRef, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, CheckCircle, Info, ShieldCheck, HelpCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FieldType, Form } from '@/lib/types'
import { JsonValue } from 'next-auth/adapters'
import { getDefaultColors } from '@/app/(dashboard)/forms/[formId]/_components/settings/FormThemeCustomizer'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Helper function to type check fields
function isFieldTypeArray(fields: FieldType[] | JsonValue | undefined): fields is FieldType[] {
  if (!fields) return false;
  return Array.isArray(fields) && fields.every(field =>
    typeof field === 'object' && field !== null &&
    'id' in field &&
    'type' in field &&
    'label' in field
  );
}

export default function PublicFormPage(props: { params: Promise<{ formId: string }> }) {
  const params = use(props.params);
  const { toast } = useToast()
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Error template
  const errorTemplate = (message: string) => 
    `<div class="p-4 text-red-600 border border-red-200 rounded-md bg-red-50">${message}</div>`;

  // Fetch form data
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/emb-form/${params.formId}`);
        
        if (!response.ok) {
          throw new Error('Form not found or is no longer available');
        }
        
        const data = await response.json();
        setForm(data);
      } catch (err) {
        console.error('Error loading form:', err);
        setError(err instanceof Error ? err.message : 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [params.formId]);

  // Load and initialize the form client script
  useEffect(() => {
    if (form?.id) {
      const container = document.getElementById(`sheetsform-${form.id}`);
      if (!container) return;

      // Configure form for the client script
      window.SheetsFormConfig = window.SheetsFormConfig || {};
      const fieldsArray = isFieldTypeArray(form.fields) ? form.fields : [];

      window.SheetsFormConfig[form.id] = {
        theme: 'light',
        formId: form.id,
        colors: typeof form.colors === 'object' && form.colors !== null && !Array.isArray(form.colors) 
          ? form.colors 
          : getDefaultColors('light'),
        fieldTypes: fieldsArray.reduce((acc: Record<string, string>, field) => ({
          ...acc,
          [field.label]: field.type
        }), {}),
        preserveColors: true
      };

      container.innerHTML = '<div class="sf-loading"></div>';

      const script = document.createElement('script');
      script.src = '/client.js';
      script.defer = true;
      script.dataset.formId = form.id;
      scriptRef.current = script;

      script.onerror = () => {
        console.error('Failed to load client.js');
        container.innerHTML = errorTemplate('Failed to load form resources');
      };

      // Add event listener for form submission
      window.addEventListener('sheetsFormSubmitSuccess', () => {
        setSubmitSuccess(true);
        toast({
          title: 'Form submitted successfully!',
          description: 'Thank you for your submission.',
          className: 'bg-green-100 border-green-200'
        });
      });

      document.body.appendChild(script);

      return () => {
        if (scriptRef.current) {
          document.body.removeChild(scriptRef.current);
        }
        delete window.SheetsFormConfig[form.id];
        window.removeEventListener('sheetsFormSubmitSuccess', () => {});
      };
    }
  }, [form, toast]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 px-4 py-6 sm:p-8 md:p-12 flex items-center justify-center">
        <div className="text-center w-full max-w-md mx-auto">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mx-auto mb-4" />
          <p className="text-gray-800 text-base sm:text-lg">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 px-4 py-6 sm:p-8 md:p-12 flex items-center justify-center">
        <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl border-green-100 bg-white shadow-md">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-xl sm:text-2xl text-gray-800">Form Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-600">
              <AlertTitle className="text-base sm:text-lg">Error</AlertTitle>
              <AlertDescription className="mt-2">
                {error || "This form could not be loaded. It may have been deleted or is no longer accessible."}
              </AlertDescription>
              <AlertDescription className="mt-3 text-sm sm:text-base">
                If you expected to see a form here, please contact the form owner 
                to verify the form link or check if you have the necessary permissions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state (after form submission)
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 px-4 py-8 sm:p-8 md:p-12 flex items-center justify-center">
        <Card className="w-full max-w-md sm:max-w-lg border-green-100 bg-white transition-all duration-300 shadow-md">
          <CardHeader className="space-y-4 pb-6">
            <div className="mx-auto bg-green-100 rounded-full p-3 sm:p-4 mb-2">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl text-gray-800 text-center">Submission Received</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertTitle className="text-base sm:text-lg">Success!</AlertTitle>
              <AlertDescription className="mt-2 text-sm sm:text-base">
                Thank you for your submission. Your response has been recorded.
              </AlertDescription>
            </Alert>
            
            <div className="text-center pt-2 pb-4">
              <p className="text-sm sm:text-base text-gray-600">
                You can now close this page or submit another response.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // The form itself
  return (
    <div className="min-h-screen px-3 py-6 sm:px-6 sm:py-8 md:p-12 lg:p-16 bg-gradient-to-b from-green-50 to-emerald-50">
      <div className="max-w-3xl md:max-w-4xl mx-auto">
        <Card className="border border-gray-200 bg-white shadow-md overflow-hidden">
          <CardHeader className="space-y-3 bg-gray-50 border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl text-gray-800 leading-tight">
              {form.title || "Untitled Form"}
            </CardTitle>
            
            {form.description ? (
              <p className="text-sm sm:text-base text-gray-600 max-w-prose">
                {form.description}
              </p>
            ) : (
              <p className="text-sm sm:text-base text-gray-500">
                Please fill out the information below. All fields marked with an asterisk (*) are required.
              </p>
            )}
          </CardHeader>
          
          <Separator className="bg-gray-300" />
          
          <div className="px-4 sm:px-6 py-3 bg-blue-50 rounded-t-none rounded-b-lg border-t border-gray-200">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
              <div className="text-xs sm:text-sm space-y-1">
                <p className="text-gray-700">
                  Your responses will be securely stored and only accessible to authorized personnel.
                </p>
              </div>
            </div>
          </div>
          
          <CardContent className="pt-6 pb-8 px-4 sm:px-6 md:px-8 bg-white">
            <div
              id={`sheetsform-${form.id}`}
              className="border border-gray-300 rounded-lg p-3 sm:p-5 bg-gray-50 transition-all duration-300"
              style={{ minHeight: '400px' }}
            >
              <div className="text-center p-4 sm:p-6 md:p-8">
                <Loader2 className="animate-spin inline-block mr-2 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-base sm:text-lg">Loading form...</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between px-1 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                <span>Your data is secure</span>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>Need help?</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-64 sm:w-72 text-xs sm:text-sm">
                      If you're having trouble submitting this form, please try refreshing the page or contact the form owner for assistance.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm flex items-center justify-center gap-1.5 text-gray-600">
            Powered by{' '}
            <span className="font-medium text-gray-800">
              Formix
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
