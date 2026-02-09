import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function BookADemo() {
  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Benefits */}
          <div className="lg:col-span-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Book your demo
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Pick a time that works for you and see Ark Data in action. No sales pitch—just a personalized walkthrough.
            </p>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              What you'll learn
            </h3>

            <div className="space-y-6">
              {[
                {
                  title: 'Real-time identification',
                  desc: 'See how to identify visitors as they browse',
                },
                {
                  title: 'Intent scoring',
                  desc: 'Understand how we rank leads by likelihood to convert',
                },
                {
                  title: 'Integration setup',
                  desc: 'Quick walk-through of plugging into your CRM',
                },
                {
                  title: 'ROI calculator',
                  desc: 'Estimate pipeline impact for your use case',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <strong>Time needed:</strong> 20-30 minutes
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Who should join:</strong> Sales, Marketing, or RevOps lead
              </p>
            </div>
          </div>

          {/* Right: Calendly Embed */}
          <div className="lg:col-span-1">
            <div
              className="calendly-inline-widget rounded-lg overflow-hidden"
              data-url="https://calendly.com/arkdata/demo?hide_event_type_details=1&background_color=ffffff"
              style={{ minWidth: '320px', height: '700px' }}
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Having trouble scheduling? Contact us at{' '}
            <a href="mailto:hello@arkdata.io" className="text-blue-600 dark:text-blue-400 hover:underline">
              hello@arkdata.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}