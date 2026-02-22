import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, Shield, Lock, Eye, Server, FileText, ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const pillars = [
  {
    icon: Lock,
    title: 'Data Encryption',
    desc: 'All data encrypted in transit (TLS 1.2+) and at rest (AES-256). No exceptions.',
    points: ['TLS 1.2+ for all data in transit', 'AES-256 encryption at rest', 'Encrypted database backups', 'Key management via AWS KMS'],
    color: '#0A2142',
  },
  {
    icon: Shield,
    title: 'Access Controls',
    desc: 'Role-based access controls with least-privilege principles. MFA enforced for all internal systems.',
    points: ['Role-based access control (RBAC)', 'Multi-factor authentication (MFA)', 'SSO / SAML 2.0 support', 'Audit logs for all access events'],
    color: '#063524',
  },
  {
    icon: Eye,
    title: 'Privacy & Compliance',
    desc: 'Built to support GDPR, CCPA, and major enterprise compliance frameworks.',
    points: ['GDPR Article 28 compliant', 'CCPA / CPRA compliant', 'DPA available on Growth+ plans', 'Data subject request support'],
    color: '#0A2142',
  },
  {
    icon: Server,
    title: 'Infrastructure Security',
    desc: 'Hosted on AWS with multi-region redundancy. Continuous monitoring and automated threat detection.',
    points: ['AWS infrastructure (SOC 2 certified)', 'Multi-region redundancy', 'DDoS protection via Cloudflare', 'Continuous vulnerability scanning'],
    color: '#063524',
  },
  {
    icon: FileText,
    title: 'Vendor & Data Governance',
    desc: 'Strict vendor vetting and data sourcing standards. All data sources reviewed for compliance before ingestion.',
    points: ['Vendor security review process', 'Data sourcing compliance audits', 'Third-party penetration testing', 'Incident response plan (tested annually)'],
    color: '#0A2142',
  },
  {
    icon: Shield,
    title: 'Compliance Certifications',
    desc: 'SOC 2 Type II audit in progress. Designed to meet enterprise security requirements from day one.',
    points: ['SOC 2 Type II (in progress)', 'ISO 27001 roadmap', 'GDPR DPA available', 'Enterprise MSA / security review support'],
    color: '#063524',
  },
];

const faqs = [
  { q: 'Do you offer a Data Processing Agreement (DPA)?', a: 'Yes. A DPA is available on Growth and above plans. For Enterprise, we support custom DPA negotiation as part of the MSA process.' },
  { q: 'Where is data stored?', a: 'Data is stored on AWS infrastructure in the US (us-east-1) by default. Enterprise customers can request data residency in the EU (eu-west-1). All data is encrypted at rest using AES-256.' },
  { q: 'How do you handle data subject access requests (DSARs)?', a: 'We support DSARs in compliance with GDPR and CCPA. Customers can submit requests via their account or directly to our privacy team. We process requests within 30 days.' },
  { q: 'Can we conduct a security review?', a: 'Yes. Enterprise customers can request access to our security documentation, penetration test reports, and complete a vendor security questionnaire. Contact our team to start the process.' },
  { q: 'What is your data retention policy?', a: 'Default retention is 12 months. Growth and Scale customers can configure retention up to 24 months. Enterprise customers have custom retention options available.' },
  { q: 'How are security incidents handled?', a: 'We have a documented incident response plan. In the event of a breach affecting customer data, we commit to notification within 72 hours in line with GDPR requirements.' },
];

export default function Security() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <p style={{ color: S.red, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Security & Compliance</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>Compliance-First.<br />Built for Enterprise Trust.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, marginBottom: '32px' }}>Ark Data is designed with privacy and security at its core — not bolted on. GDPR, CCPA, and enterprise-grade controls from day one.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('Contact')}>
              <button className="ark-btn-blue" style={{ padding: '13px 28px', fontSize: '14px' }}>Request Security Docs</button>
            </Link>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '13px 28px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Book a Call <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={{ background: '#06162A', borderBottom: '1px solid #0A2142', padding: '28px 0' }}>
        <div className="sc">
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {['GDPR Compliant', 'CCPA / CPRA', 'TLS 1.2+ Encryption', 'AES-256 at Rest', 'SOC 2 (In Progress)', 'DPA Available'].map(badge => (
              <div key={badge} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                <span style={{ color: S.muted, fontSize: '13px', fontWeight: 600 }}>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Pillars */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>Security From Every Angle.</h2>
            <p style={{ color: S.muted, fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>Six layers of security and compliance controls protecting your data and your customers' data.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} style={{ background: i % 2 === 0 ? '#06162A' : '#042016', border: `1px solid ${i % 2 === 0 ? '#0A2142' : '#063524'}`, borderRadius: '12px', padding: '32px' }}>
                  <div style={{ width: '44px', height: '44px', background: p.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                    <Icon size={20} style={{ color: '#fff' }} />
                  </div>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '17px', marginBottom: '10px' }}>{p.title}</h3>
                  <p style={{ color: i % 2 === 0 ? S.muted : S.mutedGreen, fontSize: '13px', lineHeight: 1.65, marginBottom: '18px' }}>{p.desc}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {p.points.map(pt => (
                      <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ color: i % 2 === 0 ? S.muted : S.mutedGreen, fontSize: '13px' }}>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section style={{ background: '#06162A', borderTop: '1px solid #0A2142', borderBottom: '1px solid #0A2142', padding: '60px 0' }}>
        <div className="sc" style={{ maxWidth: '820px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 2.5vw, 34px)', fontWeight: 900, letterSpacing: '-0.8px', marginBottom: '12px' }}>How Your Data Flows.</h2>
            <p style={{ color: S.muted, fontSize: '15px' }}>Every step of data collection, processing, and delivery is logged, encrypted, and auditable.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { step: '01', title: 'Collection', desc: 'Pixel fires over HTTPS. Session data transmitted encrypted. No PII stored client-side.' },
              { step: '02', title: 'Processing', desc: 'Data processed in isolated environment. Identity resolution against encrypted reference data.' },
              { step: '03', title: 'Storage', desc: 'Records stored encrypted at rest (AES-256). Access controlled by RBAC. Audit log on every read/write.' },
              { step: '04', title: 'Delivery', desc: 'Outbound to CRM or API over TLS 1.2+. Webhook payloads signed with HMAC. Customer controls delivery scope.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '24px 0', borderBottom: i < 3 ? '1px solid #0A2142' : 'none' }}>
                <span style={{ color: '#1a4a8a', fontWeight: 900, fontSize: '28px', letterSpacing: '-1px', flexShrink: 0, width: '48px' }}>{item.step}</span>
                <div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{item.title}</h3>
                  <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 2.5vw, 34px)', fontWeight: 900, letterSpacing: '-0.8px', marginBottom: '32px', textAlign: 'center' }}>Security FAQs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '48px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '18px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '16px', textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{faq.q}</span>
                  <span style={{ color: S.red, flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>
                {openFaq === i && (
                  <div style={{ borderTop: '1px solid #0A2142', padding: '14px 24px 18px' }}>
                    <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.7 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '10px' }}>Need a Security Review?</h3>
            <p style={{ color: S.mutedGreen, fontSize: '14px', marginBottom: '24px' }}>We support enterprise vendor security reviews, penetration test reports, and custom DPA negotiations.</p>
            <Link to={createPageUrl('Contact')}>
              <button className="ark-btn-red" style={{ padding: '13px 28px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Contact Our Team <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}