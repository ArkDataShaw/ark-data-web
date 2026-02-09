import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Lock, Shield, Zap } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function Security() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Privacy-first by design
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Enterprise-grade security and compliance built into every layer of Ark Data.
        </p>
      </section>

      {/* Security Pillars */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: 'Data Encryption',
                items: [
                  'TLS 1.3 encryption in transit',
                  'AES-256 encryption at rest',
                  'Field-level encryption for PII',
                  'Secure key management (AWS KMS)',
                ],
              },
              {
                icon: Shield,
                title: 'Privacy & Consent',
                items: [
                  'Cookie consent banner integration',
                  'Opt-out mechanism in pixel',
                  'GDPR-compliant data handling',
                  'Data retention controls (1-24 months)',
                ],
              },
              {
                icon: Zap,
                title: 'Compliance',
                items: [
                  'SOC 2 Type II certified',
                  'GDPR & CCPA compliant',
                  'HIPAA-eligible architecture',
                  'Annual penetration testing',
                ],
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="bg-white rounded-lg p-8 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{pillar.title}</h3>
                  <ul className="space-y-3">
                    {pillar.items.map((item, iidx) => (
                      <li key={iidx} className="flex items-start gap-3">
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Handling */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          How we handle your data
        </h2>

        <div className="space-y-8">
          {[
            {
              title: 'Visitor Data Collection',
              desc: 'The Ark Data pixel collects behavioral data (pages visited, time on site, form interactions) and device info (IP, user agent). This data is stored securely and purged according to your retention settings.',
            },
            {
              title: 'Identity Resolution',
              desc: 'We use first-party cookies and IP geolocation to match sessions to companies. Company data comes from third-party data providers with strict data agreements. Individual contact data is never shared without consent.',
            },
            {
              title: 'CRM & Integration Sync',
              desc: 'Leads are synced to your CRM/ESP via OAuth or encrypted API keys. Keys are stored encrypted at rest and never transmitted to the browser. Integration logs are maintained for audit purposes.',
            },
            {
              title: 'Data Residency & Compliance',
              desc: 'Data is stored in US or EU regions based on your selection. We comply with GDPR, CCPA, and industry standards. You control data retention periods and can request deletion anytime.',
            },
          ].map((section, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-8">
              <h3 className="font-bold text-gray-900 mb-3">{section.title}</h3>
              <p className="text-gray-700">{section.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subprocessors */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Subprocessors & Partners
          </h2>

          <div className="space-y-4 mb-8">
            {[
              { name: 'Amazon Web Services (AWS)', purpose: 'Cloud infrastructure & data storage' },
              { name: 'Auth0', purpose: 'Identity & access management' },
              { name: 'Stripe', purpose: 'Payment processing' },
              { name: 'Sendgrid', purpose: 'Transactional email' },
              { name: 'Datadog', purpose: 'Monitoring & observability' },
            ].map((processor, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="font-semibold text-gray-900">{processor.name}</p>
                <p className="text-sm text-gray-600">{processor.purpose}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600">
            View our full <Link to={createPageUrl('PrivacyPolicy')} className="text-blue-600 hover:underline">Privacy Policy</Link> for complete subprocessor details and DPA.
          </p>
        </div>
      </section>

      {/* Contact Security */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Security questions?
        </h2>
        <p className="text-gray-600 mb-8">
          Contact our security team at security@arkdata.io or schedule a call with our team.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          <Link to={createPageUrl('BookADemo')}>Book a security review</Link>
        </button>
      </section>
    </div>
  );
}