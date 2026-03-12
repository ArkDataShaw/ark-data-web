import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF' };

export default function HowItWorks() {
  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>How It Works</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>From Pixel to Pipeline in Minutes.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>Ark Data connects to your site and stack, enriches every session with 74+ data fields, and delivers actionable leads directly to your CRM and activation tools.</p>
        </div>
      </section>

      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {[
              { num: '01', title: 'Install the Pixel', desc: 'Drop our lightweight async pixel onto your site - under 2KB, zero performance impact. Works on any platform: WordPress, Webflow, Shopify, React, or custom builds.', time: '15 min', details: ['Copy/paste single script tag', 'Works on all major platforms', 'Lightweight, minimal performance impact', 'Confirmation in dashboard instantly'] },
              { num: '02', title: 'Connect Your Stack', desc: 'Connect your CRM, outreach tools, and marketing platforms via API key. Map fields to your schema. We handle the rest automatically.', time: '1–2 hours', details: ['Resend, Instantly, Go High Level, HubSpot', 'Klaviyo, Clay, HeyReach, Custom HTTP', 'Custom field mapping to your schema', 'Plus any platform via custom webhook'] },
              { num: '03', title: 'Ark Identifies & Enriches', desc: 'Every session is resolved against our identity graph - sourced from 40+ licensed data brokers and validated via credit bureau skiptrace - then enriched with 74+ fields of contact, demographic, and company data.', time: 'Real-time', details: ['40–60% visitor resolution rate', '74+ enrichment fields appended', '~72% of resolved visitors include company data', 'ICP matching configured at onboarding'] },
              { num: '04', title: 'Leads Flow to Your Stack', desc: 'Enriched leads are routed to your CRM, triggered into outbound sequences, and pushed to your marketing tools - all automatically.', time: 'Instant', details: ['CRM record creation or update', 'Sequence/cadence trigger', 'Meta ad audience sync', 'Webhook notifications'] },
            ].map((step, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', background: i % 2 === 0 ? '#06162A' : '#042016', border: `1px solid ${i % 2 === 0 ? '#0A2142' : '#063524'}`, borderRadius: '12px', padding: '40px', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#1a4a8a', fontWeight: 900, fontSize: '56px', letterSpacing: '-2px', marginBottom: '12px' }}>{step.num}</p>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '12px' }}>{step.title}</h3>
                  <p style={{ color: i % 2 === 0 ? S.muted : '#DFFFEF', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>{step.desc}</p>
                  <span style={{ background: '#042016', border: '1px solid #063524', borderRadius: '100px', padding: '4px 12px', color: '#DFFFEF', fontSize: '11px', fontWeight: 600 }}>Setup time: {step.time}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {step.details.map((d, di) => (
                    <div key={di} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: i % 2 === 0 ? '#020D1F' : '#06162A', border: `1px solid ${i % 2 === 0 ? '#0A2142' : '#0A2142'}`, borderRadius: '8px', padding: '14px' }}>
                      <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ color: i % 2 === 0 ? S.muted : '#DFFFEF', fontSize: '12px', lineHeight: 1.5 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#06162A', borderTop: '1px solid #0A2142', padding: '60px 0' }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 900, fontSize: '28px', letterSpacing: '-0.8px', marginBottom: '12px' }}>Ready to see it live?</h2>
          <p style={{ color: S.muted, fontSize: '15px', marginBottom: '28px' }}>Book a 30-minute walkthrough and we'll show you the full flow against your own website.</p>
          <Link to={createPageUrl('BookADemo')}>
            <button className="ark-btn-red" style={{ padding: '14px 36px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Book a Call <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}