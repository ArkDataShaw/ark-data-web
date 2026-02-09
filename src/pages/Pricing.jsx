import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const { data: plans = [] } = useQuery({
    queryKey: ['pricing_plans'],
    queryFn: () => base44.entities.PricingPlan.list(),
  });

  const features = [
    'Visitor identification',
    'Intent scoring',
    'Lost traffic alerts',
    'CRM integrations',
    'Email sync',
    'API access',
    'Custom reporting',
    'SSO/SAML',
  ];

  const tierFeatures = {
    Starter: [true, true, true, true, false, false, false, false],
    Growth: [true, true, true, true, true, true, true, false],
    Enterprise: [true, true, true, true, true, true, true, true],
  };

  return (
    <div className="bg-white dark:bg-black">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Pricing that grows with you
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Choose the plan that's right for your team. No contract required, cancel anytime.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={billingCycle === 'monthly' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-700"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={billingCycle === 'annual' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}>
            Annual <span className="text-sm text-green-600 ml-2">Save 20%</span>
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.length > 0 ? (
            plans.map((plan, idx) => {
              const price = billingCycle === 'monthly' ? plan.price_monthly : Math.floor(plan.price_annual / 12);
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl p-8 transition-all ${
                    plan.highlighted
                      ? 'border-2 border-blue-600 ring-4 ring-blue-100 dark:ring-blue-900 bg-gradient-to-br from-blue-50 dark:from-blue-950 to-white dark:to-gray-900'
                      : 'border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="mb-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{plan.who_its_for}</p>

                  <div className="mb-6">
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${price || 'Contact'}
                    </p>
                    {price > 0 && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">/month{billingCycle === 'annual' && ', billed annually'}</p>}
                  </div>

                  <button className={`w-full py-3 px-4 rounded-lg font-semibold transition mb-8 ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700'
                      : 'border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}>
                    <Link to={createPageUrl('BookADemo')}>
                      {plan.cta_text || 'Get Started'}
                    </Link>
                  </button>

                  {plan.features && (
                    <div className="space-y-3">
                      {plan.features.map((feature, fidx) => (
                        <div key={fidx} className="flex items-start gap-3">
                          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Default tier cards if no data
            ['Starter', 'Growth', 'Enterprise'].map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-8 border ${
                  idx === 1 ? 'border-blue-600 ring-4 ring-blue-100' : 'border-gray-200'
                }`}
              >
                {idx === 1 && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{tier}</h3>
                <p className="text-4xl font-bold text-gray-900 mb-8">
                  ${idx === 0 ? '199' : idx === 1 ? '599' : 'Custom'}
                </p>
                <button className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                  idx === 1
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-300 hover:border-blue-600'
                }`}>
                  <Link to={createPageUrl('BookADemo')}>Get Started</Link>
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Compare all features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Growth</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition">
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">{feature}</td>
                    <td className="text-center py-4 px-4">
                      {tierFeatures.Starter[idx] ? (
                        <CheckCircle className="text-green-600 mx-auto" size={20} />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {tierFeatures.Growth[idx] ? (
                        <CheckCircle className="text-green-600 mx-auto" size={20} />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {tierFeatures.Enterprise[idx] ? (
                        <CheckCircle className="text-green-600 mx-auto" size={20} />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Pricing questions?
        </h2>

        <div className="space-y-4">
           {[
            {
              q: "Can I switch plans anytime?",
              a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards, ACH transfers, and wire transfers for annual plans.",
            },
            {
              q: "Is there a free trial?",
              a: "Yes, we offer a 30-day free trial with full access to all Starter features. No credit card required.",
            },
            {
              q: "What's included in Enterprise?",
              a: "Enterprise includes custom field mapping, dedicated support, SLA guarantees, data residency options, and volume discounts.",
            },
          ].map((item, idx) => (
            <details
              key={idx}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 cursor-pointer group"
            >
              <summary className="font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                {item.q}
                <span className="text-blue-600 group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-gray-700 dark:text-gray-300 mt-4">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            <Link to={createPageUrl('BookADemo')}>Schedule a demo</Link>
          </button>
        </div>
      </section>
    </div>
  );
}