import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CaseStudies() {
  const { data: caseStudies = [] } = useQuery({
    queryKey: ['case_studies'],
    queryFn: () => base44.entities.CaseStudy.filter({ published: true }),
  });

  const defaultStudies = [
    {
      id: '1',
      title: 'From 0 to 3,000 Qualified Leads',
      company: 'SaaS Startup (B2B)',
      industry: 'Sales Intelligence',
      problem: 'Early-stage team losing 80% of website traffic to form abandonment and didn\'t know who was visiting.',
      approach: 'Installed Ark Data pixel, integrated with Salesforce, and set up automated routing for high-intent visitors.',
      outcomes: 'Recovered 3,000 previously lost leads in 90 days and increased sales productivity by 40%.',
      metrics: [
        { label: 'Lost Visitors Recovered', value: '3,000' },
        { label: 'Conversion Rate Lift', value: '+15%' },
        { label: 'Sales Productivity Gain', value: '+40%' },
      ],
      quote: 'Ark Data turned our greatest weakness—lost traffic—into our biggest pipeline opportunity.',
      quote_author: 'Sales Director, Growth Stage SaaS',
    },
    {
      id: '2',
      title: 'Reducing CAC by 30% with Intent Scoring',
      company: 'Mid-Market SaaS',
      industry: 'Marketing Automation',
      problem: 'High ad spend but low-quality leads were inflating customer acquisition cost (CAC).',
      approach: 'Used Ark Data intent scores to filter high-fit prospects and improved retargeting audiences in Google Ads.',
      outcomes: 'Reduced CAC by 30% and increased marketing-influenced pipeline by $2M ARR.',
      metrics: [
        { label: 'CAC Reduction', value: '-30%' },
        { label: 'Pipeline Lift', value: '+$2M' },
        { label: 'Ad Spend Efficiency', value: '+52%' },
      ],
      quote: 'We finally have visibility into which visitors are actually ready to buy, not just clicking ads.',
      quote_author: 'VP Marketing, Mid-Market SaaS',
    },
    {
      id: '3',
      title: 'Scaling Global Sales with Unified Lead Routing',
      company: 'Enterprise SaaS',
      industry: 'Enterprise Sales',
      problem: 'Multiple sales teams across regions had no unified view of incoming leads—leads fell through the cracks.',
      approach: 'Built custom routing rules in Ark Data based on company size, location, industry to auto-assign to right reps.',
      outcomes: 'Improved lead response time from 8 hours to 15 minutes and won 22% more deals.',
      metrics: [
        { label: 'Response Time', value: '93% faster' },
        { label: 'Deals Won', value: '+22%' },
        { label: 'Team Efficiency', value: '+35%' },
      ],
      quote: 'Ark Data is the backbone of our global sales operation now.',
      quote_author: 'VP Sales, Enterprise Account',
    },
  ];

  const studies = caseStudies.length > 0 ? caseStudies : defaultStudies;

  return (
    <div className="bg-white dark:bg-black">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          How leading teams use Ark Data
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          See real results from companies that transformed their lead pipeline with Ark Data.
        </p>
      </section>

      {/* Case Studies Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-20">
          {studies.map((study, idx) => (
            <div key={study.id || idx} className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="bg-gradient-to-br from-blue-50 dark:from-blue-950 to-purple-50 dark:to-purple-950 rounded-xl p-12 h-96 flex items-center justify-center">
                  <div className="text-center text-gray-400 dark:text-gray-600">
                    <TrendingUp className="mx-auto mb-4 opacity-50" size={48} />
                    <span className="text-sm">Results visualization</span>
                  </div>
                </div>
              </div>

              <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="mb-4">
                   <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase">Case Study</span>
                   <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-2">{study.title}</h3>
                   <p className="text-gray-600 dark:text-gray-400">
                     <strong>{study.company}</strong> • {study.industry}
                   </p>
                 </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">The Challenge</h4>
                    <p className="text-gray-700 dark:text-gray-300">{study.problem}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Our Approach</h4>
                    <p className="text-gray-700 dark:text-gray-300">{study.approach}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">The Results</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{study.outcomes}</p>
                    <div className="grid grid-cols-3 gap-4">
                      {study.metrics && study.metrics.map((metric, midx) => (
                        <div key={midx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{metric.value}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {study.quote && (
                   <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border-l-4 border-blue-600 dark:border-blue-400">
                     <p className="text-gray-700 dark:text-gray-300 italic mb-3">"{study.quote}"</p>
                     <p className="text-sm text-gray-600 dark:text-gray-400">{study.quote_author}</p>
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to write your success story?</h2>
          <p className="text-lg mb-8 opacity-90">
            See how Ark Data can transform your sales and marketing pipeline.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center gap-2">
            <Link to={createPageUrl('BookADemo')}>Start a free trial</Link>
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}