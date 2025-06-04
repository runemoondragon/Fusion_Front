import React from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Phone, MapPin, Clock, Send, User, Building, Lightbulb, Shield, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';

export const metadata = {
  title: 'Contact Us - Fusion AI',
  description: 'Get in touch with the Fusion AI team. Whether you need support, want to discuss partnerships, or have questions about our AI routing platform, we\'re here to help.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
  <img
    src="/neuroswitch.png"
    alt="Fusion AI Logo"
    className="w-6 h-6 object-contain rounded"
  /></div>
              <span className="text-xl font-bold text-gray-900">Fusion AI</span>
            </Link>
            <Link 
              href="/docs" 
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Documentation
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Have questions about Fusion AI? Need support? Want to explore partnerships? 
            Our team is here to help you succeed with intelligent AI routing.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center space-x-2 text-blue-100">
              <Clock className="w-5 h-5" />
              <span>24/7 Support Available</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <MessageSquare className="w-5 h-5" />
              <span>Average Response: 2 hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Can We Help?</h2>
            <p className="text-lg text-gray-600">Choose the best way to reach us based on your needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Technical Support */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Technical Support</h3>
              <p className="text-gray-600 text-sm mb-4 text-center">
                API issues, integration help, and troubleshooting assistance.
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:support.fusionai@mcp4.ai"
                  className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  support.fusionai@mcp4.ai
                </a>
                <Link 
                  href="https://discord.gg/fusionai"
                  className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Discord Community
                </Link>
                <div className="text-xs text-gray-500">Response: 1-4 hours</div>
              </div>
            </div>

            {/* Sales & Enterprise */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Sales & Enterprise</h3>
              <p className="text-gray-600 text-sm mb-4 text-center">
                Custom plans, enterprise features, and pricing discussions.
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:sales.fusionai@mcp4.ai"
                  className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  sales.fusionai@mcp4.ai
                </a>
                <a 
                  href="tel:+1-555-FUSION"
                  className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  
                </a>
                <div className="text-xs text-gray-500">Response: 2-6 hours</div>
              </div>
            </div>

            {/* Partnerships */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Partnerships</h3>
              <p className="text-gray-600 text-sm mb-4 text-center">
                Integration partnerships, reseller programs, and collaborations.
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:partnerships@mcp4.ai"
                  className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  partnerships@mcp4.ai
                </a>
                <div className="text-xs text-gray-500">Response: 1-3 business days</div>
              </div>
            </div>

            {/* General Inquiries */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">General Inquiries</h3>
              <p className="text-gray-600 text-sm mb-4 text-center">
                Questions, feedback, media requests, and everything else.
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:hello@mcp4.ai"
                  className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  hello@mcp4.ai
                </a>
                <div className="text-xs text-gray-500">Response: 1-2 business days</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
            <p className="text-lg text-gray-600">
              Prefer to fill out a form? We'll get back to you as soon as possible.
            </p>
          </div>

          <form className="bg-gray-50 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a topic</option>
                <option value="technical-support">Technical Support</option>
                <option value="sales-enterprise">Sales & Enterprise</option>
                <option value="partnerships">Partnerships</option>
                <option value="billing">Billing & Accounts</option>
                <option value="feature-request">Feature Request</option>
                <option value="general">General Inquiry</option>
                <option value="media">Media & Press</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us how we can help you..."
              ></textarea>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                * Required fields
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Office Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Offices</h2>
            <p className="text-lg text-gray-600">We're a distributed team with hubs around the world</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* San Francisco HQ */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">San Francisco (HQ)</h3>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>548 Market Street, Suite 35410</p>
                <p>San Francisco, CA 94104</p>
                <p>United States</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Engineering & Product</p>
              </div>
            </div>

            {/* London */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">London</h3>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>1 King William Street</p>
                <p>London EC4N 7AF</p>
                <p>United Kingdom</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Europe & Sales</p>
              </div>
            </div>

            {/* Singapore */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Singapore</h3>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>1 Raffles Place, #20-61</p>
                <p>One Raffles Place</p>
                <p>Singapore 048616</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Asia Pacific</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions. Need more help? 
              <Link href="/docs/faq" className="text-blue-600 hover:text-blue-700 font-medium"> Check our full FAQ</Link>
            </p>
          </div>

          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How quickly do you respond to support requests?
              </h3>
              <p className="text-gray-600">
                Technical support requests typically receive a response within 1-4 hours during business hours. 
                For urgent issues, we recommend joining our Discord community for immediate community support.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer enterprise support?
              </h3>
              <p className="text-gray-600">
                Yes! Enterprise customers receive priority support with dedicated account management, 
                custom SLAs, and direct access to our engineering team. Contact sales.fusionai@mcp4.ai for more details.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I schedule a demo or consultation?
              </h3>
              <p className="text-gray-600">
                Absolutely! Contact our sales team at sales.fusionai@mcp4.ai or use the form above to schedule 
                a personalized demo and discuss your specific AI routing needs.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I report a security vulnerability?
              </h3>
              <p className="text-gray-600">
                Security is our top priority. Please report vulnerabilities to security.fusiona@mcp4.ai. 
                We have a responsible disclosure policy and will acknowledge receipt within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social & Community */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Connect With Us</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Follow our journey, get updates, and connect with the Fusion AI community across social platforms.
          </p>

          <div className="flex justify-center space-x-6 mb-8">
            <Link 
              href="#"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Github className="w-6 h-6" />
              <span>GitHub</span>
            </Link>
            <Link 
              href="#"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Twitter className="w-6 h-6" />
              <span>Twitter</span>
            </Link>
            <Link 
              href="#"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Linkedin className="w-6 h-6" />
              <span>LinkedIn</span>
            </Link>
            <Link 
              href="#"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <MessageSquare className="w-6 h-6" />
              <span>Discord</span>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/docs"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Documentation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link 
              href="/docs/community"
              className="inline-flex items-center px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Join Community
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
  <img
    src="/neuroswitch.png"
    alt="Fusion AI Logo"
    className="w-6 h-6 object-contain rounded"
  />
              </div>
              <span className="text-white font-medium">Fusion AI</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm">© 2025 Fusion AI. All rights reserved.</p>
              <div className="flex space-x-4 mt-2 justify-center md:justify-end">
                <Link href="/privacy" className="text-xs hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="text-xs hover:text-white transition-colors">Terms</Link>
                
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 