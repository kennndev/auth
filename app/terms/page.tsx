"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cyber-black relative overflow-hidden font-mono">
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="fixed inset-0 scanlines opacity-20 pointer-events-none" />

      <Navigation />

      <div className="px-6 py-8 pt-24 relative">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/upload" className="inline-flex items-center gap-2 text-cyber-cyan hover:text-cyber-pink transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span className="tracking-wider">Back to Upload</span>
          </Link>

          <Card className="bg-cyber-dark/60 backdrop-blur-sm border border-cyber-cyan/30">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white tracking-wider">
                Cardify.club Terms of Service
              </CardTitle>
              <p className="text-gray-400 mt-2">Effective Date: August 02, 2025</p>
            </CardHeader>
            <CardContent className="space-y-8 text-gray-300">
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing or using Cardify.club ("the Platform"), you agree to be bound by these Terms of
                  Service ("Terms"). If you do not agree, do not use the Platform.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">2. User Content and Uploads</h2>
                <p className="leading-relaxed">
                  Users are solely responsible for all content they upload, including but not limited to images, designs,
                  and text. By uploading content, you represent and warrant that you own all rights or have obtained
                  all necessary permissions to use and reproduce the content. You agree not to upload any content
                  that infringes on the intellectual property, publicity, or privacy rights of any third party.
                </p>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">3. DMCA Policy</h2>
                <p className="leading-relaxed">
                  Cardify.club complies with the Digital Millennium Copyright Act (DMCA). If you believe your
                  copyrighted work has been infringed, you may submit a notice to our DMCA agent at{" "}
                  <a href="mailto:dmca@cardify.club" className="text-cyber-cyan hover:text-cyber-pink transition-colors underline">
                    dmca@cardify.club
                  </a>
                  . We reserve the right to remove infringing content and suspend repeat infringers.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">4. Storefronts and Fulfillment</h2>
                <p className="leading-relaxed">
                  Cardify.club allows users to create personal storefronts. Storefront owners are fully responsible for
                  the content they list and sell. The Platform acts solely as a service provider for printing and order
                  fulfillment. We do not claim ownership of user content but reserve the right to remove any content at
                  our discretion.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">5. Indemnification</h2>
                <p className="leading-relaxed">
                  You agree to indemnify and hold harmless Cardify.club, its owners, affiliates, and employees from
                  any claims, damages, or legal fees arising from your use of the Platform or any content you upload
                  or sell.
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">6. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  Cardify.club is not liable for any direct, indirect, incidental, or consequential damages resulting from
                  your use of the Platform. We provide the Platform 'as is' without warranties of any kind.
                </p>
              </section>

              {/* Section 7 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">7. Changes to Terms</h2>
                <p className="leading-relaxed">
                  We reserve the right to modify these Terms at any time. Continued use of the Platform after
                  changes constitutes acceptance of the new Terms.
                </p>
              </section>

              {/* Section 8 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">8. Contact</h2>
                <p className="leading-relaxed">
                  For any questions about these Terms, contact us at{" "}
                  <a href="mailto:support@cardify.club" className="text-cyber-cyan hover:text-cyber-pink transition-colors underline">
                    support@cardify.club
                  </a>
                  .
                </p>
              </section>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Footer */}
      <footer className="px-6 py-8 mt-16 border-t border-cyber-cyan/20 bg-cyber-dark/40">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Cardify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}