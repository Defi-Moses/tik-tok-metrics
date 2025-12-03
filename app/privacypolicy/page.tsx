import Link from 'next/link';
import { ThemeToggle } from '@/app/components/theme-toggle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | TikTok Metrics',
  description: 'Privacy Policy for TikTok Metrics application',
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Last Updated: [Date]</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Content */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This Privacy Policy describes how we collect, use, and protect your information when you use our TikTok metrics application ("Service"). By using our Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">Profile Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Username and display name</li>
                <li>Profile picture and bio</li>
                <li>Account verification status</li>
                <li>Follower and following counts</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">User-Generated Content</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Posts, videos, and other content you create</li>
                <li>Comments and interactions</li>
                <li>Content metadata (timestamps, locations, etc.)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">Device Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>IP address</li>
                <li>Operating system and version</li>
                <li>Device type and model</li>
                <li>Device identifiers</li>
                <li>Browser type and version</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">Usage Data</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Likes, shares, and comments</li>
                <li>Search history and queries</li>
                <li>Watch time and viewing patterns</li>
                <li>Feature usage and interactions</li>
                <li>Time spent on the Service</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">Authentication Data</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>OAuth tokens and credentials (securely stored)</li>
                <li>Session information</li>
                <li>Account connection status</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Service Provision</strong>: To provide, maintain, and improve our Service</li>
                <li><strong>Personalization</strong>: To personalize your experience and content recommendations</li>
                <li><strong>Analytics</strong>: To analyze usage patterns and improve our Service</li>
                <li><strong>Communication</strong>: To communicate with you about your account and our Service</li>
                <li><strong>Security</strong>: To detect, prevent, and address technical issues and security threats</li>
                <li><strong>Legal Compliance</strong>: To comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Storage and Security</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>We implement industry-standard security measures to protect your data</li>
                <li>Authentication tokens are encrypted and stored securely</li>
                <li>We use secure connections (HTTPS) for all data transmission</li>
                <li>Data is stored in secure databases with access controls</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our Service integrates with TikTok's API and may use other third-party services. These services have their own privacy policies governing the collection and use of your information. We encourage you to review their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Sharing</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist in operating our Service (under strict confidentiality agreements)</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Privacy Rights</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Access</strong>: Request access to your personal information</li>
                <li><strong>Correction</strong>: Request correction of inaccurate information</li>
                <li><strong>Deletion</strong>: Request deletion of your personal information</li>
                <li><strong>Portability</strong>: Request a copy of your data in a portable format</li>
                <li><strong>Opt-Out</strong>: Opt out of certain data collection practices</li>
                <li><strong>Disconnect</strong>: Disconnect your TikTok account at any time through the Service settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Managing Your Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                You can manage your privacy preferences through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>In-app settings to control what information is public versus private</li>
                <li>Account disconnection features</li>
                <li>Direct requests to us regarding your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our Service is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">International Data Transfers</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through the appropriate channels provided in our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Consent</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By using our Service, you consent to our Privacy Policy and agree to its terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

