import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const partnerTypes = [
  { id: 'reseller', label: 'Reseller / Agency Partner', desc: 'White-label or resell Ark Data to your clients' },
  { id: 'data_provider', label: 'Data Provider', desc: 'Supply data into the Ark Data ecosystem' },
  { id: 'tech_partner', label: 'Technology Partner', desc: 'Integrate your platform with Ark Data' },
  { id: 'affiliate', label: 'Affiliate / Referral', desc: 'Refer clients and earn commissions' },
  { id: 'careers', label: 'Careers / Join the Team', desc: 'Explore open roles at Ark Data' },
];

export default function Apply() {
  const [form, setForm] = useState({
    name: '', company: '', role: '', email: '',
    partnership_type: '', monthly_volume: '', notes: '',
    website: '', industry: '',
  });
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
      website: form.website,
      message: `Partnership Type: ${form.partnership_type}\nMonthly Volume: ${form.monthly_volume}\nIndustry: ${form.industry}\nNotes: ${form.notes}`,
      source_page: 'apply',
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ background: '#000002', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '64px', height: '64px', background: '#042016', border: '1px solid #063524', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={28} style={{ color: '#22c55e' }} />
          </div>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '28px', marginBottom: '12px', letterSpacing: '-0.5px' }}>Application Received</h2>
          <p style={{ color: S.muted, fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
            Our partnerships team reviews every application carefully. We'll reach out within 2 business days.
          </p>
          <Link to={createPageUrl('Home')}>
            <button className="ark-btn-red" style={{ padding: '12px 28px', fontSize: '15px' }}>Return Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ maxWidth: '760px', textAlign: 'center' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Apply</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>Partner With Ark Data</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
            Whether you're a reseller, data provider, technology partner, or looking to join our team - we'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="sc" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px', alignItems: 'start' }}>
          {/* Left: Partnership types */}
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>Partnership Types</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
              {partnerTypes.map(pt => (
                <button key={pt.id} onClick={() => set('partnership_type', pt.id)}
                  style={{ textAlign: 'left', background: form.partnership_type === pt.id ? '#06162A' : '#020D1F', border: `1px solid ${form.partnership_type === pt.id ? '#1a5ca8' : '#0A2142'}`, borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{pt.label}</p>
                  <p style={{ color: S.muted, fontSize: '12px', lineHeight: 1.5 }}>{pt.desc}</p>
                </button>
              ))}
            </div>

            <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>What Happens Next</h4>
              {['Application reviewed by our team', 'Partnership call scheduled (1–2 biz days)', 'Agreement + onboarding materials sent', 'Go live with full partner support'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ color: '#B1001A', fontWeight: 800, fontSize: '12px', marginTop: '1px', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: S.mutedGreen, fontSize: '13px' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '40px' }}>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '8px' }}>Submit Your Application</h2>
            <p style={{ color: S.muted, fontSize: '13px', marginBottom: '32px' }}>All fields required unless marked optional.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Full Name</label>
                  <input className="ark-input" required placeholder="Jane Smith" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Email</label>
                  <input className="ark-input" required type="email" placeholder="jane@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Company</label>
                  <input className="ark-input" required placeholder="Acme Corp" value={form.company} onChange={e => set('company', e.target.value)} />
                </div>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Your Role</label>
                  <input className="ark-input" required placeholder="VP of Sales" value={form.role} onChange={e => set('role', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Website</label>
                  <input className="ark-input" placeholder="https://yoursite.com" value={form.website} onChange={e => set('website', e.target.value)} />
                </div>
                <div>
                  <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Industry</label>
                  <select className="ark-select" value={form.industry} onChange={e => set('industry', e.target.value)}>
                    <option value="">Select industry</option>
                    {['B2B SaaS', 'Healthcare', 'Financial Services', 'E-commerce', 'Logistics', 'Marketing Agency', 'Manufacturing', 'Other'].map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Partnership Type</label>
                <select className="ark-select" required value={form.partnership_type} onChange={e => set('partnership_type', e.target.value)}>
                  <option value="">Select type</option>
                  {partnerTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Estimated Monthly Volume (optional)</label>
                <select className="ark-select" value={form.monthly_volume} onChange={e => set('monthly_volume', e.target.value)}>
                  <option value="">Select range</option>
                  {['Under 5,000', '5,000–25,000', '25,000–100,000', '100,000+', 'Not sure yet'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Notes / Message</label>
                <textarea className="ark-textarea" rows={4} placeholder="Tell us about your use case, current stack, or what you're trying to accomplish..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>

              <button type="submit" disabled={loading} className="ark-btn-red" style={{ padding: '15px', fontSize: '15px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading ? 'Submitting...' : <><span>Submit Application</span><ArrowRight size={16} /></>}
              </button>
              <p style={{ color: S.muted, fontSize: '11px', textAlign: 'center' }}>We respond within 1–2 business days · Compliance-first</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}