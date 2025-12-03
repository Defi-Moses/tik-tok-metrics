import Link from 'next/link';
import { ThemeToggle } from '@/app/components/theme-toggle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | TikTok Metrics',
  description: 'Terms of Service for TikTok Metrics application',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors mb-6"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Last Updated: [Date]</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Content */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By accessing or using our TikTok metrics application ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Description of Service</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our Service provides analytics and metrics tracking for TikTok accounts. The Service aggregates data from connected TikTok accounts and presents it in a dashboard format.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Eligibility</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>You must be at least 13 years of age to use this Service</li>
                <li>You must have the legal capacity to enter into these Terms</li>
                <li>You must comply with all applicable laws and regulations</li>
                <li>You must have a valid TikTok account to connect to the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Registration and Security</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You may not share your account credentials with third parties</li>
                <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">TikTok Account Connection</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>By connecting your TikTok account, you grant us permission to access your TikTok data through their API</li>
                <li>You are responsible for ensuring you have the right to connect any TikTok account to our Service</li>
                <li>You may disconnect your TikTok account at any time through the Service settings</li>
                <li>We are not responsible for any actions taken by TikTok that affect your account or our access to it</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Acceptable Use</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Violate or infringe upon the rights of others</li>
                <li>Transmit any harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Use the Service to compete with us or build a similar service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Intellectual Property</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>The Service and its original content, features, and functionality are owned by us and protected by international copyright, trademark, patent, trade secret, and other intellectual property laws</li>
                <li>You retain ownership of any content you provide to the Service</li>
                <li>By using the Service, you grant us a license to use, display, and process your content as necessary to provide the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Data and Privacy</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Your use of the Service is also governed by our Privacy Policy</li>
                <li>We collect and process data as described in our Privacy Policy</li>
                <li>You are responsible for ensuring you have the right to share any data you provide to the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Service Availability</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>We strive to provide reliable service but do not guarantee uninterrupted or error-free operation</li>
                <li>We reserve the right to modify, suspend, or discontinue the Service at any time</li>
                <li>We are not liable for any downtime, data loss, or service interruptions</li>
                <li>We may perform maintenance that temporarily affects Service availability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Third-Party Services</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Our Service integrates with TikTok and other third-party services</li>
                <li>We are not responsible for the availability, accuracy, or practices of third-party services</li>
                <li>Your use of third-party services is subject to their respective terms and conditions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Disclaimers</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed font-semibold">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                We do not warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>The Service will be uninterrupted or error-free</li>
                <li>The results obtained from using the Service will be accurate or reliable</li>
                <li>Any errors in the Service will be corrected</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Indemnification</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You agree to defend, indemnify, and hold harmless us and our officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with your access to or use of the Service or your violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Termination</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms</li>
                <li>Upon termination, your right to use the Service will cease immediately</li>
                <li>You may terminate your account at any time by disconnecting your TikTok account and ceasing to use the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Changes to Terms</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>We reserve the right to modify these Terms at any time</li>
                <li>We will notify users of any material changes by posting the updated Terms on this page</li>
                <li>Your continued use of the Service after changes become effective constitutes acceptance of the new Terms</li>
                <li>If you do not agree to the modified Terms, you must stop using the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Governing Law</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Severability</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Entire Agreement</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through the appropriate channels provided in our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Acknowledgment</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

