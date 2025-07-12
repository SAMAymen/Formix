'use client'
import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldType, Form } from '@/lib/types'
import { Loader2, ArrowLeft, Copy, CheckCircle, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { TabContent } from '@/app/(dashboard)/forms/[formId]/_components/tabs/TabContent'
import { JsonValue } from 'next-auth/adapters'
import { useTheme } from '@/providers/theme-provider'
import { getDefaultColors } from '@/app/(dashboard)/forms/[formId]/_components/settings/FormThemeCustomizer'; 

declare global {
    interface Window {
        SheetsFormConfig: {
            [key: string]: {
                theme: string
                formId: string
                fieldTypes?: Record<string, string>
                colors?: {
                    primary?: string
                    border?: string
                    background?: string
                    text?: string
                    lightText?: string
                    error?: string
                    success?: string
                }
                preserveColors?: boolean  // Add this property
            }
        }
    }
}

function isFieldTypeArray(fields: FieldType[] | JsonValue | undefined): fields is FieldType[] {
    if (!fields) return false;
    return Array.isArray(fields) && fields.every(field =>
        typeof field === 'object' && field !== null &&
        'id' in field &&
        'type' in field &&
        'label' in field
    );
}

export default function FormPreviewPage(props: { params: Promise<{ formId: string }> }) {
    const params = use(props.params);
    const { toast } = useToast()
    const router = useRouter()
    const { theme, resolvedTheme } = useTheme() // Get current theme and resolved theme
    const [form, setForm] = useState<Form>()
    const scriptLoaded = useRef(false)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'preview' | 'embed' | 'share'>('preview')
    const [copied, setCopied] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [setupError, setSetupError] = useState(false)
    const [phoneValidationError, setPhoneValidationError] = useState(false)

    // Theme-specific styles
    const pageBackgroundClasses = resolvedTheme === 'dark'
        ? "bg-gradient-to-b from-gray-900 to-gray-800"
        : "bg-gradient-to-b from-green-50 to-emerald-50";

    const backButtonClasses = resolvedTheme === 'dark'
        ? "text-emerald-400 hover:bg-gray-800"
        : "text-green-700 hover:bg-green-50";

    const cardClasses = resolvedTheme === 'dark'
        ? "border-gray-700 bg-gray-800 shadow-md hover:shadow-lg hover:shadow-gray-800/20"
        : "border-green-100 bg-white shadow-md hover:shadow-lg hover:shadow-green-100/50";

    const badgeClasses = resolvedTheme === 'dark'
        ? "bg-emerald-900/50 text-emerald-300 border-emerald-800 font-medium"
        : "bg-green-100 text-green-800 border-green-200 font-medium";

    const tabHeaderClasses = resolvedTheme === 'dark'
        ? "border-gray-700"
        : "border-green-100";

    const activeTabClasses = resolvedTheme === 'dark'
        ? "bg-emerald-900/50 text-emerald-300 font-medium"
        : "bg-green-100 text-green-700 font-medium";

    const formContainerClasses = resolvedTheme === 'dark'
        ? "bg-gray-700 border-gray-600"
        : "bg-gray-50 border-gray-200";

    const cardTitleClasses = resolvedTheme === 'dark'
        ? "text-gray-100"
        : "text-gray-800";

    const infoBoxClasses = resolvedTheme === 'dark'
        ? "bg-blue-900/30 border-blue-800 text-blue-300"
        : "bg-blue-50 border-blue-200 text-blue-600";

    const infoBoxButtonClasses = resolvedTheme === 'dark'
        ? "border-blue-800 text-blue-300 hover:bg-blue-900/40"
        : "border-blue-200 text-blue-700 hover:bg-blue-100";

    const templates = {
        error: (message: string) => resolvedTheme === 'dark'
            ? `<div class="p-4 text-red-400 border border-red-900 rounded-md bg-red-900/20">${message}</div>`
            : `<div class="p-4 text-red-600 border border-red-200 rounded-md bg-red-50">${message}</div>`
    };

    useEffect(() => {
        if (form?.id && activeTab === 'preview') {
            const container = document.getElementById(`sheetsform-${form.id}`);
            if (!container) return;

            window.SheetsFormConfig = window.SheetsFormConfig || {};
            const fieldsArray = isFieldTypeArray(form.fields) ? form.fields : [];

            window.SheetsFormConfig[form.id] = {
                theme: theme === 'system' ? resolvedTheme : theme,
                formId: form.id,
                // Use database colors if available, otherwise use theme-based defaults
                colors: typeof form.colors === 'object' && form.colors !== null && !Array.isArray(form.colors) 
                    ? form.colors 
                    : getDefaultColors(resolvedTheme === 'dark' ? 'dark' : 'light'),
                fieldTypes: fieldsArray.reduce((acc: Record<string, string>, field) => ({
                    ...acc,
                    [field.label]: field.type
                }), {})
            };

            container.innerHTML = '<div class="sf-loading"></div>';

            const script = document.createElement('script');
            script.src = '/client.js';
            script.defer = true;
            script.dataset.formId = form.id;

            script.onerror = () => {
                console.error('Failed to load client.js');
                container.innerHTML = templates.error('Failed to load form resources');
            };

            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
                delete window.SheetsFormConfig[form.id];
                container.innerHTML = '';
            };
        }
    }, [form, activeTab, theme, resolvedTheme]); // Add theme dependency

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const response = await fetch(`/api/forms/${params.formId}`)
                if (!response.ok) throw new Error('Form not found')
                const data = await response.json()
                setForm(data)
            } catch (error) {
                toast({
                    title: 'Error loading form',
                    description: error instanceof Error ? error.message : 'Unknown error',
                    variant: 'destructive'
                })
                router.push('/dashboard')
            } finally {
                setLoading(false)
            }
        }

        fetchForm()
    }, [params.formId, router, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setSetupError(false)

        try {
            const formData = new FormData(e.target as HTMLFormElement)
            const data = Object.fromEntries(
                Array.from(formData.entries()).map(([key, value]) => {
                    const field = isFieldTypeArray(form?.fields)
                        ? form.fields.find((f: FieldType) => f.label === key)
                        : undefined
                    return [
                        key,
                        field?.type === 'number' ? Number(value) : value
                    ]
                })
            )

            const response = await fetch(`/api/submit/${params.formId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    origin: window.location.origin
                })
            })

            const result = await response.json()
            if (result.error) {
                if (result.error.includes('Google Sheets API Error')) {
                    setSetupError(true)
                    throw new Error('Google Sheets connection failed')
                }
                throw new Error(result.error)
            }

            setSubmitSuccess(true)
            toast({
                title: 'Form submitted successfully!',
                description: 'Data has been saved to Google Sheets',
                className: resolvedTheme === 'dark' 
                    ? 'bg-green-900/30 border-green-800' 
                    : 'bg-green-100 border-green-200'
            })
        } catch (error) {
            toast({
                title: 'Submission failed',
                description: error instanceof Error ? error.message : 'Please try again',
                variant: 'destructive'
            })
        } finally {
            setSubmitting(false)
        }
    }

    const generateEmbedCode = () => {
        if (!form?.id) return '';

        const fieldsConfig = isFieldTypeArray(form.fields)
            ? form.fields.map((f: FieldType) => {
                // Field configuration logic here
            })
            : [];
        
        // Create a serialized colors object if it exists
        const colorsConfig = form.colors 
            ? `data-colors='${JSON.stringify(form.colors)}'` 
            : '';

        return `
<!-- Form Integration Start -->
<div id="sheetsform-${form.id}" 
  ${colorsConfig}
  data-form-id="${form.id}"
  style="min-height: 300px;"
></div>
<script>
  window.SheetsFormConfig = window.SheetsFormConfig || {};
  window.SheetsFormConfig["${form.id}"] = {
    formId: "${form.id}",
    colors: ${form.colors ? JSON.stringify(form.colors) : 'undefined'}
  };
</script>
<script src="${window.location.origin}/client.js" defer data-form-id="${form.id}"></script>
<!-- Form Integration End -->
        `.trim();
    }

    const generateShareableUrl = () => {
        if (!form?.id) return '';
        return `${window.location.origin}/form/${form.id}`;
    };

    if (loading) {
        return (
            <div className={`p-8 max-w-3xl mx-auto ${pageBackgroundClasses}`}>
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className={`h-9 w-24 ${resolvedTheme === 'dark' ? 'bg-gray-700' : ''}`} />
                    <Skeleton className={`h-9 w-36 ${resolvedTheme === 'dark' ? 'bg-gray-700' : ''}`} />
                </div>
                <Card className={cardClasses}>
                    <CardHeader>
                        <Skeleton className={`h-6 w-48 ${resolvedTheme === 'dark' ? 'bg-gray-700' : ''}`} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className={`h-4 w-32 ${resolvedTheme === 'dark' ? 'bg-gray-700' : ''}`} />
                                <Skeleton className={`h-9 w-full ${resolvedTheme === 'dark' ? 'bg-gray-700' : ''}`} />
                            </div>
                        ))}
                        <Skeleton className={`h-9 w-24 ${resolvedTheme === 'dark' ? 'bg-gray-700' : ''}`} />
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleTabChange = (tab: 'preview' | 'embed' | 'share') => {
        if (activeTab === 'preview' && tab !== 'preview') {
            const container = document.getElementById(`sheetsform-${form?.id}`);
            if (container) container.innerHTML = '';
        }
        setActiveTab(tab);
    }

    return (
        <div className={`p-4 sm:p-6 md:p-8 max-w-3xl mx-auto ${pageBackgroundClasses} min-h-screen`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
                <Button
                    variant="ghost"
                    className={`${backButtonClasses} w-full sm:w-auto justify-start`}
                    onClick={() => router.push(`/forms/${params.formId}`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Editor
                </Button>
                <Badge variant="outline" className={`${badgeClasses} self-start sm:self-auto`}>
                    Preview Mode
                </Badge>
            </div>

            {setupError && (
                <Alert variant="destructive" className={`mb-4 ${resolvedTheme === 'dark' ? 'bg-red-900/20 border-red-900 text-red-400' : ''}`}>
                    <AlertTitle>Google Sheets Connection Error</AlertTitle>
                    <AlertDescription className="text-sm">
                        <p>Google Sheets integration failed. Please:</p>
                        <ol className="list-decimal pl-5 mt-2">
                            <li>Verify Google Sheets connection in form settings</li>
                            <li>Check OAuth permissions</li>
                            <li>Ensure spreadsheet ID is correct</li>
                            <li>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`mt-2 ${resolvedTheme === 'dark' ? 'border-red-800 text-red-400 hover:bg-red-900/30' : ''}`}
                                    onClick={() => router.push(`/forms/${params.formId}/settings`)}
                                >
                                    Check Settings
                                </Button>
                            </li>
                        </ol>
                    </AlertDescription>
                </Alert>
            )}

            {phoneValidationError && (
                <Alert variant="destructive" className={`mb-4 ${resolvedTheme === 'dark' ? 'bg-red-900/20 border-red-900 text-red-400' : ''}`}>
                    <AlertTitle>Validation Error</AlertTitle>
                    <AlertDescription>
                        <p>Phone number validation failed. Please check:</p>
                        <ul className="list-disc pl-5 mt-2">
                            <li>Phone number format is correct</li>
                            <li>Number isn't already registered</li>
                            <li>Country code is properly selected</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {form?.sheetId && (
                <div className={`mb-4 p-3 sm:p-4 rounded-md flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 ${infoBoxClasses}`}>
                    <CheckCircle className={`w-5 h-5 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                        <p className={`font-medium ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-800'} text-sm sm:text-base`}>Google Sheets Connected!</p>
                        <p className={`text-xs sm:text-sm ${resolvedTheme === 'dark' ? 'text-blue-400/80' : 'text-blue-700'}`}>
                            Responses are being saved directly to your Google Sheet
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className={`mt-2 sm:mt-0 sm:ml-auto text-xs sm:text-sm w-full sm:w-auto ${infoBoxButtonClasses}`}
                        asChild
                    >
                        <a href={`https://docs.google.com/spreadsheets/d/${form.sheetId}`} target="_blank" rel="noopener noreferrer">
                            Open Sheet
                        </a>
                    </Button>
                </div>
            )}

            <Card className={`transition-shadow ${cardClasses}`}>
                <FormTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    headerClassName={tabHeaderClasses}
                    theme={resolvedTheme}
                >
                    <TabContent active={activeTab === 'preview'}>
                        <CardHeader className="px-3 py-4 sm:px-6 sm:py-6">
                            <CardTitle className={`text-xl sm:text-2xl break-words ${cardTitleClasses}`}>
                                {form?.title || 'Untitled Form'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                            <div
                                id={`sheetsform-${form?.id}`}
                                className={`border rounded-lg p-3 sm:p-4 ${formContainerClasses}`}
                                style={{ minHeight: '400px' }}
                            >
                                {!form && <div className={`text-center p-4 sm:p-8 ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Loader2 className="animate-spin inline-block mr-2" />
                                    Loading form configuration...
                                </div>}
                            </div>
                        </CardContent>
                    </TabContent>

                    <TabContent active={activeTab === 'embed'}>
                        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
                            <div className="relative">
                                <SyntaxHighlighter
                                    language="html"
                                    style={atomOneDark}
                                    customStyle={{ 
                                        borderRadius: '0.5rem', 
                                        padding: '1rem', 
                                        fontSize: '0.75rem'
                                    }}
                                    className="sm:text-sm sm:p-6"
                                >
                                    {generateEmbedCode()}
                                </SyntaxHighlighter>

                                <Button
                                    size="sm"
                                    className="absolute top-2 right-2 sm:top-4 sm:right-4 gap-1 sm:gap-2 text-xs sm:text-sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(generateEmbedCode())
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 2000)
                                    }}
                                >
                                    {copied ? (
                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    ) : (
                                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    )}
                                    <span className="text-white">{copied ? 'Copied!' : 'Copy'}</span>
                                </Button>
                            </div>

                            <div className={`p-3 sm:p-4 rounded-md border ${infoBoxClasses}`}>
                                <p className={`text-xs sm:text-sm mb-2 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                    Customize the form style with these CSS variables:
                                </p>
                                <SyntaxHighlighter
                                    language="css"
                                    style={atomOneDark}
                                    customStyle={{
                                        background: 'transparent',
                                        padding: 0,
                                        fontSize: '0.75rem'
                                    }}
                                    className="sm:text-sm"
                                >
                                    {`:root {
  /* Primary color for buttons and accents */
  --sf-primary: ${(form?.colors as any)?.primary || (resolvedTheme === 'dark' ? '#10b981' : '#16a34a')};
  
  /* Border color for inputs and containers */
  --sf-border: ${(form?.colors as any)?.border || (resolvedTheme === 'dark' ? '#374151' : '#e5e7eb')};
  
  /* Background color for the form container */
  --sf-background: ${(form?.colors as any)?.background || (resolvedTheme === 'dark' ? '#1f2937' : '#ffffff')};
  
  /* Text color for labels and content */
  --sf-text: ${(form?.colors as any)?.text || (resolvedTheme === 'dark' ? '#f1f5f9' : '#202124')};
  
  /* Input field colors */
  --sf-input-bg: ${(form?.colors as any)?.inputBackground || (resolvedTheme === 'dark' ? '#111827' : '#fcfcfc')};
  --sf-input-text: ${(form?.colors as any)?.inputText || (resolvedTheme === 'dark' ? '#e5e7eb' : '#202124')};
  --sf-placeholder: ${(form?.colors as any)?.placeholderText || (resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af')};
  
  /* Button hover color */
  --sf-button-hover: ${(form?.colors as any)?.buttonHover || (resolvedTheme === 'dark' ? '#059669' : '#15803d')};
  
  /* Input focus color */
  --sf-input-focus: ${(form?.colors as any)?.inputBorderFocus || (resolvedTheme === 'dark' ? '#065f46' : '#86efac')};
  
  /* Card background color */
  --sf-card-bg: ${(form?.colors as any)?.cardBackground || (resolvedTheme === 'dark' ? '#1e293b' : '#f8faf8')};
  
  /* Other customizable properties */
  --sf-font: system-ui, sans-serif;
  --sf-light-text: ${(form?.colors as any)?.lightText || (resolvedTheme === 'dark' ? '#94a3b8' : '#5f6368')};
  --sf-error: ${(form?.colors as any)?.error || (resolvedTheme === 'dark' ? '#ef4444' : '#dc2626')};
  --sf-success: ${(form?.colors as any)?.success || (resolvedTheme === 'dark' ? '#10b981' : '#16a34a')};
}`}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </TabContent>

                    <TabContent active={activeTab === 'share'}>
                        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-4 border rounded-md mb-4 gap-2">
                                    <input
                                        className={`flex-1 py-2 px-3 border rounded-md ${resolvedTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-200'}`}
                                        value={generateShareableUrl()}
                                        readOnly
                                    />
                                    <Button
                                        size="sm"
                                        className="sm:ml-2 whitespace-nowrap"
                                        onClick={() => {
                                            navigator.clipboard.writeText(generateShareableUrl())
                                            setCopied(true)
                                            setTimeout(() => setCopied(false), 2000)
                                        }}
                                    >
                                        {copied ? (
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                        ) : (
                                            <Copy className="w-4 h-4 mr-2" />
                                        )}
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </Button>
                                </div>
                                
                                <div className={`p-3 sm:p-4 rounded-md border ${infoBoxClasses}`}>
                                    <div className="flex items-start">
                                        <Info className={`w-5 h-5 mr-3 flex-shrink-0 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                                        <div>
                                            <p className={`font-medium ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-800'} text-sm sm:text-base`}>
                                                Share this link with your audience
                                            </p>
                                            <p className={`text-xs sm:text-sm mt-1 ${resolvedTheme === 'dark' ? 'text-blue-400/80' : 'text-blue-700'}`}>
                                                Anyone with this link can fill out and submit your form. Responses will be collected automatically in your dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabContent>
                </FormTabs>
            </Card>
        </div>
    )
}

interface FormTabsProps {
    activeTab: 'preview' | 'embed' | 'share'  // Added 'share'
    onTabChange: (tab: 'preview' | 'embed' | 'share') => void  // Updated parameter type
    children: React.ReactNode
    headerClassName?: string
    theme?: string // Add theme prop
}

function FormTabs({
    activeTab,
    onTabChange,
    children,
    headerClassName,
    theme = 'light' // Default to light theme
}: FormTabsProps) {
    const activeTabClasses = theme === 'dark'
        ? "bg-emerald-900/30 text-emerald-300"
        : "bg-green-50 text-green-700";

    return (
        <div>
            <div className={`flex flex-wrap gap-2 border-b ${headerClassName || 'border-green-100'} pb-3 px-3 sm:px-6 sm:pb-4`}>
                <Button
                    variant={activeTab === 'preview' ? 'secondary' : 'ghost'}
                    className={`text-xs sm:text-sm ${activeTab === 'preview' ? activeTabClasses : ''}`}
                    onClick={() => onTabChange('preview')}
                >
                    Preview
                </Button>
                <Button
                    variant={activeTab === 'embed' ? 'secondary' : 'ghost'}
                    className={`text-xs sm:text-sm ${activeTab === 'embed' ? activeTabClasses : ''}`}
                    onClick={() => onTabChange('embed')}
                >
                    Embed Code
                </Button>
                {/* New Share Link button */}
                <Button
                    variant={activeTab === 'share' ? 'secondary' : 'ghost'}
                    className={`text-xs sm:text-sm ${activeTab === 'share' ? activeTabClasses : ''}`}
                    onClick={() => onTabChange('share')}
                >
                    Share Link
                </Button>
            </div>

            {children}
        </div>
    )
}