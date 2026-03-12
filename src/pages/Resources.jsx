import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, BookOpen, FileText, Video, Download } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const categories = ['All', 'Guide', 'Playbook', 'Article', 'Report'];

const resources = [
  {
    type: 'Guide',
    title: 'The Lost Traffic Playbook: Identify & Convert Anonymous Visitors',
    excerpt: 'A step-by-step guide to deploying Ark Data\'s pixel, configuring identity resolution, and routing recovered visitors into your CRM and sequences.',
    readTime: '12 min read',
    tag: 'Lost Traffic',
    tagColor: '#0A2142',
    icon: BookOpen,
    featured: true,
  },
  {
    type: 'Playbook',
    title: 'High Intent Outbound: How to Build a Signal-Led SDR Motion',
    excerpt: 'Replace cold prospecting with intent-triggered outbound. Learn how to structure sequences, scoring, and routing around in-market signals.',
    readTime: '9 min read',
    tag: 'High Intent',
    tagColor: '#063524',
    icon: FileText,
    featured: true,
  },
  {
    type: 'Report',
    title: 'State of B2B Intent Data 2026',
    excerpt: 'Our annual report on how revenue teams are using intent signals, enrichment, and first-party data to drive pipeline in a cookieless world.',
    readTime: '18 min read',
    tag: 'Research',
    tagColor: '#3d0a0a',
    icon: Download,
    featured: true,
  },
  {
    type: 'Article',
    title: 'RevOps Guide: Building a Data Enrichment Workflow That Scales',
    excerpt: 'How to design a scalable enrichment architecture that keeps your CRM clean, your reps productive, and your reporting accurate.',
    readTime: '8 min read',
    tag: 'RevOps',
    tagColor: '#0A2142',
    icon: FileText,
  },
  {
    type: 'Guide',
    title: 'GDPR & CCPA Compliance for Intent Data: What Revenue Teams Need to Know',
    excerpt: 'A practical compliance guide covering what you can and can\'t do with intent data under major privacy frameworks - written for operators, not lawyers.',
    readTime: '10 min read',
    tag: 'Compliance',
    tagColor: '#3d0a0a',
    icon: BookOpen,
  },
  {
    type: 'Playbook',
    title: 'Demand Gen Playbook: Using Intent Data to Improve CPL and ROAS',
    excerpt: 'How demand gen teams use high-intent audiences to reduce wasted ad spend, improve CPL, and build better retargeting segments.',
    readTime: '7 min read',
    tag: 'Demand Gen',
    tagColor: '#063524',
    icon: FileText,
  },
  {
    type: 'Article',
    title: 'How to Enrich HubSpot Records Automatically with Ark Data',
    excerpt: 'A step-by-step walkthrough of the Ark Data + HubSpot integration: field mapping, sync frequency, deduplication, and sequence triggers.',
    readTime: '6 min read',
    tag: 'Integrations',
    tagColor: '#0A2142',
    icon: FileText,
  },
  {
    type: 'Guide',
    title: "Firmographic Data 101: How to Use Company Intelligence as a Buying Signal",
    excerpt: 'Understanding firmographic data, how it\'s collected, and how sales and marketing teams can use it to prioritize accounts and personalize outreach.',
    readTime: '8 min read',
    tag: 'Data',
    tagColor: '#0A2142',
    icon: BookOpen,
  },
  {
    type: 'Playbook',
    title: 'The Account-Based Marketing Playbook for High-Intent Data',
    excerpt: 'How ABM teams use Ark Data\'s intent feed to identify in-market accounts, build target account lists, and align sales and marketing on the same signals.',
    readTime: '11 min read',
    tag: 'ABM',
    tagColor: '#063524',
    icon: FileText,
  },
];

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? resources
    : resources.filter(r => r.type === activeCategory);

  const featured = resources.filter(r => r.featured);
  const showFeatured = activeCategory === 'All';

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <p style={{ color: S.red, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Resources</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>Playbooks, Guides & Intelligence.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7 }}>Tactical resources for revenue teams, RevOps leaders, and demand gen marketers who run on data.</p>
        </div>
      </section>

      <div className="sc" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
        {/* Featured */}
        {showFeatured && (
          <div style={{ marginBottom: '56px' }}>
            <p style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>Featured Resources</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {featured.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '32px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#1a5ca8'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#0A2142'}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #B1001A, #0A2142)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ background: r.tagColor + '44', border: `1px solid ${r.tagColor}88`, color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{r.type}</span>
                      <span style={{ background: r.tagColor + '33', border: `1px solid ${r.tagColor}55`, color: S.muted, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>{r.tag}</span>
                    </div>
                    <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px', lineHeight: 1.4, marginBottom: '12px' }}>{r.title}</h3>
                    <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65, marginBottom: '20px' }}>{r.excerpt}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#4a6a9a', fontSize: '12px' }}>{r.readTime}</span>
                      <span style={{ color: '#B1001A', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Read <ArrowRight size={13} /></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? '#B1001A' : '#06162A',
                border: `1px solid ${activeCategory === cat ? '#B1001A' : '#0A2142'}`,
                borderRadius: '100px', padding: '7px 16px', color: '#fff', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Resource List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {filtered.filter(r => showFeatured ? !r.featured : true).map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '24px', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#1a5ca8'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#0A2142'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={14} style={{ color: '#4a7aaa', flexShrink: 0 }} />
                  <span style={{ background: r.tagColor + '44', border: `1px solid ${r.tagColor}66`, color: S.muted, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{r.type}</span>
                </div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', lineHeight: 1.4 }}>{r.title}</h3>
                <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65, flex: 1 }}>{r.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #0A2142' }}>
                  <span style={{ color: '#4a6a9a', fontSize: '12px' }}>{r.readTime}</span>
                  <span style={{ color: '#B1001A', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Read <ArrowRight size={13} /></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Newsletter CTA */}
        <div style={{ marginTop: '64px', background: '#042016', border: '1px solid #063524', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>Stay Ahead</p>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '26px', letterSpacing: '-0.8px', marginBottom: '10px' }}>Intelligence in Your Inbox</h2>
          <p style={{ color: '#DFFFEF', fontSize: '14px', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>Intent data insights, enrichment playbooks, RevOps strategies - delivered weekly.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '440px', margin: '0 auto' }}>
            <input className="ark-input" placeholder="your@email.com" style={{ flex: 1, minWidth: '200px' }} />
            <button className="ark-btn-red" style={{ padding: '12px 24px', fontSize: '14px', whiteSpace: 'nowrap' }}>Subscribe</button>
          </div>
          <p style={{ color: '#4a8a6a', fontSize: '12px', marginTop: '12px' }}>No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </div>
  );
}