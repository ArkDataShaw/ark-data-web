import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function Integrations() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const integrations = [
    {
      name: 'Salesforce',
      category: 'crm',
      desc: 'Sync leads and contacts in real-time',
      syncs: ['Leads', 'Contacts', 'Accounts'],
      auth: 'OAuth 2.0',
    },
    {
      name: 'HubSpot',
      category: 'crm',
      desc: 'Direct integration with HubSpot CRM',
      syncs: ['Contacts', 'Companies', 'Deals'],
      auth: 'OAuth 2.0',
    },
    {
      name: 'Pipedrive',
      category: 'crm',
      desc: 'Automated lead creation and routing',
      syncs: ['Leads', 'Persons', 'Organizations'],
      auth: 'API Key',
    },
    {
      name: 'Klaviyo',
      category: 'email',
      desc: 'Email marketing sync and segmentation',
      syncs: ['Profiles', 'Events', 'Lists'],
      auth: 'API Key',
    },
    {
      name: 'Mailchimp',
      category: 'email',
      desc: 'Subscriber sync and audience building',
      syncs: ['Contacts', 'Lists'],
      auth: 'OAuth 2.0',
    },
    {
      name: 'Slack',
      category: 'notifications',
      desc: 'Real-time alerts in your Slack workspace',
      syncs: ['Events', 'Alerts'],
      auth: 'OAuth 2.0',
    },
    {
      name: 'Zapier',
      category: 'automation',
      desc: 'Connect to 5000+ apps with Zapier',
      syncs: ['Events', 'Webhooks'],
      auth: 'Webhooks',
    },
    {
      name: 'Make (formerly Integromat)',
      category: 'automation',
      desc: 'Advanced workflow automation',
      syncs: ['Events', 'Data Sync'],
      auth: 'Webhooks',
    },
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'crm', label: 'CRM' },
    { id: 'email', label: 'Email & Marketing' },
    { id: 'automation', label: 'Automation' },
    { id: 'notifications', label: 'Notifications' },
  ];

  const filtered = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  return (
    <div className="bg-white dark:bg-black">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Native integrations with your entire stack
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Connect Ark Data to your CRM, email platform, and automation tools. Real-time, bi-directional sync.
        </p>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Integration Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((integration, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{integration.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{integration.desc}</p>

              <div className="mb-6 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">What Syncs</p>
                   <div className="flex flex-wrap gap-2">
                     {integration.syncs.map((sync, sidx) => (
                       <span key={sidx} className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {sync}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Auth Type</p>
                   <p className="text-sm text-gray-700 dark:text-gray-300">{integration.auth}</p>
                </div>
              </div>

              <button className="w-full text-blue-600 font-semibold py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2">
                <span>View Setup</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Integration */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Don't see your tool?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Use our REST API and webhooks to build custom integrations in minutes.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            <Link to={createPageUrl('BookADemo')}>Contact our team</Link>
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          How integrations work
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
           {[
            {
              step: 1,
              title: 'Connect your tool',
              desc: 'Authenticate with OAuth or API key—takes 30 seconds.',
            },
            {
              step: 2,
              title: 'Map your fields',
              desc: 'Configure which Ark Data fields sync to your CRM schema.',
            },
            {
              step: 3,
              title: 'Set rules & go live',
              desc: 'Choose real-time or batch sync, then activate.',
            },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold">{item.step}</span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Support */}
      <section className="bg-blue-50 dark:bg-blue-950 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Secure and supported
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
             {[
              { title: 'Enterprise Security', items: ['OAuth 2.0 / API key encryption', 'End-to-end TLS', 'SOC 2 Type II compliance'] },
              { title: 'Developer Support', items: ['REST API documentation', 'Webhook event specs', 'Dedicated integration support'] },
            ].map((section, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">{section.title}</h3>
                <ul className="space-y-2">
                   {section.items.map((item, iidx) => (
                     <li key={iidx} className="flex items-start gap-2">
                       <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                       <span className="text-gray-700 dark:text-gray-300">{item}</span>
                     </li>
                   ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to activate your stack?</h2>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            <Link to={createPageUrl('BookADemo')}>Book a demo</Link>
          </button>
        </div>
      </section>
    </div>
  );
}