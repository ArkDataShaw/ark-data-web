import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const benefits = [
  'See how Ark Data resolves anonymous visitors into verified leads',
  'Walk through your specific use case and ICP',
  'Get a package recommendation tailored to your team size',
  'Live demo of CRM integration and data delivery',
];

export default function BookADemo() {
  const [form, setForm] = useState({ name: '', email: '', company: '', website: '', role: '', team_size: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    await base44.entities.Lead.create({
      name: form.name,
      email: form.email,
      company: form.company,
      website: form.website,
      role: form.role,
      message: `Team size: ${form.team_size}. ${form.message}`,
      source_page: 'BookADemo',
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      referrer: document.referrer || '',
      status: 'new',
    });
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ background: '#000002', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '72px', height: '72px', background: '#042016', border: '1px solid #063524', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <CheckCircle size={36} style={{ color: '#22c55e' }} />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '32px', letterSpacing: '-1px', marginBottom: '12px' }}>You're booked in.</h1>
          <p style={{ color: S.muted, fontSize: '16px', lineHeight: 1.7, marginBottom: '32px' }}>
            We'll be in touch within 1 business day to confirm your call and send a calendar invite.
          </p>
          <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>What to expect on the call:</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {benefits.map(b => (
                <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: S.muted, fontSize: '13px' }}>
                  <CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />{b}
                </li>
              ))}
            </ul>
          </div>
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
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '64px 0 48px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#042016', border: '1px solid #063524', borderRadius: '100px', padding: '5px 14px', marginBottom: '20px' }}>
            <Calendar size={13} style={{ color: '#22c55e' }} />
            <span style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 600 }}>30-Minute Strategy Call</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '14px' }}>Book a Call with Ark Data</h1>
          <p style={{ color: S.muted, fontSize: '16px', lineHeight: 1.7 }}>
            Tell us about your use case and we'll walk you through how Ark Data fits your stack - live, with real data.
          </p>
        </div>
      </section>

      {/* Form + Benefits */}
      <section style={{ padding: '64px 0 80px' }}>
        <div className="sc">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start', maxWidth: '960px', margin: '0 auto' }}>

            {/* Left: Benefits */}
            <div>
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '20px', letterSpacing: '-0.4px' }}>What we'll cover</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
                {benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', background: '#042016', border: '1px solid #063524', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <CheckCircle size={13} style={{ color: '#22c55e' }} />
                    </div>
                    <p style={{ color: S.muted, fontSize: '14px', lineHeight: 1.6 }}>{b}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '24px' }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px', marginBottom: '14px' }}>Why teams choose Ark Data</p>
                {[
                  { metric: '74+', label: 'Enrichment fields per record' },
                  { metric: '40–60%', label: 'Visitor match rate' },
                  { metric: '<15min', label: 'Pixel install time' },
                  { metric: '1 week', label: 'Average go-live time' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid #0A2142' : 'none' }}>
                    <span style={{ color: S.muted, fontSize: '13px' }}>{s.label}</span>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '13px' }}>{s.metric}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '36px' }}>
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '24px' }}>Request your call</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Name *</label>
                    <input name="name" required value={form.name} onChange={handleChange} placeholder="Jane Smith" className="ark-input" />
                  </div>
                  <div>
                    <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Work Email *</label>
                    <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="jane@company.com" className="ark-input" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Company *</label>
                    <input name="company" required value={form.company} onChange={handleChange} placeholder="Acme Corp" className="ark-input" />
                  </div>
                  <div>
                    <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Website</label>
                    <input name="website" value={form.website} onChange={handleChange} placeholder="acme.com" className="ark-input" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Your Role</label>
                    <select name="role" value={form.role} onChange={handleChange} className="ark-select">
                      <option value="">Select role</option>
                      <option>Founder / CEO</option>
                      <option>Head of Marketing</option>
                      <option>Head of Sales</option>
                      <option>Demand Gen</option>
                      <option>RevOps</option>
                      <option>SDR / BDR</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Team Size</label>
                    <select name="team_size" value={form.team_size} onChange={handleChange} className="ark-select">
                      <option value="">Select size</option>
                      <option>1–5</option>
                      <option>6–25</option>
                      <option>26–100</option>
                      <option>100+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>What are you trying to solve?</label>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="e.g. We want to recover lost traffic and route leads to HubSpot..." className="ark-textarea" rows={4} />
                </div>
                <button type="submit" disabled={loading} className="ark-btn-red"
                  style={{ padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                  {loading ? 'Submitting...' : <><span>Request My Call</span> <ArrowRight size={16} /></>}
                </button>
                <p style={{ color: '#4a6a9a', fontSize: '11px', textAlign: 'center' }}>We respond within 1 business day · No spam, ever.</p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}