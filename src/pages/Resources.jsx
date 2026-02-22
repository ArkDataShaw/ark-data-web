import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const categories = ['All', 'Data Enrichment', 'Intent Data', 'RevOps', 'Outbound', 'Compliance'];

const posts = [
  { title: 'The Complete Guide to Lost Traffic Recovery in 2026', category: 'Data Enrichment', excerpt: 'Up to 97% of your site visitors never fill a form. Here\'s how to turn them into identifiable, enriched leads — and why most teams are leaving pipeline on the table.', read: '8 min', date: 'Feb 2026', featured: true },
  { title: 'What Is Intent Data and Why Does It Actually Matter?', category: 'Intent Data', excerpt: 'Not all data is created equal. Intent data tells you who is in-market right now. Here\'s the definitive breakdown of signals, scoring, and activation.', read: '6 min', date: 'Feb 2026' },
  { title: 'RevOps Playbook: Enriching Your Entire CRM Without Breaking It', category: 'RevOps', excerpt: 'Field mapping, deduplication, and normalization at scale. A step-by-step guide for RevOps teams modernizing their CRM data layer.', read: '10 min', date: 'Jan 2026' },
  { title: 'The SDR Prioritization Framework Using Intent Signals', category: 'Outbound', excerpt: 'Stop prospecting blind. How SDR teams are using intent scores to triple their reply rates and cut their research time in half.', read: '7 min', date: 'Jan 2026' },
  { title: 'GDPR, CCPA, and Intent Data: What Revenue Teams Need to Know', category: 'Compliance', excerpt: 'Intent data doesn\'t have to be a compliance headache. Here\'s how to use enrichment and intent signals in a way that supports your legal obligations.', read: '9 min', date: 'Jan 2026' },
  { title: 'How to Build an ABM Program Using High Intent Data', category: 'Intent Data', excerpt: 'Account-based marketing powered by real buying signals. From ICP definition to segment creation to activation across ads and outbound.', read: '11 min', date: 'Dec 2025' },
  { title: 'Data Hygiene 101: Why Your CRM is Slowly Rotting', category: 'Data Enrichment', excerpt: 'Stale contacts, duplicate records, missing firmographics. Here\'s how to audit, clean, and maintain a CRM that actually helps your team close deals.', read: '6 min', date: 'Dec 2025' },
  { title: '5 Ways Demand Gen Teams Are Using Intent Data to Lower CPL', category: 'RevOps', excerpt: 'Intent signals aren\'t just for SDRs. Here are five concrete tactics demand gen teams are using to reduce wasted ad spend and improve pipeline quality.', read: '5 min', date: 'Nov 2025' },
  { title: 'The Anatomy of a High-Quality B2B Data Record', category: 'Data Enrichment', excerpt: 'Domain, industry, headcount, tech stack, buyer role, and intent signals. What does a truly complete enriched record look like — and how do you get there?', read: '7 min', date: 'Nov 2025' },
  { title: 'Building a Vendor Review Packet for B2B Data Tools', category: 'Compliance', excerpt: 'Security questionnaires, DPA reviews, and architecture calls. How to evaluate B2B data vendors as an enterprise procurement team.', read: '8 min', date: 'Oct 2025' },
];

const catColor = { 'Data Enrichment': { bg: '#06162A', border: '#0A2142', text: S.muted }, 'Intent Data': { bg: '#042016', border: '#063524', text: '#DFFFEF' }, 'RevOps': { bg: '#0A2142', border: '#1a4a8a', text: S.muted }, 'Outbound': { bg: '#06162A', border: '#0A2142', text: S.muted }, 'Compliance': { bg: '#042016', border: '#063524', text: '#DFFFEF' } };

export default function Resources() {
  const [active, setActive] = useState('All');
  const [email, setEmail] = useState('');
  const filtered = active === 'All' ? posts : posts.filter(p => p.category === active);
  const featured = filtered.find(p => p.featured) || filtered[0];
  const rest = filtered.filter(p => p !== featured);

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Blog & Resources</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>Intelligence Hub</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7 }}>Playbooks, guides, and operator insights on data enrichment, intent data, and RevOps.</p>
        </div>
      </section>

      <div className="sc" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              style={{ padding: '7px 16px', background: active === cat ? '#B1001A' : '#06162A', border: `1px solid ${active === cat ? '#B1001A' : '#0A2142'}`, borderRadius: '100px', color: '#fff', fontSize: '13px', fontWeight: active === cat ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '14px', padding: '40px', marginBottom: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <span style={{ background: '#B1001A22', border: '1px solid #B1001A44', borderRadius: '100px', padding: '3px 10px', color: '#B1001A', fontSize: '11px', fontWeight: 700 }}>Featured</span>
                <span style={{ background: (catColor[featured.category]?.bg || '#06162A'), border: `1px solid ${catColor[featured.category]?.border || '#0A2142'}`, borderRadius: '100px', padding: '3px 10px', color: catColor[featured.category]?.text || S.muted, fontSize: '11px', fontWeight: 600 }}>{featured.category}</span>
              </div>
              <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.5px', lineHeight: 1.3, marginBottom: '14px' }}>{featured.title}</h2>
              <p style={{ color: S.muted, fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>{featured.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#4a7aaa', fontSize: '12px' }}>{featured.date}</span>
                <span style={{ color: S.muted, fontSize: '12px' }}>{featured.read} read</span>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #0A2142, #042016)', borderRadius: '10px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#4a7aaa', fontSize: '48px' }}>📊</span>
            </div>
          </div>
        )}

        {/* Post grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          {rest.map((post, i) => (
            <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ background: (catColor[post.category]?.bg || '#06162A'), border: `1px solid ${catColor[post.category]?.border || '#0A2142'}`, borderRadius: '100px', padding: '3px 10px', color: catColor[post.category]?.text || S.muted, fontSize: '11px', fontWeight: 600, width: 'fit-content', marginBottom: '14px' }}>{post.category}</span>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '16px', lineHeight: 1.4, marginBottom: '10px', flex: 1 }}>{post.title}</h3>
              <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65, marginBottom: '16px' }}>{post.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#4a7aaa', fontSize: '11px' }}>{post.date}</span>
                <span style={{ color: S.muted, fontSize: '11px' }}>{post.read} read</span>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '8px' }}>Intelligence in Your Inbox</h3>
          <p style={{ color: S.muted, fontSize: '14px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>Intent data insights, enrichment playbooks, and RevOps strategy — delivered weekly.</p>
          <div style={{ display: 'flex', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
            <input className="ark-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1 }} />
            <button className="ark-btn-red" style={{ padding: '12px 20px', fontSize: '14px', whiteSpace: 'nowrap' }}>Subscribe</button>
          </div>
          <p style={{ color: S.muted, fontSize: '11px', marginTop: '12px' }}>No spam. Unsubscribe anytime. Compliance-first.</p>
        </div>
      </div>
    </div>
  );
}