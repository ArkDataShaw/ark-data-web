import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function PrivacyPolicy() {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-12">Last updated: January 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              Ark Data, Inc. ("Company", "we", "us", "our") operates the Ark Data website and service. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information Collection and Use</h2>
            <p className="text-gray-700 mb-4">
              We collect several different types of information for various purposes to provide and improve our service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Personal Data:</strong> While using our service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data").</li>
              <li><strong>Usage Data:</strong> We may also collect information on how the service is accessed and used ("Usage Data").</li>
              <li><strong>Tracking & Cookies:</strong> Our tracking pixel collects behavioral data and device information for visitor identification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Data</h2>
            <p className="text-gray-700">
              Ark Data uses the collected data for various purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To gather analysis or valuable information so we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. GDPR & CCPA Compliance</h2>
            <p className="text-gray-700">
              We comply with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Access your personal data</li>
              <li>Rectify or erase your data</li>
              <li>Restrict processing</li>
              <li>Object to processing</li>
              <li>Data portability</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us at privacy@arkdata.io.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-700">
              We retain your data for as long as necessary to provide our service. You can control data retention periods in your account settings (1-24 months). Upon request, we will delete your data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Security of Data</h2>
            <p className="text-gray-700">
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:{' '}
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