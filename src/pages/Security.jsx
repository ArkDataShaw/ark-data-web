import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const pillars = [
  { icon: '🔐', title: 'Data Encryption', color: 'blue', items: ['All data encrypted in transit (TLS 1.3)', 'Encryption at rest for all stored records', 'Key rotation on regular schedule', 'No plaintext PII storage at any layer'] },
  { icon: '🛡️', title: 'Access Controls', color: 'green', items: ['Role-based access control (RBAC)', 'Principle of least privilege enforced', 'Admin audit logging for all data access', 'SSO/SAML available on Enterprise'] },
  { icon: '📋', title: 'Privacy & Consent', color: 'blue', items: ['GDPR-designed data handling', 'CCPA-designed data handling', 'Opt-out mechanisms supported', 'Consent signal forwarding available'] },
  { icon: '🏢', title: 'Compliance Posture', color: 'green', items: ['Designed to support enterprise governance', 'DPA available for Growth+ plans', 'Vendor security review support', 'Data residency options on Enterprise'] },
];

const faqs = [
  { q: 'Is Ark Data GDPR compliant?', a: 'Ark Data is designed to support GDPR compliance. We do not claim official certification, but our data handling practices, consent mechanisms, and DPA availability are built to support your GDPR obligations.' },
  { q: 'Is a DPA available?', a: 'Yes. A Data Processing Agreement is available for all Growth and above plans. Contact our team to request a DPA for review.' },
  { q: 'How do you source and handle personal data?', a: 'We aggregate from consent-based networks, licensed data partnerships, and public business records. All sources are screened for compliance. Individual data is used for B2B identification purposes only.' },
  { q: 'Can I request data deletion?', a: 'Yes. Enterprise and Growth clients can submit data deletion requests. Records are purged from our systems within 30 days of a valid deletion request.' },
  { q: 'What data residency options are available?', a: 'US data residency is standard. EU data residency is available on Enterprise contracts. Contact us to discuss your jurisdiction requirements.' },
  { q: 'How do you support vendor security reviews?', a: 'We provide security questionnaire support, architecture documentation, and reference calls with our security team for enterprise procurement processes.' },
];

export default function Security() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      <section style={{ background: 'linear-gradient(135deg, #042016 0%, #000002 60%)', borderBottom: '1px solid #063524', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Security & Compliance</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>Privacy-First by Design.</h1>
          <p style={{ color: '#DFFFEF', fontSize: '17px', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            Enterprise-grade data security and compliance posture. Built for teams that can't afford data incidents.
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={{ background: '#020D1F', borderBottom: '1px solid #0A2142', padding: '32px 0' }}>
        <div className="sc">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {['Encryption in transit', 'Encryption at rest', 'Role-based access', 'DPA available', 'Data residency options', 'Vendor review ready', 'Audit logging', 'Opt-out supported'].map(badge => (
              <div key={badge} style={{ background: '#042016', border: '1px solid #063524', borderRadius: '6px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
                <span style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 600 }}>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Pillars */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px' }}>Security Architecture</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {pillars.map((p, i) => (
              <div key={i} style={{ background: p.color === 'blue' ? '#06162A' : '#042016', border: `1px solid ${p.color === 'blue' ? '#0A2142' : '#063524'}`, borderRadius: '10px', padding: '32px' }}>
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{p.icon}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '17px', marginBottom: '16px' }}>{p.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {p.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ color: p.color === 'blue' ? S.muted : '#DFFFEF', fontSize: '13px', lineHeight: 1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Handling */}
      <section className="sp" style={{ background: '#020D1F', borderTop: '1px solid #0A2142' }}>
        <div className="sc">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
            <div>
              <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Data Handling</p>
              <h2 style={{ fontSize: 'clamp(24px, 2.5vw, 34px)', fontWeight: 900, letterSpacing: '-0.8px', marginBottom: '20px', lineHeight: 1.2 }}>How We Handle Your Data</h2>
              {[
                { step: '1', title: 'Collection', desc: 'Data collected only from consent-based sources, licensed partnerships, and public business records.' },
                { step: '2', title: 'Processing', desc: 'Records enriched, validated, and normalized before any delivery. No raw PII stored beyond processing.' },
                { step: '3', title: 'Delivery', desc: 'Encrypted transit to your CRM, ESP, or API endpoint. No unauthorized third-party access.' },
                { step: '4', title: 'Retention', desc: 'Data retained per your contract terms. Deletion requests processed within 30 days.' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#B1001A', fontWeight: 900, fontSize: '20px', flexShrink: 0, minWidth: '24px' }}>{s.step}.</span>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{s.title}</p>
                    <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Subprocessors</p>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>Trusted Infrastructure Partners</h2>
              {[
                { name: 'Cloud Infrastructure', partner: 'AWS / GCP (region-configurable)' },
                { name: 'Identity & Enrichment', partner: 'Proprietary graph + licensed data' },
                { name: 'Data Encryption', partner: 'AES-256 + TLS 1.3 standard' },
                { name: 'Access Monitoring', partner: 'SOC-compatible audit logging' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '16px', background: '#06162A', border: '1px solid #0A2142', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: S.muted, fontSize: '13px', fontWeight: 600 }}>{s.name}</p>
                  <p style={{ color: '#DFFFEF', fontSize: '12px' }}>{s.partner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compliance FAQ */}
      <section className="sp" style={{ background: '#000002', borderTop: '1px solid #0A2142' }}>
        <div className="sc" style={{ maxWidth: '760px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontWeight: 900, fontSize: '28px', letterSpacing: '-0.8px' }}>Compliance FAQ</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setExpanded(expanded === i ? null : i)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>{f.q}</span>
                  <span style={{ color: '#B1001A', flexShrink: 0, transition: 'transform 0.2s', transform: expanded === i ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>
                {expanded === i && (
                  <div style={{ borderTop: '1px solid #0A2142', padding: '16px 24px 20px' }}>
                    <p style={{ color: S.muted, fontSize: '14px', lineHeight: 1.75 }}>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '10px', padding: '32px', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>Need a Security Review?</h3>
            <p style={{ color: '#DFFFEF', fontSize: '14px', marginBottom: '20px' }}>Our team supports vendor security questionnaires and architecture reviews.</p>
            <Link to={createPageUrl('Contact')}>
              <button className="ark-btn-green" style={{ padding: '12px 28px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Request a Security Review <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}