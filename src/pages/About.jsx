import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

export default function About() {
  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '100px 0 80px' }}>
        <div className="sc" style={{ maxWidth: '800px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>About Ark Data</p>
          <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '24px' }}>
            Built for Operators.<br />Obsessed with Data Quality.
          </h1>
          <p style={{ color: S.muted, fontSize: '18px', lineHeight: 1.75, maxWidth: '620px' }}>
            Ark Data was built by revenue operators who were tired of data that was outdated, incomplete, and unactionable. We built the platform we always wanted — and now we're giving it to teams like yours.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Our Mission</p>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '20px', lineHeight: 1.2 }}>Make Every Lead Visible. Make Every Action Informed.</h2>
              <p style={{ color: S.muted, fontSize: '15px', lineHeight: 1.75, marginBottom: '20px' }}>
                We believe revenue teams deserve data that actually works — enriched in real time, scored by intent, and delivered directly to their stack. No more guesswork. No more manual research. No more wasted pipeline.
              </p>
              <p style={{ color: S.muted, fontSize: '15px', lineHeight: 1.75 }}>
                Ark Data exists to close the gap between anonymous traffic and qualified opportunity — at scale, with compliance, and without friction.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { n: '10M+', l: 'Records enriched/mo' },
                { n: '95%', l: 'Match accuracy' },
                { n: '500+', l: 'Revenue teams served' },
                { n: '<1wk', l: 'Average go-live' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
                  <p style={{ color: '#B1001A', fontWeight: 900, fontSize: '32px', letterSpacing: '-1px', marginBottom: '6px' }}>{s.n}</p>
                  <p style={{ color: S.muted, fontSize: '12px' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="sp" style={{ background: '#020D1F', borderTop: '1px solid #0A2142' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>What We Stand For</p>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px' }}>Our Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🎯', title: 'Accuracy', desc: 'Every record is validated, deduplicated, and normalized. We never sacrifice quality for volume.' },
              { icon: '🔒', title: 'Compliance', desc: 'Privacy is not an afterthought. We are designed to support GDPR, CCPA, and enterprise governance requirements.' },
              { icon: '⚡', title: 'Speed', desc: 'From pixel install to live enrichment in under an hour. From contract to full deployment in under a week.' },
              { icon: '🤝', title: 'Partnership', desc: 'We don\'t just deliver data. We embed with your team and optimize for outcomes — not just deliverables.' },
            ].map((v, i) => (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '32px' }}>
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{v.icon}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>{v.title}</h3>
                <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#000002', borderTop: '1px solid #0A2142', padding: '80px 0' }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px' }}>Ready to Work Together?</h2>
          <p style={{ color: S.muted, fontSize: '16px', marginBottom: '32px' }}>Let's find out if Ark Data is the right fit for your team.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '14px 32px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Book a Call <ArrowRight size={16} />
              </button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <button className="ark-btn-blue" style={{ padding: '14px 32px', fontSize: '15px' }}>Contact Us</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}