import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Target, Zap, Shield, BarChart3, TrendingUp, Layers } from 'lucide-react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

// Reusable CTA Button
const CTAButton = ({ primary = false, children, href, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
      primary
        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1'
        : 'border-2 border-gray-300 text-gray-900 hover:border-blue-600 hover:text-blue-600'
    }`}
  >
    <Link to={href} className="flex items-center gap-2">
      {children}
      {primary && <ArrowRight size={18} />}
    </Link>
  </button>
);

export default function Home() {
  const [testimonials, setTestimonials] = useState([]);
  const [logos, setLogos] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [expandedFAQ, setExpandedFAQ] = useState(0);

  const { data: testimonialsData } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => base44.entities.Testimonial.list(),
  });

  const { data: logosData } = useQuery({
    queryKey: ['logos'],
    queryFn: () => base44.entities.PartnerLogo.list(),
  });

  const { data: faqsData } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => base44.entities.FAQ.filter({ page_scope: 'home' }),
  });

  useEffect(() => {
    if (testimonialsData) setTestimonials(testimonialsData.slice(0, 3));
    if (logosData) setLogos(logosData.filter(l => l.category === 'customer').slice(0, 6));
    if (faqsData) setFaqs(faqsData.slice(0, 6));
  }, [testimonialsData, logosData, faqsData]);

  return (
    <div className="bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              See who's visiting your site—and act while intent is high.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Ark Data identifies high-intent visitors, enriches profiles, and routes leads to your CRM and marketing tools—without changing your funnel.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle size={18} className="text-green-600" />
                Fast setup (15 min)
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={18} className="text-green-600" />
                Works with your stack
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={18} className="text-green-600" />
                Privacy-first
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <CTAButton primary href={createPageUrl('BookADemo')}>
                Book a Demo
              </CTAButton>
              <CTAButton href={createPageUrl('HowItWorks')}>
                See How It Works
              </CTAButton>
            </div>
          </div>

          {/* Right: Product Mock */}
          <div className="relative hidden lg:block">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=500&fit=crop" 
              alt="Analytics Dashboard" 
              className="rounded-2xl shadow-xl object-cover w-full h-96"
            />
          </div>
        </div>
      </section>

      {/* Logo Strip */}
      {logos.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-8">
              Trusted by teams at leading companies
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
              {logos.map((logo) => (
                <div key={logo.id} className="flex items-center justify-center">
                  {logo.image_url ? (
                    <img src={logo.image_url} alt={logo.name} className="h-8 opacity-60 hover:opacity-100 transition" />
                  ) : (
                    <div className="bg-gray-300 h-8 w-24 rounded"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Most visitors never fill out a form.
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Traditional analytics shows <strong>WHAT</strong> happened—but not <strong>WHO</strong> it was.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Ark Data helps you learn <strong>WHO visited</strong> (when identifiable) and their intent signals.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                <strong>Activate outreach</strong> while interest is fresh—before they go dark.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Pillars */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Three core capabilities
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
            Built to identify, enrich, and activate your most valuable anonymous visitors.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Lost Traffic Recovery</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Identify high-intent visitors who left without converting and understand why they departed.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300">Pixel-based session tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Exit intent detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Form abandonment capture</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Behavioral path analysis</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Intent Signals & Enrichment</h3>
              <p className="text-gray-600 mb-6">
                Automatically enrich visitor profiles with company data, technographics, and buying signals.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Company profile resolution</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Technology stack detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Intent scoring engine</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Fit scoring (your ICP)</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Layers className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Activation & Routing</h3>
              <p className="text-gray-600 mb-6">
                Route leads to your CRM, ESP, or sales stack in real-time with zero manual work.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Real-time CRM sync</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Routing rules engine</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Alert & notification system</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Custom field mapping</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Stepper */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-16">
          How Ark Data works
        </h2>

        <div className="grid md:grid-cols-5 gap-4 md:gap-2">
          {[
            { num: 1, title: 'Install pixel', desc: 'Add 1 line of code to your site' },
            { num: 2, title: 'Capture sessions', desc: 'Track behavior & attribution' },
            { num: 3, title: 'Resolve identities', desc: 'Enrich visitor data' },
            { num: 4, title: 'Score intent', desc: 'AI-powered signal detection' },
            { num: 5, title: 'Sync & activate', desc: 'Route to CRM/ESP/tools' },
          ].map((step, idx) => (
            <div key={idx} className="relative">
              <div className="bg-white border-2 border-blue-600 rounded-xl p-6 text-center h-full flex flex-col justify-between">
                <div className="mb-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
              {idx < 4 && (
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 text-blue-600 text-2xl -translate-y-1/2">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <CTAButton primary href={createPageUrl('HowItWorks')}>
            See detailed implementation guide
          </CTAButton>
        </div>
      </section>

      {/* Use Cases by Role */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-16">
            Built for your entire team
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                role: 'Sales',
                desc: 'Prioritize outreach by intent score and fit.',
                icon: TrendingUp,
              },
              {
                role: 'Marketing',
                desc: 'Improve retargeting audiences and campaign ROI.',
                icon: BarChart3,
              },
              {
                role: 'RevOps',
                desc: 'Clean routing, consistent enrichment, and audit trails.',
                icon: Target,
              },
              {
                role: 'Agencies',
                desc: 'Prove traffic quality and ROI to clients.',
                icon: Shield,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition">
                  <Icon className="text-blue-600 mx-auto mb-4" size={32} />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.role}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-16">
            Loved by revenue teams
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                <div className="flex gap-4 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  {testimonial.avatar_url && (
                    <img src={testimonial.avatar_url} alt={testimonial.name} className="w-10 h-10 rounded-full" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.title} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Integrations Teaser */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Integrates with your entire stack
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Connect Ark Data to your CRM, email, automation, and ad platforms in minutes.
          </p>
          <CTAButton primary href={createPageUrl('Integrations')}>
            View all integrations
          </CTAButton>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-16">
          Pricing that scales with you
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {['Starter', 'Growth', 'Enterprise'].map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-8 ${
                idx === 1 ? 'border-2 border-blue-600 ring-4 ring-blue-100' : 'border border-gray-200'
              }`}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tier}</h3>
              <p className="text-gray-600 text-sm mb-6">
                {idx === 0 && 'For small teams testing the platform'}
                {idx === 1 && 'For teams ready to scale'}
                {idx === 2 && 'Custom pricing and support'}
              </p>
              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-900">
                  {idx === 2 ? 'Custom' : `$${[199, 599, 0][idx]}`}
                </p>
                {idx !== 2 && <p className="text-sm text-gray-600">/month</p>}
              </div>
              <button className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                idx === 1
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 text-gray-900 hover:border-blue-600'
              }`}>
                <Link to={createPageUrl('BookADemo')}>Get Started</Link>
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to={createPageUrl('Pricing')} className="text-blue-600 font-semibold hover:text-blue-700">
            View full pricing & features →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900 py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Frequently asked questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === idx ? -1 : idx)}
                    className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white text-left">{faq.question}</span>
                    <span className={`text-blue-600 transition-transform ${expandedFAQ === idx ? 'rotate-180' : ''}`}>
                      ↓
                    </span>
                  </button>
                  {expandedFAQ === idx && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Turn your lost traffic into pipeline today.
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Get a personalized demo and see Ark Data in action. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              <Link to={createPageUrl('BookADemo')}>Book a Demo</Link>
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              <Link to={createPageUrl('Contact')}>Contact Sales</Link>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}