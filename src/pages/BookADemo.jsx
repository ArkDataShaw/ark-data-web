import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';

export default function BookADemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    role: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { mutate: submitLead, isLoading } = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Lead.create({
        ...data,
        source_page: 'book-a-demo',
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', website: '', role: '', message: '' });
    },
    onError: (err) => {
      setError(err.message || 'Something went wrong. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) {
      setError('Please fill in all required fields');
      return;
    }
    submitLead(formData);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {submitted ? (
          // Success State
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Demo request received!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              We'll reach out within 1 business day to schedule your personalized walkthrough.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What happens next:</h3>
              <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>1. We'll send a calendar link to <strong>{formData.email}</strong></li>
                <li>2. Pick a time that works for you (15-30 min)</li>
                <li>3. Join the call and see Ark Data in action</li>
              </ol>
            </div>
            <Link
              to={createPageUrl('Home')}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          // Form State
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left: Benefits */}
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                What you'll learn
              </h2>

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

            {/* Right: Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acme Corp"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="www.company.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Your Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a role...</option>
                    <option value="Sales">Sales Leader</option>
                    <option value="Marketing">Marketing Leader</option>
                    <option value="RevOps">RevOps</option>
                    <option value="C-Suite">C-Suite</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Questions or specific use case?
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us a bit about your team and goals..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {isLoading ? 'Submitting...' : 'Book Your Demo'}
                  {!isLoading && <ArrowRight size={20} />}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By submitting this form, you agree to our{' '}
                  <Link to={createPageUrl('PrivacyPolicy')} className="text-blue-600 dark:text-blue-400 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}