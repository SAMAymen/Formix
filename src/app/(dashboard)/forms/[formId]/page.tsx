"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { use } from "react"; // Add this import
import { useDebounce } from "use-debounce";
import { FormBuilder } from "@/components/form-builder"; // This should point to your new FormBuilder implementation
import { Form, FieldType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "./_components/shared/LoadingState";
import { ErrorState } from "./_components/shared/ErrorState";
import { FormTabs } from "./_components/tabs/FormTabs";
import { TabContent } from "./_components/tabs/TabContent";
import { ConnectSheet } from "./_components/integration/ConnectSheet";
import { ConnectionStatus } from "./_components/integration/ConnectionStatus";
import { FormDetails } from "./_components/sidebar/FormDetails";
import { DangerZone } from "./_components/sidebar/DangerZone";
import { useRouter } from "next/navigation";
import { FormHeader } from "./_components/header/FormHeader";
import { useTheme } from "@/providers/theme-provider";
import { FormThemeCustomizer, getDefaultColors, FormColors } from './_components/settings/FormThemeCustomizer';
import { FormColorPreview } from './_components/settings/FormColorPreview';
import { ReauthorizeGoogle } from '@/components/ReauthorizeGoogle';

// Type for API responses
interface ApiResponse<T> {
  data?: T;
  error?: string;
  redirectToLogin?: boolean;
}

export default function FormEditorPage(
  props: {
    params: Promise<{ formId: string }>;
  }
) {
  const params = use(props.params);
  const { toast } = useToast();
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  // Use React.use() to unwrap params, with proper TypeScript handling
  const unwrappedParams = 'formId' in params ? params : use(params as unknown as Promise<{ formId: string }>);
  const safeFormId = unwrappedParams.formId;

  // Consolidated form state
  const [formState, setFormState] = useState<{
    form: Form | null;
    loading: boolean;
    error: string | null;
    isSaving: boolean;
    isConnecting: boolean;
  }>({
    form: null,
    loading: true,
    error: null,
    isSaving: false,
    isConnecting: false,
  });

  const [activeTab, setActiveTab] = useState<"build" | "settings">("build");
  const [submitButtonText, setSubmitButtonText] = useState("Submit"); // New state for submit button text
  const [needsReauth, setNeedsReauth] = useState(false);

  // Debounce form field changes to reduce API calls
  const [debouncedForm] = useDebounce(formState.form, 500);

  // Validate formId to prevent injection attacks
  const formId = useMemo(() => {
    return safeFormId?.replace(/[^a-zA-Z0-9-]/g, "");
  }, [safeFormId]);

  // Theme-specific styles - use resolvedTheme
  const themeStyles = useMemo(
    () => ({
      pageBackground:
        resolvedTheme === "dark"
          ? "bg-gradient-to-b from-gray-900 to-gray-800"
          : "bg-gradient-to-b from-green-50 to-emerald-50",
      card:
        resolvedTheme === "dark"
          ? "border-gray-700 bg-gray-800"
          : "border-green-100",
      text: resolvedTheme === "dark" ? "text-gray-200" : "text-gray-800",
      secondaryText:
        resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600",
    }),
    [resolvedTheme]
  );

  // Fetch form data securely
  const fetchForm = useCallback(async () => {
    if (!formId) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        error: "Invalid form ID",
      }));
      return;
    }

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        headers: {
          "Content-Type": "application/json",
          // Add CSRF token if you have one
        },
        credentials: "include",
      });

      if (!response.ok) {
        // Handle unauthorized access
        if (response.status === 401 || response.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setFormState((prev) => ({
        ...prev,
        form: data,
        loading: false,
        error: null,
      }));

      // Set submit button text if it exists in the form data
      if (data.submitButtonText) {
        setSubmitButtonText(data.submitButtonText);
      }
    } catch (err) {
      console.error("Failed to load form:", err);
      setFormState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load form",
      }));
    }
  }, [formId, router]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  // Securely handle field changes
  const handleFieldsChange = useCallback((fields: FieldType[]) => {
    setFormState((prev) => {
      if (!prev.form) return prev;
      return {
        ...prev,
        form: {
          ...prev.form,
          fields: Array.isArray(fields) ? fields : [], // Ensure fields is always an array
        },
      };
    });
  }, []);

  // Handle submit button text change
  const handleSubmitButtonTextChange = useCallback((text: string) => {
    setSubmitButtonText(text);
    setFormState((prev) => {
      if (!prev.form) return prev;
      return {
        ...prev,
        form: {
          ...prev.form,
          submitButtonText: text,
        },
      };
    });
  }, []);

  // Improved Google Sheets connection flow
  const handleConnectSheets = useCallback(async () => {
    if (!formState.form) return;

    // Security check: validate form ID
    if (formState.form.id !== formId) {
      toast({
        title: "Security error",
        description: "Form ID mismatch. Please reload the page.",
        variant: "destructive",
      });
      return;
    }

    setFormState((prev) => ({ ...prev, isConnecting: true }));

    try {
      // Clear any persisted auth state
      sessionStorage.removeItem("googleReauthRequired");

      const response = await fetch("/api/deploy-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          formId: formState.form.id,
          sheetName: formState.form.title || "Untitled Form",
        }),
        credentials: "include",
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle authentication issues
        if (response.status === 401 && responseData.redirectToLogin) {
          toast({
            title: "Authentication required",
            description:
              "Your Google authorization has expired. Please re-authenticate.",
            duration: 5000,
          });

          // Use sessionStorage instead of localStorage for better security
          sessionStorage.setItem("returnUrl", window.location.pathname);

          // Force a complete sign-out and re-authentication using our custom endpoint
          try {
            const signOutResponse = await fetch("/api/auth/sign-out", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });

            if (signOutResponse.ok) {
              console.log("Successfully cleared Google tokens");

              // Next, fully sign out of NextAuth
              const nextAuthSignOut = await fetch("/api/auth/signout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ redirect: false }),
              });

              if (nextAuthSignOut.ok) {
                console.log("Successfully signed out of NextAuth");
              }
            }
          } catch (signOutError) {
            console.error("Error during sign-out:", signOutError);
          }

          window.location.href = "/login?reason=reauth&service=google&force=true";
          return;
        }

        throw new Error(responseData.error || "Failed to create Google Sheet");
      }

      if (!responseData.data?.sheetId || !responseData.data?.sheetUrl) {
        throw new Error("Invalid response from server");
      }

      const { sheetId, sheetUrl } = responseData.data;

      // Update form with new sheet data
      setFormState((prev) => ({
        ...prev,
        form: prev.form
          ? {
              ...prev.form,
              sheetId,
              sheetUrl,
            }
          : null,
      }));

      toast({ title: "Google Sheet created successfully!" });
      setNeedsReauth(false);
    } catch (error: any) {
      console.error("Google Sheets connection error:", error);

      // Check for reconnectRequired flag
      if (error.response?.data?.reconnectRequired || 
          (typeof error === 'object' && error !== null && 'reconnectRequired' in error)) {
        setNeedsReauth(true);
        return; // Exit early, don't show other error messages
      }

      // Simplified error handling - no duplicate toasts
      if (
        error.message?.includes("authentication") ||
        error.message?.includes("credentials") ||
        error.message?.includes("expired")
      ) {
        toast({
          title: "Authentication error",
          description: "You need to re-login to access Google Sheets",
          variant: "destructive",
        });

        sessionStorage.setItem("returnUrl", window.location.pathname);

        // Try to clear tokens first
        try {
          await fetch("/api/auth/sign-out", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("Error clearing tokens:", e);
        }

        router.push("/login?reason=reauth&service=google&force=true");
        return;
      } else {
        // For non-authentication errors
        toast({
          title: "Connection failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to connect to Google Sheets",
          variant: "destructive",
        });
      }
    } finally {
      setFormState((prev) => ({ ...prev, isConnecting: false }));
    }
  }, [formState.form, formId, router, toast]);

  // Secure form save functionality
  const handleSave = useCallback(async () => {
    if (!formState.form) return;

    // Validate form before saving
    if (!formState.form.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Form title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Security check: validate form ID
    if (formState.form.id !== formId) {
      toast({
        title: "Security error",
        description: "Form ID mismatch. Please reload the page.",
        variant: "destructive",
      });
      return;
    }

    setFormState((prev) => ({ ...prev, isSaving: true }));

    try {
      // Create a clean object with the data we want to send
      const formToSave = {
        ...formState.form,
        submitButtonText, // Include the submit button text
        colors: formState.form.colors || getDefaultColors(resolvedTheme === 'dark' ? 'dark' : 'light')
      };

      const response = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(formToSave),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedForm = await response.json();
      setFormState((prev) => ({
        ...prev,
        form: updatedForm,
        isSaving: false,
      }));

      toast({ title: "Form updated successfully!" });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: "The form could not be saved. Please try again.",
        variant: "destructive",
      });
      setFormState((prev) => ({ ...prev, isSaving: false }));
    }
  }, [formState.form, formId, router, toast, submitButtonText, resolvedTheme]);

  // Handle title change securely
  const handleTitleChange = useCallback((title: string) => {
    // Basic sanitation
    const sanitizedTitle = title.trim().slice(0, 100);

    setFormState((prev) => {
      if (!prev.form) return prev;
      return {
        ...prev,
        form: {
          ...prev.form,
          title: sanitizedTitle,
        },
      };
    });
  }, []);

  // Update the handleColorsChange function in FormEditorPage

  const handleColorsChange = useCallback((colors: FormColors) => {
    setFormState((prev) => {
      if (!prev.form) return prev;
      return {
        ...prev,
        form: {
          ...prev.form,
          colors: colors,
        },
      };
    });
  }, []);

  // Render loading state
  if (formState.loading) return <LoadingState />;

  // Render error state
  if (formState.error) return <ErrorState error={formState.error} />;

  // Render not found state
  if (!formState.form)
    return (
      <div
        className={`${themeStyles.text} p-8 flex justify-center items-center min-h-screen`}
      >
        Form not found
      </div>
    );

  if (needsReauth) {
    return (
      <div className="container mx-auto p-4">
        <ReauthorizeGoogle 
          onClose={() => setNeedsReauth(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6 ${themeStyles.pageBackground} min-h-screen ${themeStyles.text}`}
    >
      <FormHeader
        onSave={handleSave}
        onPreview={() => router.push(`/preview/${formState.form?.id}`)}
        onBack={() => router.push("/dashboard")}
        isSaving={formState.isSaving}
        title={formState.form?.title || ""}
        onTitleChange={handleTitleChange}
        showSave={!formState.form?.sheetId}
        showPreview={!!formState.form?.sheetId}
        theme={resolvedTheme}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <FormTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            theme={resolvedTheme}
          >
            <TabContent active={activeTab === "build"}>
              <FormBuilder
                fields={formState.form.fields as FieldType[]}
                onChange={handleFieldsChange}
                theme={resolvedTheme}
                submitButtonText={submitButtonText}
                onSubmitButtonTextChange={handleSubmitButtonTextChange}
              />
            </TabContent>

            <TabContent active={activeTab === "settings"}>
              <div className="space-y-6">
                {formState.form?.sheetId ? (
                  <ConnectionStatus theme={resolvedTheme} />
                ) : (
                  <ConnectSheet
                    onConnect={handleConnectSheets}
                    form={formState.form}
                    theme={resolvedTheme}
                    isConnecting={formState.isConnecting}
                  />
                )}
                <FormThemeCustomizer
                  colors={
                    (typeof formState.form?.colors === 'object' && formState.form.colors !== null) 
                      ? formState.form.colors as FormColors 
                      : getDefaultColors(resolvedTheme === 'dark' ? 'dark' : 'light')
                  }
                  onColorsChange={handleColorsChange}
                  onSave={handleSave} // Pass the main save function
                />
              </div>
            </TabContent>
          </FormTabs>
        </div>

<div className="space-y-4 md:space-y-6">
  <FormDetails
    updatedAt={formState.form?.updatedAt?.toString() || "Unknown"}
    fieldsCount={
      Array.isArray(formState.form?.fields)
        ? formState.form.fields.length
        : 0
    }
    theme={resolvedTheme}
  />
  <DangerZone form={formState.form} theme={resolvedTheme} />
    <div className="mt-4 sticky top-4">
    <FormColorPreview 
      colors={
      (typeof formState.form?.colors === 'object' && formState.form.colors !== null) 
        ? formState.form.colors as FormColors 
        : getDefaultColors(resolvedTheme === 'dark' ? 'dark' : 'light')
      } 
      resolvedTheme={resolvedTheme}
      showMobileControls={false}
      containerClassName="h-auto"
    />
    </div>
</div>
</div>
</div>
);
}
