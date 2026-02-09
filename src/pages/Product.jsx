import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Eye, TrendingUp, Layers, Bell } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function Product() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: 'Visitors',
      benefits: [
        'Real-time visitor identification and company resolution',
        'Technographic and firmographic data enrichment',
        'Behavioral and engagement scoring',
      ],
    },
    {
      label: 'Lost Traffic',
      benefits: [
        'Automatic detection of high-intent visitors who leave',
        'Exit intent and form abandonment tracking',
        'Sequential path and timing analysis',
      ],
    },
    {
      label: 'Analytics',
      benefits: [
        'Custom attribution modeling across channels',
        'ROI tracking per campaign and landing page',
        'Cohort and segmentation analysis',
      ],
    },
    {
      label: 'Integrations',
      benefits: [
        'Bi-directional sync with 20+ CRM and ESP platforms',
        'Custom field mapping and transformation',
        'Real-time or batch sync options',
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-black">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Deep visibility into every website visitor.
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
          Ark Data gives you complete insight into who's visiting your site, what they're interested in, and exactly when to reach out.
        </p>
      </section>

      {/* Feature Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-wrap gap-4 mb-12 border-b border-gray-200 dark:border-gray-800">
           {tabs.map((tab, idx) => (
             <button
               key={idx}
               onClick={() => setActiveTab(idx)}
               className={`pb-4 px-2 font-semibold transition-all ${
                 activeTab === idx
                   ? 'text-blue-600 border-b-2 border-blue-600'
                   : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
               }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {tabs[activeTab].benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-4">
                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                <p className="text-lg text-gray-700 dark:text-gray-300">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-blue-50 dark:from-blue-950 to-purple-50 dark:to-purple-950 rounded-2xl p-12 h-96 flex items-center justify-center">
            <div className="text-center">
              <Eye className="text-blue-600 mx-auto mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">{tabs[activeTab].label} Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive Sections */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Visitor Identification */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-xl p-8 shadow-sm h-80 flex items-center justify-center">
                <div className="text-gray-400 text-center">Visitor Profile Preview</div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Visitor Identification
              </h3>
              <p className="text-gray-700 mb-6">
                Resolve anonymous visitors to known companies and contacts with our proprietary enrichment engine.
              </p>
              <ul className="space-y-3">
                {[
                  'Match cookies to company and contact records',
                  'Firmographic data including funding, size, industry',
                  'Technology stack and tool usage insights',
                  'Decision-maker and team member detection',
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                <Link to={createPageUrl('BookADemo')}>Book a Demo</Link>
              </button>
            </div>
          </div>

          {/* Lost Traffic Dashboard */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Lost Traffic Dashboard
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Automatically identify high-intent visitors who left without filling out a form.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time alerts for qualified visitors leaving',
                  'Behavioral exit patterns and timing analysis',
                  'Form abandonment with field-level insights',
                  'One-click outreach with pre-populated context',
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm h-80 flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-600 text-center">Dashboard Preview</div>
            </div>
          </div>

          {/* Routing & Automation */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm h-80 flex items-center justify-center">
                <div className="text-gray-400 dark:text-gray-600 text-center">Integration Flow</div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Routing & Automation
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Send qualified leads to your CRM, email platform, or Slack instantly with custom routing rules.
              </p>
              <ul className="space-y-3">
                {[
                  'Rule-based lead routing (by company, intent, role)',
                  'Custom field mapping to your CRM schema',
                  'Real-time or scheduled batch sync',
                  'Audit trail and webhook logging',
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Checklist */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Everything included
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[
            'Visitor identification engine',
            'Intent scoring (AI-powered)',
            'Lost traffic alerts',
            'CRM integrations (Salesforce, HubSpot, Pipedrive)',
            'Email sync (Klaviyo, Mailchimp)',
            'Real-time webhooks',
            'API access',
            'Custom reporting',
            'SSO & SAML',
            'Data residency options',
            'Dedicated support',
            'SLA guarantees',
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to see it in action?</h2>
          <p className="text-lg mb-8 opacity-90">
            Get a personalized walkthrough of how Ark Data will transform your team's efficiency.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            <Link to={createPageUrl('BookADemo')}>Schedule a demo</Link>
          </button>
        </div>
      </section>
    </div>
  );
}