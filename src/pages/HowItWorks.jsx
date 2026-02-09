import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Copy, Zap, Brain, Layers } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function HowItWorks() {
  return (
    <div className="bg-white dark:bg-black">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Get Ark Data running in 15 minutes
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Five simple steps from pixel install to your first qualified lead. No code required.
        </p>
      </section>

      {/* 5-Step Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {[
            {
              num: 1,
              title: 'Install the pixel',
              desc: 'Add one line of code to your site header.',
              icon: Copy,
              details: [
                'Copy your unique tracking pixel',
                'Add to <head> or use GTM',
                'Verify installation in dashboard',
              ],
              time: '2 min',
            },
            {
              num: 2,
              title: 'Capture sessions',
              desc: 'Ark Data starts tracking visitor behavior immediately.',
              icon: Zap,
              details: [
                'Real-time session logging begins',
                'Behavior events and page flow captured',
                'Attribution data collected automatically',
              ],
              time: '1 min',
            },
            {
              num: 3,
              title: 'Resolve identities',
              desc: 'We enrich anonymous sessions with company data.',
              icon: Brain,
              details: [
                'IP geolocation and ISP lookup',
                'Company profile resolution',
                'Technographic data appended',
              ],
              time: '1 min (ongoing)',
            },
            {
              num: 4,
              title: 'Score intent',
              desc: 'AI model ranks visitor fit and buying stage.',
              icon: Layers,
              details: [
                'Intent scoring (0-100)',
                'Fit scoring against your ICP',
                'Lost traffic detection',
              ],
              time: '1 min (ongoing)',
            },
            {
              num: 5,
              title: 'Sync to your stack',
              desc: 'Connect your CRM, ESP, or custom webhooks.',
              icon: CheckCircle,
              details: [
                'OAuth or API key authentication',
                'Field mapping to your schema',
                'Real-time or batch sync',
              ],
              time: '5 min',
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                       Step {step.num}: {step.title}
                     </h3>
                     <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">{step.desc}</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                         <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                         <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                       </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <strong>Time needed:</strong> {step.time}
                  </p>
                </div>

                <img 
                  src={[
                    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1460925895917-adf4e565e479?w=500&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=400&fit=crop',
                  ][step.num - 1]}
                  alt={`Step ${step.num}: ${step.title}`}
                  className="rounded-xl h-96 w-full object-cover shadow-lg"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Implementation timeline
          </h2>

          <div className="space-y-6">
             {[
              { phase: 'Pre-launch', items: ['Request Ark Data account', 'Get API keys + tracking pixel'] },
              { phase: 'Day 1', items: ['Install pixel code', 'Enable CRM integration', 'Run test leads'] },
              { phase: 'Days 2–3', items: ['Validate data quality', 'Configure routing rules', 'Train team'] },
              { phase: 'Day 4+', items: ['Go live', 'Monitor performance', 'Optimize scoring'] },
            ].map((timeline, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{timeline.phase}</h3>
                <ul className="space-y-2">
                   {timeline.items.map((item, iidx) => (
                     <li key={iidx} className="flex items-start gap-3">
                       <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={16} />
                       <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                     </li>
                   ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Need */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          What you need to get started
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
           {[
            {
              title: 'Your domain',
              items: [
                'Admin access to your website',
                'Ability to add code to site header',
                'Or access to Google Tag Manager',
              ],
            },
            {
              title: 'CRM or ESP',
              items: [
                'Salesforce, HubSpot, or Pipedrive',
                'Or Klaviyo, Mailchimp for email',
                'Or custom webhook endpoint',
              ],
            },
            {
              title: 'Team alignment',
              items: [
                '1-2 hour onboarding with your team',
                'Dedicated point of contact',
                'Quarterly success reviews',
              ],
            },
          ].map((section, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                 {section.items.map((item, iidx) => (
                   <li key={iidx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                     <span className="text-blue-600 font-bold mt-1">✓</span>
                     <span>{item}</span>
                   </li>
                 ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Support */}
      <section className="bg-blue-50 dark:bg-blue-950 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            We handle the heavy lifting
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Our onboarding specialists will walk you through every step. We're not done until you're fully set up and seeing results.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            <Link to={createPageUrl('BookADemo')}>Start your implementation</Link>
          </button>
        </div>
      </section>
    </div>
  );
}