import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Cookies() {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
        <p className="text-gray-600 mb-12">Last updated: January 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What are Cookies?</h2>
            <p className="text-gray-700">
              Cookies are small text files that are placed on your device (computer, mobile, etc.) when you visit our website or use our service. They allow us to recognize you, remember your preferences, and understand how you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies for several purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly (authentication, security)</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors use the site (analytics, error tracking)</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver personalized ads and measure campaign effectiveness</li>
              <li><strong>Preference Cookies:</strong> Remember your choices and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Ark Data Tracking Pixel</h2>
            <p className="text-gray-700">
              Our tracking pixel uses cookies to identify and track website visitors for our customers. The pixel respects:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Cookie consent preferences (will not track if user declines)</li>
              <li>Opt-out mechanisms and browser signals (DNT headers)</li>
              <li>Data residency and retention settings</li>
              <li>GDPR and CCPA compliance requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control cookies in several ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Browser Settings:</strong> Manage cookie preferences in your browser settings</li>
              <li><strong>Cookie Consent Banner:</strong> Decline non-essential cookies when you visit our site</li>
              <li><strong>Opt-Out Tools:</strong> Use industry opt-out tools like the Network Advertising Initiative</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700">
              We may use third-party services (Google Analytics, Stripe, etc.) that place cookies on your device. These services are bound by their own privacy policies. We recommend reviewing their policies for more information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about our use of cookies, please contact:{' '}
              <a href="mailto:privacy@arkdata.io" className="text-blue-600 hover:underline">
                privacy@arkdata.io
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <Link to={createPageUrl('Home')} className="text-blue-600 hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}