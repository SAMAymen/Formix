'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Lock } from "lucide-react";

export default function LegalPages() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 text-gray-800">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="text-green-700 hover:text-green-800 p-0"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Privacy Policy Card */}
          <Card className="border-green-100 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Privacy Policy
                </CardTitle>
              </div>
              <Badge className="w-fit bg-green-100 text-green-800">
                Last updated: April 9, 2025
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-600">
              <section>
                <h3 className="font-semibold text-green-700 mb-2">Data Collection</h3>
                <p>We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Email address and name (from your Google account)</li>
                  <li>Form configurations and submission data</li>
                  <li>Google OAuth tokens for connecting to Google Sheets</li>
                  <li>Theme preferences and notification settings</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-green-700 mb-2">Data Usage</h3>
                <p>Your information helps us:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Create and manage your forms</li>
                  <li>Connect your forms to Google Sheets</li>
                  <li>Store and display form submissions</li>
                  <li>Personalize your experience based on preferences</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-green-700 mb-2">Security</h3>
                <p>We implement security measures including:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Secure OAuth authentication with Google</li>
                  <li>Encrypted data transmission</li>
                  <li>Database access controls</li>
                </ul>
              </section>

              {/* Data Sharing and Disclosure */}
              <section>
                <h3 className="font-semibold text-green-700 mb-2">Data Sharing and Disclosure</h3>
                <p>We handle your Google user data with utmost care:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>We <strong>do not</strong> share, sell, rent, or trade Google user data with third parties for commercial purposes</li>
                  <li>Google user data is only accessed to:
                    <ul className="list-disc pl-6 mt-1">
                      <li>Process form submissions to your Google Sheets</li>
                      <li>Display form data in your dashboard</li>
                      <li>Troubleshoot technical issues with your explicit consent</li>
                    </ul>
                  </li>
                  <li>Information may be disclosed only in limited circumstances:
                    <ul className="list-disc pl-6 mt-1">
                      <li>With your explicit consent</li>
                      <li>To comply with legal requirements (such as court orders)</li>
                      <li>To protect our rights, privacy, safety, or property</li>
                    </ul>
                  </li>
                  <li>We use service providers for hosting (Vercel) who are bound by confidentiality agreements</li>
                </ul>
              </section>

              {/* Data Retention and Deletion */}
              <section>
                <h3 className="font-semibold text-green-700 mb-2">Data Retention and Deletion</h3>
                <p>We retain your data only as long as necessary:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Storage periods:
                    <ul className="list-disc pl-6 mt-1">
                      <li>Google authorization tokens are stored only while your account is active</li>
                      <li>Form submission data is stored until you delete the form or your account</li>
                      <li>Your form configurations are stored until you delete them or close your account</li>
                    </ul>
                  </li>
                  <li>You can request deletion of your data by:
                    <ul className="list-disc pl-6 mt-1">
                      <li>Deleting individual forms through the dashboard</li>
                      <li>Using the account deletion option in Settings → Advanced Account Settings</li>
                      <li>Contacting us at samoudiaymen.contact@gmail.com</li>
                      <li>Revoking access through your Google Account settings at myaccount.google.com/permissions</li>
                    </ul>
                  </li>
                  <li>When you delete your account, we will:
                    <ul className="list-disc pl-6 mt-1">
                      <li>Archive all your forms</li>
                      <li>Remove Google OAuth tokens</li>
                      <li>Anonymize your personal information</li>
                    </ul>
                  </li>
                </ul>
              </section>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">Contact Us</h4>
                <p>Email: samoudiaymen.contact@gmail.com</p>
              </div>
            </CardContent>
          </Card>

          {/* Terms of Service Card */}
          <Card className="border-green-100 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Terms of Service
                </CardTitle>
              </div>
              <Badge className="w-fit bg-green-100 text-green-800">
                Effective: April 9, 2025
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-600">
              <section>
                <h3 className="font-semibold text-green-700 mb-2">Acceptance of Terms</h3>
                <p>By using Formix, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Comply with these terms and all applicable laws</li>
                  <li>Properly secure your account credentials</li>
                  <li>Use the Google integration responsibly</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-green-700 mb-2">User Responsibilities</h3>
                <p>When using Formix, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate information in your forms</li>
                  <li>Obtain proper consent from individuals whose data you collect</li>
                  <li>Not use Formix for any illegal or unauthorized purposes</li>
                  <li>Not attempt to interfere with the service's functionality</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-green-700 mb-2">Google Integration</h3>
                <p>When using our Google Sheets integration:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You authorize Formix to access your Google Sheets on your behalf</li>
                  <li>You remain responsible for managing permissions to your Google Sheets</li>
                  <li>Formix is not responsible for any data loss within Google Sheets</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-green-700 mb-2">Modifications</h3>
                <p>We may update these terms periodically. Continued use after changes constitutes acceptance of the new terms.</p>
              </section>

              <section>
                <h3 className="font-semibold text-green-700 mb-2">Limitation of Liability</h3>
                <p>Formix is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.</p>
              </section>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">Governing Law</h4>
                <p>These terms are governed by the laws of Morocco.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-green-100 py-12 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p className="mb-4">Need help? Contact me at samoudiaymen.contact@gmail.com</p>
          <p>&copy; {new Date().getFullYear()} Formix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}