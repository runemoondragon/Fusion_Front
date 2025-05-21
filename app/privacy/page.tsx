import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Fusion AI',
  description: 'Privacy policy and data protection information for Fusion AI',
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-32 pb-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="prose prose-neutral max-w-none">
            <h1 className="text-4xl font-light mb-2">Privacy Policy</h1>
            <p className="text-sm text-neutral-500 mb-8">Last updated: April 29, 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-light mb-4">1. Introduction</h2>
              <p className="mb-4">
                Fusion AI ("we," "our," or "us") respects your privacy and is committed to protecting your personal data.
                This privacy policy explains how we collect, use, and safeguard your information when you visit our website (fusionai.app).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-light mb-4">2. Information We Collect</h2>
              <p className="mb-2">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Contact information (name, email address)</li>
                <li>Communication preferences</li>
                <li>Details you provide when configuring API keys or models</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-light mb-4">3. How We Use Your Information</h2>
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Enable AI interactions using selected providers</li>
                <li>Provide technical support</li>
                <li>Send you updates (if subscribed)</li>
                <li>Enhance user experience and platform functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-light mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your data from unauthorized access, misuse, or disclosure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-light mb-4">5. Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Access the personal data we store</li>
                <li>Request corrections or deletions</li>
                <li>Withdraw consent for data use at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-light mb-4">6. Contact Us</h2>
              <p className="mb-2">For any questions about this privacy policy or our data practices, contact us at:</p>
              <p className="mb-2">
                Email:{' '}
                <Link
                  href="mailto:hello@fusionai.app"
                  className="text-orange-500 hover:text-orange-600 transition-colors"
                >
                  hello@fusionai.app
                </Link>
              </p>
              <p>
                Schedule a meeting:{' '}
                <Link
                  href="https://calendly.com/fusionai/discovery"
                  className="text-orange-500 hover:text-orange-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book a discovery call
                </Link>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
