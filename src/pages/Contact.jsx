import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Mail, MessageSquare, Calendar } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', role: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.Lead.create({
      ...form,
      source_page: 'contact',
      status: 'new',
    });
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ background: '#000002', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px' }}>
          <div style={{ width: '64px', height: '64px', background: '#042016', border: '1px solid #063524', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Mail size={28} style={{ color: '#22c55e' }} />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '28px', letterSpacing: '-0.8px', marginBottom: '12px' }}>Message Received.</h2>
          <p style={{ color: S.muted, fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>Thanks for reaching out. We typically respond within 1 business day.</p>
          <Link to={createPageUrl('Home')}>
            <button className="ark-btn-blue" style={{ padding: '12px 28px', fontSize: '14px' }}>Back to Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <p style={{ color: S.red, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Contact Us</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>Let's Talk Data.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7 }}>Questions about the platform, pricing, or your specific use case - we're here to help.</p>
        </div>
      </section>

      <section className="sp">
        <div className="sc" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '48px', alignItems: 'start' }}>

          {/* Left: Contact Options */}
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '24px' }}>Other Ways to Reach Us</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {[
                { icon: Calendar, title: 'Book a Call', desc: 'Get a 30-min walkthrough of the platform tailored to your use case.', cta: 'Book Now', page: 'BookADemo', color: '#B1001A' },
                { icon: Mail, title: 'Email Us', desc: 'Reach our team directly at hello@arkdata.io', cta: 'hello@arkdata.io', href: 'mailto:hello@arkdata.io', color: '#1a5ca8' },
                { icon: MessageSquare, title: 'Sales Inquiry', desc: 'Interested in custom pricing or enterprise contracts? Our sales team is ready.', cta: 'Contact Sales', page: 'BookADemo', color: '#063524' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', background: item.color + '33', border: `1px solid ${item.color}55`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={18} style={{ color: item.color === '#B1001A' ? '#ff4a6a' : item.color === '#1a5ca8' ? '#4a9aff' : '#22c55e' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{item.title}</h3>
                        <p style={{ color: S.muted, fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>{item.desc}</p>
                        {item.href ? (
                          <a href={item.href} style={{ color: '#4a9aff', fontSize: '13px', fontWeight: 600 }}>{item.cta}</a>
                        ) : (
                          <Link to={createPageUrl(item.page)}>
                            <button className="ark-btn-blue" style={{ padding: '7px 16px', fontSize: '12px' }}>{item.cta} →</button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '10px', padding: '24px' }}>
              <p style={{ color: '#DFFFEF', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Response Time</p>
              <p style={{ color: '#DFFFEF', fontSize: '13px', lineHeight: 1.65 }}>We respond to all inquiries within <strong>1 business day</strong>. For urgent matters, book a call directly.</p>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '14px', padding: '40px' }}>
            <h2 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>Send Us a Message</h2>
            <p style={{ color: S.muted, fontSize: '13px', marginBottom: '28px' }}>Fill out the form and we'll get back to you shortly.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Name *</label>
                  <input className="ark-input" required placeholder="Jane Smith"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Work Email *</label>
                  <input className="ark-input" type="email" required placeholder="jane@company.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Company</label>
                  <input className="ark-input" placeholder="Acme Corp"
                    value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                </div>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Your Role</label>
                  <input className="ark-input" placeholder="Head of Revenue"
                    value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Message *</label>
                <textarea className="ark-textarea" required rows={5} placeholder="Tell us about your use case, questions, or what you're looking to achieve..."
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="ark-btn-red" disabled={loading}
                style={{ padding: '14px', fontSize: '15px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending...' : <><span>Send Message</span><ArrowRight size={16} /></>}
              </button>
              <p style={{ color: '#4a6a9a', fontSize: '12px', textAlign: 'center' }}>We respond within 1 business day · Compliance-first</p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}