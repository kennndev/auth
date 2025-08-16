"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export default function DMCAPage() {
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
                Cardify.club DMCA Policy
              </CardTitle>
              <p className="text-gray-400 mt-2">Effective Date: August 02, 2025</p>
            </CardHeader>
            <CardContent className="space-y-8 text-gray-300">
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">1. DMCA Compliance</h2>
                <p className="leading-relaxed">
                  Cardify.club respects the intellectual property rights of others and complies with the Digital
                  Millennium Copyright Act (DMCA). We will respond promptly to claims of copyright infringement
                  committed using our platform.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">2. How to File a DMCA Takedown Notice</h2>
                <p className="leading-relaxed mb-4">
                  If you believe that your copyrighted work has been copied in a way that constitutes copyright
                  infringement, please send a notice to our DMCA Agent with the following information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your name, address, phone number, and email address.</li>
                  <li>A description of the copyrighted work you claim has been infringed.</li>
                  <li>The URL or location on our platform where the infringing material is found.</li>
                  <li>A statement that you have a good faith belief that the use of the material is not authorized by the
                      copyright owner, its agent, or the law.</li>
                  <li>A statement that the information in the notice is accurate, and under penalty of perjury, that you
                      are authorized to act on behalf of the copyright owner.</li>
                  <li>Your physical or electronic signature.</li>
                </ul>
                <p className="mt-4">
                  Send your notice to:{" "}
                  <a href="mailto:dmca@cardify.club" className="text-cyber-cyan hover:text-cyber-pink transition-colors underline">
                    dmca@cardify.club
                  </a>
                </p>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">3. Counter-Notification</h2>
                <p className="leading-relaxed">
                  If you believe your content was removed in error or misidentification, you may send us a
                  counter-notification. Your counter-notice must include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Your name, address, and email address.</li>
                  <li>Identification of the material removed and its location before removal.</li>
                  <li>A statement under penalty of perjury that you believe the content was removed by mistake.</li>
                  <li>A statement that you consent to the jurisdiction of the federal court in your district, and that you will
                      accept service of process from the person who filed the original DMCA notice.</li>
                  <li>Your physical or electronic signature.</li>
                </ul>
                <p className="mt-4">
                  Send your counter-notice to:{" "}
                  <a href="mailto:dmca@cardify.club" className="text-cyber-cyan hover:text-cyber-pink transition-colors underline">
                    dmca@cardify.club
                  </a>
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">4. Repeat Infringer Policy</h2>
                <p className="leading-relaxed">
                  Cardify.club may, in appropriate circumstances, suspend or terminate accounts of users who are
                  repeat infringers of intellectual property rights.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyber-cyan tracking-wider">5. Reservation of Rights</h2>
                <p className="leading-relaxed">
                  We reserve the right to remove any content at our discretion and to take any legal action necessary
                  to protect intellectual property rights.
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