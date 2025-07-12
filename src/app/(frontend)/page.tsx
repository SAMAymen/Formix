// app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Check,
  ArrowRight,
  FileSpreadsheet,
  Link2,
  Code,
  FileText,
  Layers,
  LineChart,
  Loader2,
  ChevronRight,
  Shield,
  Settings,
  Share2,
  Users,
  MessageSquare,
  Database,
  BookOpen,
  Coffee,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BuyMeCoffeeButton } from "@/components/ui/BuyMeCoffeeButton";

// Define TypeScript interfaces for component props
interface LoadingStates {
  startBuilding: boolean;
  watchDemo: boolean;
  signUpFree: boolean;
  learnMore: boolean;
  featureDetails: boolean;
  ctaStartBuilding: boolean;
  supportDeveloper: boolean;
}

interface HeroSectionProps {
  loadingStates: LoadingStates;
  handleNavigation: (buttonId: string, path: string) => void;
}

const HeroSection = ({ loadingStates, handleNavigation }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-white pb-16 pt-8 sm:pb-24 sm:pt-12 lg:pb-32 lg:pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-50 opacity-70"></div>
        <div className="absolute right-0 top-0 h-48 w-48 bg-gradient-to-tl from-green-200 to-green-100 rounded-full -mr-12 -mt-12 blur-3xl opacity-40"></div>
        <div className="absolute left-1/3 bottom-0 h-72 w-72 bg-gradient-to-tr from-emerald-200 to-green-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Remove style={{ opacity: heroOpacity, y: heroY }} */}
      <motion.div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm mb-6">
              Seamless Google Sheets Integration
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Create Forms That{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                Connect
              </span>{" "}
              to Google Sheets
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-xl lg:max-w-none mx-auto lg:mx-0">
              Build beautiful, responsive forms and collect submissions directly
              in your Google Sheets — no coding required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg relative overflow-hidden group"
                disabled={loadingStates.startBuilding}
                onClick={() => handleNavigation("startBuilding", "/dashboard")}
              >
                <span className="relative z-10 flex items-center">
                  {loadingStates.startBuilding ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Start Building
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 group-hover:from-green-700 group-hover:to-green-800 transition-colors duration-300"></span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-green-600 text-green-700 hover:bg-green-50 px-8 py-6 text-lg"
                disabled={loadingStates.watchDemo}
                onClick={() => handleNavigation("watchDemo", "/demo")}
              >
                {loadingStates.watchDemo ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Watch Demo
                    <Play className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required. Free to use for everyone.
            </p>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-200 to-emerald-100 blur-2xl opacity-30 rounded-full transform scale-110"></div>
              <div className="relative bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
                <div className="p-2 bg-gray-50 border-b flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <img
                  src="/images/hero-form.png"
                  alt="Formix Form Builder Dashboard"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -right-12 -bottom-8 bg-white rounded-lg shadow-lg border border-green-100 p-3 transform rotate-6">
                <img
                  src="/images/google-sheets.png"
                  alt="Google Sheets Integration"
                  className="w-16 h-auto"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

// SVG Components with TypeScript interfaces
interface IconProps {
  className?: string;
}

const Play = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
      clipRule="evenodd"
    />
  </svg>
);

interface ChecklistItemProps {
  children: React.ReactNode;
}

const ChecklistItem = ({ children }: ChecklistItemProps) => (
  <div className="flex items-start mb-4">
    <div className="mr-3 mt-1">
      <div className="bg-green-100 text-green-600 rounded-full p-1">
        <Check className="h-4 w-4" />
      </div>
    </div>
    <div>{children}</div>
  </div>
);

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    startBuilding: false,
    watchDemo: false,
    signUpFree: false,
    learnMore: false,
    featureDetails: false,
    ctaStartBuilding: false,
    supportDeveloper: false,
  });
  const [activeTab, setActiveTab] = useState("forms");
  const router = useRouter();
  const { data: session, status } = useSession();
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    steps: useRef<HTMLDivElement>(null),
    features: useRef<HTMLDivElement>(null),
    cta: useRef<HTMLDivElement>(null),
  };

  const handleNavigation = (buttonId: string, path: string) => {
    setLoadingStates((prev) => ({ ...prev, [buttonId]: true }));
    router.push(path);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        !(event.target as Element).closest(".mobile-menu-button")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const { scrollY } = useScroll();
  const formRotate = useTransform(scrollY, [0, 300], [0, 3]);
  const formY = useTransform(scrollY, [0, 300], [0, -30]);

  const steps = [
    {
      icon: <FileSpreadsheet className="h-10 w-10 text-white" />,
      title: "Design Your Form",
      desc: "Drag-and-drop form builder with customizable fields and responsive styling for all devices.",
      link: "/dashboard",
    },
    {
      icon: <Link2 className="h-10 w-10 text-white" />,
      title: "Connect to Sheets",
      desc: "One-click connection to Google Sheets with automatic column mapping and secure data storage.",
      link: "/dashboard",
    },
    {
      icon: <Code className="h-10 w-10 text-white" />,
      title: "Embed & Collect",
      desc: "Generate embed code, add to your website, and watch responses flow into your spreadsheet.",
      link: "/dashboard",
    },
  ];

  const features = [
    {
      icon: <Layers className="h-5 w-5" />,
      title: "Responsive Forms",
      desc: "Create beautiful forms that work perfectly on desktop, tablet, and mobile devices.",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Multiple Field Types",
      desc: "Choose from text, select, checkbox, radio, phone number, and many more field types.",
    },
    {
      icon: <LineChart className="h-5 w-5" />,
      title: "Submission Analytics",
      desc: "Track form submissions with detailed analytics and manage your data efficiently.",
    },
  ];

  const testimonials = [
    {
      text: "Formix made connecting my contact form to Google Sheets incredibly simple. No more manual data entry!",
      author: "Abdelouahed Id-boubrik",
      role: "Web Developer",
    },
    {
      text: "The form builder is intuitive and the Google Sheets integration works flawlessly. Highly recommended!",
      author: "abdelali sadik",
      role: "Software Engineer",
    },
    {
      text: "I was able to set up a complete form with Google Sheets connection in under 5 minutes. Amazing tool!",
      author: "Ayoub Smaini",
      role: "Product Manager",
    },
  ];

  const faqItems = [
    {
      question: "How does the Google Sheets integration work?",
      answer:
        "Formix connects directly to your Google account. Once you authenticate, you can select any Google Sheet you have access to. When a form is submitted, the data is automatically sent to your chosen sheet, with each field mapped to the corresponding column.",
    },
    {
      question: "Do I need coding skills to use Formix?",
      answer:
        "Not at all! Formix is designed to be user-friendly with a drag-and-drop interface. You can create forms, connect to Google Sheets, and embed forms on your website without any coding knowledge.",
    },
    {
      question: "Can I customize how my forms look?",
      answer:
        "Yes! Formix offers extensive customization options. You can change colors, fonts, and layouts to match your brand. You can also apply custom CSS and advanced theming.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We take security seriously. All data is encrypted in transit and at rest. We use OAuth for Google authentication, which means we never see or store your Google password. You can revoke access at any time.",
    },
    {
      question: "Will this platform always be free?",
      answer:
        "Yes! We're committed to keeping the core functionality free for everyone. If you find the tool valuable, you can support development through our Buy Me a Coffee link.",
    },
    {
      question: "Can I export my submission data?",
      answer:
        "Yes, you can export all submission data to CSV or JSON formats at any time. Since your data also lives in Google Sheets, you already have a live export of all your data.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        loadingStates={loadingStates}
        handleNavigation={handleNavigation}
      />

      {/* Three Steps Section */}
      <section
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        ref={sectionRefs.steps}
      >
        <div className="text-center mb-12">
          <AnimatedCard>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Three Simple Steps
            </h2>
          </AnimatedCard>
          <AnimatedCard>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Creating and connecting forms to Google Sheets has never been
              easier
            </p>
          </AnimatedCard>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <AnimatedCard key={i}>
              <Card className="border-green-100 hover:shadow-lg transition-all duration-300 overflow-hidden group relative h-full">
                <div className="absolute right-0 top-0 w-32 h-32 bg-green-500 opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <CardHeader className="pb-2">
                  <motion.div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg transform group-hover:rotate-3 transition-transform duration-300">
                    {step.icon}
                  </motion.div>
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.desc}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="text-green-700 pl-0 group-hover:translate-x-2 transition-transform duration-300"
                    disabled={loadingStates.learnMore}
                    onClick={() => handleNavigation("learnMore", step.link)}
                  >
                    {loadingStates.learnMore ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <span className="flex items-center">
                        Learn more <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Features Tabs Section */}
      <section
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white"
        ref={sectionRefs.features}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <AnimatedCard>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm mb-4">
                <FileSpreadsheet className="h-4 w-4 mr-1" /> Google Sheets
                Integration
              </Badge>
            </AnimatedCard>
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-gray-800 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Powerful Form Features
            </motion.h2>
            <motion.p
              className="text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Create beautiful forms with all the features you need, connected
              directly to Google Sheets
            </motion.p>
          </div>

          <div className="mb-8">
            <Tabs
              defaultValue="forms"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 max-w-lg mx-auto mb-8">
                <TabsTrigger value="forms">Form Builder</TabsTrigger>
                <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent
                value="forms"
                className="focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                      Intuitive Form Builder
                    </h3>
                    <div className="space-y-4 mb-6">
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Drag-and-Drop Interface
                        </p>
                        <p className="text-gray-600">
                          Build forms visually without coding knowledge
                        </p>
                      </ChecklistItem>
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Multiple Field Types
                        </p>
                        <p className="text-gray-600">
                          Text, select, checkbox, radio, date, file upload and
                          more
                        </p>
                      </ChecklistItem>
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Responsive Design
                        </p>
                        <p className="text-gray-600">
                          Forms look great on any device size
                        </p>
                      </ChecklistItem>
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Custom Styling
                        </p>
                        <p className="text-gray-600">
                          Match your brand colors, fonts, and layout preferences
                        </p>
                      </ChecklistItem>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100 relative">
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src="/images/form-builder.png"
                        alt="Form Builder Interface"
                        className="w-full h-auto"
                        style={{ maxHeight: "400px", objectFit: "contain" }}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="sheets"
                className="focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="order-2 lg:order-1 bg-white rounded-xl p-4 shadow-lg border border-green-100 relative">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src="/images/sheets-integration.png"
                        alt="Google Sheets Integration"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                      Seamless Google Sheets Integration
                    </h3>
                    <div className="space-y-4 mb-6">
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          One-Click Connection
                        </p>
                        <p className="text-gray-600">
                          Connect to any Google Sheet with just one click
                        </p>
                      </ChecklistItem>
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Automatic Column Mapping
                        </p>
                        <p className="text-gray-600">
                          Form fields map directly to spreadsheet columns
                        </p>
                      </ChecklistItem>
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Real-Time Syncing
                        </p>
                        <p className="text-gray-600">
                          Form submissions appear in your sheet instantly
                        </p>
                      </ChecklistItem>
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Secure Authorization
                        </p>
                        <p className="text-gray-600">
                          OAuth 2.0 protection for your Google account
                        </p>
                      </ChecklistItem>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="analytics"
                className="focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                      Powerful Submission Analytics
                    </h3>
                    <div className="space-y-4 mb-6">
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Submission Dashboard
                        </p>
                        <p className="text-gray-600">
                          View and filter all form submissions in one place
                        </p>
                      </ChecklistItem>
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Visual Reports
                        </p>
                        <p className="text-gray-600">
                          Charts and graphs showing submission patterns
                        </p>
                      </ChecklistItem>
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Export Options
                        </p>
                        <p className="text-gray-600">
                          Download submissions as CSV or JSON files
                        </p>
                      </ChecklistItem>
                      <ChecklistItem>
                        <p className="font-medium text-gray-800">
                          Notification System
                        </p>
                        <p className="text-gray-600">
                          Get alerts for new submissions via email
                        </p>
                      </ChecklistItem>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100 relative">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src="/images/analytics-dashboard.png"
                        alt="Analytics Dashboard"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {features.map((feature, i) => (
              <AnimatedCard key={i}>
                <Card className="border border-green-200 bg-white hover:shadow-md transition-all duration-300 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-green-500 opacity-5 rounded-full" />
                  <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-green-700">
                        {feature.title}
                      </CardTitle>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>

          {/* Additional Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-100 bg-green-50 hover:shadow-md transition-all duration-300">
              <CardHeader>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                  <Shield className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg text-green-700">
                  Privacy First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your data security is our priority. All form data is encrypted
                  and securely transmitted.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-green-50 hover:shadow-md transition-all duration-300">
              <CardHeader>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                  <Settings className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg text-green-700">
                  Advanced Customization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Personalize your forms with custom themes, logos, and
                  formatting to match your brand.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-green-50 hover:shadow-md transition-all duration-300">
              <CardHeader>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                  <Share2 className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg text-green-700">
                  Easy Embedding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Embed your forms on any website with a simple copy-paste code
                  snippet.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials and Case Studies */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm mb-4">
              <Users className="h-4 w-4 mr-1" /> Customer Success
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Loved by Users Everywhere
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See what our customers are saying about Formix
            </p>
          </div>

          {/* Testimonials */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">
                What Our Users Say
              </h3>
              <Badge className="bg-green-600 w-fit">
                <Check className="h-3 w-3 mr-1" /> Verified
              </Badge>
            </div>
            <div className="space-y-4">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col p-3 rounded-lg hover:bg-green-50 transition-colors"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <p className="text-gray-600 italic mb-2">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-medium">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Support the Developer */}
      <section className="py-12 bg-white border-t border-green-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl p-8 border border-amber-200 shadow-lg"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-300 opacity-20 rounded-full -mr-10 -mt-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-10 w-32 h-32 bg-amber-400 opacity-10 rounded-full -mb-10 blur-2xl"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="text-center md:text-left max-w-md">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Badge className="bg-amber-200 text-amber-800 hover:bg-amber-300 px-4 py-1.5 text-sm mb-4">
                    <Coffee className="h-4 w-4 mr-1.5" /> Support the Developer
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-amber-800 mb-3 tracking-tight">
                    Formix is{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500">
                      Free
                    </span>
                  </h2>
                  <p className="text-amber-700 mb-3 text-lg">
                    If you find this tool valuable for your projects, consider
                    supporting future development!
                  </p>
                  <p className="text-amber-600 text-sm">
                    Your support enables new features, better documentation, and
                    ongoing maintenance.
                  </p>
                </motion.div>
              </div>

              <BuyMeCoffeeButton
                onCoffeeClick={() => {
                  setLoadingStates((prev) => ({
                    ...prev,
                    supportDeveloper: true,
                  }));
                  window.open("https://buymeacoffee.com/samoudiayms", "_blank");
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm mb-4">
              <MessageSquare className="h-4 w-4 mr-1" /> FAQ
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about Formix
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="text-left font-medium text-gray-800 hover:text-green-700 py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-br from-green-500 to-emerald-600"
        ref={sectionRefs.cta}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-white text-green-800 hover:bg-gray-100 px-3 py-1 text-sm mb-6">
              <BookOpen className="h-4 w-4 mr-1" /> Get Started
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Streamline Your Form Data?
            </h2>
            <p className="text-green-50 mb-8">
              Join thousands of users who are connecting Google Sheets to their
              forms with Formix.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-green-700 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg"
                disabled={loadingStates.ctaStartBuilding}
                onClick={() =>
                  handleNavigation("ctaStartBuilding", "/dashboard")
                }
              >
                {loadingStates.ctaStartBuilding ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Start Building For Free"
                )}
              </Button>
            </motion.div>
            <p className="text-sm text-green-100 mt-4">
              No registration required. Free to use for everyone.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
