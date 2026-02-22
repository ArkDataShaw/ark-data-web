import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF' };

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', role: '', reason: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.Lead.create({
      name: form.name,
      email: form.email,
      company: form.company,
      role: form.role,
      message: `Reason: ${form.reason}\n\n${form.message}`,
      source_page: 'contact',
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Contact</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>Let's Talk.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7 }}>Have a question, need a custom quote, or want to explore a partnership? We're here.</p>
        </div>
      </section>

      <div className="sc" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px', alignItems: 'start' }}>
          {/* Left */}
          <div>
            <div style={{ marginBottom: '32px' }}>
              <p style={{ color: S.muted, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Get in touch</p>
              <a href="mailto:hello@arkdata.io" style={{ color: '#fff', fontWeight: 700, fontSize: '16px', display: 'block', marginBottom: '8px' }}>hello@arkdata.io</a>
              <p style={{ color: S.muted, fontSize: '13px' }}>We respond within 1 business day</p>
            </div>
            <div style={{ borderTop: '1px solid #0A2142', paddingTop: '28px', marginBottom: '28px' }}>
              <p style={{ color: S.muted, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Book a Call</p>
              <p style={{ color: S.muted, fontSize: '13px', marginBottom: '16px' }}>Schedule a 30-minute walkthrough with our team.</p>
              <Link to={createPageUrl('BookADemo')}>
                <button className="ark-btn-red" style={{ padding: '11px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Book a Call <ArrowRight size={14} />
                </button>
              </Link>
            </div>
            <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '8px', padding: '20px' }}>
              <p style={{ color: '#DFFFEF', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>What to expect</p>
              {['Response within 1 business day', 'No hard sales pressure', 'Honest fit assessment', 'Compliance-first approach'].map(e => (
                <div key={e} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ color: '#DFFFEF', fontSize: '12px' }}>{e}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Form */}
          {submitted ? (
            <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', background: '#042016', border: '1px solid #063524', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={24} style={{ color: '#22c55e' }} />
              </div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '10px' }}>Message received</h3>
              <p style={{ color: S.muted, fontSize: '14px' }}>We'll respond within 1 business day.</p>
            </div>
          ) : (
            <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '40px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>Name</label>
                    <input className="ark-input" required placeholder="Jane Smith" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>Email</label>
                    <input className="ark-input" required type="email" placeholder="jane@co.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>Company</label>
                    <input className="ark-input" placeholder="Acme Corp" value={form.company} onChange={e => set('company', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>Your Role</label>
                    <input className="ark-input" placeholder="VP Sales" value={form.role} onChange={e => set('role', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>Reason for Contact</label>
                  <select className="ark-select" required value={form.reason} onChange={e => set('reason', e.target.value)}>
                    <option value="">Select reason</option>
                    {['General inquiry', 'Pricing question', 'Technical question', 'Partnership / Reseller', 'Security / Compliance', 'Press / Media', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>Message</label>
                  <textarea className="ark-textarea" rows={5} required placeholder="Tell us what you're trying to solve..." value={form.message} onChange={e => set('message', e.target.value)} />
                </div>
                <button type="submit" disabled={loading} className="ark-btn-red" style={{ padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? 'Sending...' : <><span>Send Message</span><ArrowRight size={16} /></>}
                </button>
                <p style={{ color: S.muted, fontSize: '11px', textAlign: 'center' }}>We respond within 1 business day · Compliance-first</p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}