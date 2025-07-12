'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Send, Loader2, HelpCircle, Mail, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useTheme } from '@/providers/theme-provider' // Add theme provider import

export default function SupportPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { theme, resolvedTheme } = useTheme() // Get current theme and resolved theme
  
  // Theme-specific styles
  const pageBackgroundClasses = resolvedTheme === 'dark'
    ? "bg-gradient-to-b from-gray-900 to-gray-800"
    : "bg-gradient-to-b from-green-50 to-emerald-50";
  
  const backButtonClasses = resolvedTheme === 'dark'
    ? "text-green-400 pl-0 hover:bg-gray-800"
    : "text-green-700 pl-0 hover:bg-green-50";
  
  const cardClasses = resolvedTheme === 'dark'
    ? "border-gray-700 bg-gray-800"
    : "border-green-100";
    
  const descriptionClasses = resolvedTheme === 'dark'
    ? "text-gray-400"
    : "";
    
  const iconClasses = resolvedTheme === 'dark'
    ? "text-emerald-400"
    : "text-emerald-600";
    
  const accordionTriggerClasses = resolvedTheme === 'dark'
    ? "text-gray-200 hover:text-gray-100"
    : "";
  
  const accordionContentClasses = resolvedTheme === 'dark'
    ? "text-gray-400"
    : "";
    
  const textareaClasses = resolvedTheme === 'dark'
    ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-emerald-700"
    : "border-green-200 focus:ring-green-300";
    
  const footerClasses = resolvedTheme === 'dark'
    ? "border-gray-700 text-gray-400"
    : "border-green-100 text-gray-600";
    
  const docButtonClasses = resolvedTheme === 'dark'
    ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "border-green-200";
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    
    setIsLoading(true)
    
    try {
      // Simulating an API call to send support request
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Message sent",
        description: "We'll get back to you as soon as possible.",
      })
      setMessage('')
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-6 ${pageBackgroundClasses} min-h-screen`}>
      <Button 
        variant="ghost" 
        className={backButtonClasses}
        asChild
      >
        <Link href="/dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FAQs */}
        <Card className={`${cardClasses} md:col-span-2`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className={`h-5 w-5 mr-2 ${iconClasses}`} />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription className={descriptionClasses}>Find quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className={`text-left ${accordionTriggerClasses}`}>
                  How do I create a new form?
                </AccordionTrigger>
                <AccordionContent className={accordionContentClasses}>
                  Navigate to the dashboard and click the "Create New Form" button.
                  You can start with a template or build your form from scratch.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className={`text-left ${accordionTriggerClasses}`}>
                  Can I export form responses?
                </AccordionTrigger>
                <AccordionContent className={accordionContentClasses}>
                  Yes, you can export responses as CSV, Excel, or PDF from your form's 
                  Response section in the dashboard.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className={`text-left ${accordionTriggerClasses}`}>
                  How do I share my form with others?
                </AccordionTrigger>
                <AccordionContent className={accordionContentClasses}>
                  After creating your form, click the "Share" button to get a shareable 
                  link or embed code for your website.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Contact Support */}
        <Card className={cardClasses}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className={`h-5 w-5 mr-2 ${iconClasses}`} />
              Contact Support
            </CardTitle>
            <CardDescription className={descriptionClasses}>We're here to help</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Your message</Label>
                <textarea 
                  id="message" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full rounded-md border p-2 min-h-[120px] focus:outline-none focus:ring-2 ${textareaClasses}`}
                  placeholder="Describe your issue or question..."
                  required
                />
              </div>
              <Button 
                type="submit"
                disabled={isLoading}
                className={resolvedTheme === 'dark' 
                  ? "w-full bg-emerald-700 hover:bg-emerald-600 text-white" 
                  : "w-full bg-green-600 hover:bg-green-700 text-white"
                }
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
            </form>
          </CardContent>
          <CardFooter className={`flex flex-col items-start border-t pt-4 ${footerClasses}`}>
            <p className="text-sm mb-2">Or check our documentation:</p>
            <Button variant="outline" className={`w-full ${docButtonClasses}`} asChild>
              <Link href="/docs" className="flex items-center justify-center">
                Documentation
                <ExternalLink className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}