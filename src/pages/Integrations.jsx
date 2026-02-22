import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const categories = ['All', 'CRM', 'Email & Marketing', 'Automation', 'Ad Platforms', 'Notifications'];

const integrations = [
  { name: 'Salesforce', category: 'CRM', desc: 'Sync enriched leads and contacts in real-time. Auto-create records, map custom fields, and trigger sequences.', syncs: ['Leads', 'Contacts', 'Accounts'], auth: 'OAuth 2.0', popular: true },
  { name: 'HubSpot', category: 'CRM', desc: 'Push identified visitors and enriched records directly into HubSpot CRM with full field mapping support.', syncs: ['Contacts', 'Companies', 'Deals'], auth: 'OAuth 2.0', popular: true },
  { name: 'Pipedrive', category: 'CRM', desc: 'Automated lead creation and routing into Pipedrive. Map intent scores to deal stages.', syncs: ['Leads', 'Persons', 'Organizations'], auth: 'API Key' },
  { name: 'Klaviyo', category: 'Email & Marketing', desc: 'Sync identified profiles and trigger flows based on intent signals and behavioral data.', syncs: ['Profiles', 'Events', 'Lists'], auth: 'API Key', popular: true },
  { name: 'ActiveCampaign', category: 'Email & Marketing', desc: 'Add enriched contacts to lists, trigger automations, and tag by intent category.', syncs: ['Contacts', 'Lists', 'Tags'], auth: 'API Key' },
  { name: 'Mailchimp', category: 'Email & Marketing', desc: 'Subscriber sync and audience building from identified visitor data.', syncs: ['Contacts', 'Audiences'], auth: 'OAuth 2.0' },
  { name: 'Marketo', category: 'Email & Marketing', desc: 'Enterprise-grade Marketo integration. Push leads, update records, and trigger smart campaigns.', syncs: ['Leads', 'Programs', 'Smart Lists'], auth: 'API Key' },
  { name: 'Google Ads', category: 'Ad Platforms', desc: 'Upload high-intent audiences to Google Ads for targeted campaigns and bid adjustments.', syncs: ['Customer Match Lists', 'Audiences'], auth: 'OAuth 2.0' },
  { name: 'Meta Ads', category: 'Ad Platforms', desc: 'Push intent-rich custom audiences to Meta for retargeting and lookalike expansion.', syncs: ['Custom Audiences', 'Lookalikes'], auth: 'OAuth 2.0' },
  { name: 'LinkedIn Ads', category: 'Ad Platforms', desc: 'Sync matched audiences to LinkedIn for account-based advertising campaigns.', syncs: ['Matched Audiences'], auth: 'OAuth 2.0' },
  { name: 'Zapier', category: 'Automation', desc: 'Connect Ark Data to 5,000+ apps with no-code Zapier workflows. Trigger on any data event.', syncs: ['Webhooks', 'Events'], auth: 'Webhooks' },
  { name: 'Make (Integromat)', category: 'Automation', desc: 'Advanced multi-step automation workflows triggered by Ark Data events.', syncs: ['Webhooks', 'Data Sync'], auth: 'Webhooks' },
  { name: 'Slack', category: 'Notifications', desc: 'Real-time alerts in your Slack workspace when high-intent leads are identified.', syncs: ['Alerts', 'Notifications'], auth: 'OAuth 2.0' },
  { name: 'Webhooks / REST API', category: 'Automation', desc: 'Full REST API and signed webhook delivery for custom integrations and internal tooling.', syncs: ['All Events', 'Custom Fields'], auth: 'API Key + HMAC' },
];

export default function Integrations() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = selectedCategory === 'All'
    ? integrations
    : integrations.filter(i => i.category === selectedCategory);

  const popular = integrations.filter(i => i.popular);

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <p style={{ color: S.red, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Integrations</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>Your Entire Stack, Connected.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, marginBottom: '32px' }}>Native integrations with your CRM, ESP, ad platforms, and automation tools. Real-time, bi-directional data delivery.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '13px 28px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Book a Call <ArrowRight size={15} />
              </button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <button className="ark-btn-blue" style={{ padding: '13px 28px', fontSize: '15px' }}>Request Custom Integration</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular */}
      <section style={{ background: '#06162A', borderBottom: '1px solid #0A2142', padding: '48px 0' }}>
        <div className="sc">
          <p style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>Most Popular Integrations</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {popular.map(p => (
              <div key={p.name} style={{ background: '#020D1F', border: '1px solid #0A2142', borderRadius: '8px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={13} style={{ color: '#22c55e' }} />
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{p.name}</span>
                <span style={{ background: '#0A2142', color: S.muted, fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>{p.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sc" style={{ paddingTop: '56px', paddingBottom: '80px' }}>
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#B1001A' : '#06162A',
                border: `1px solid ${selectedCategory === cat ? '#B1001A' : '#0A2142'}`,
                borderRadius: '100px', padding: '7px 16px', color: '#fff', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Integration Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', marginBottom: '64px' }}>
          {filtered.map((integration, i) => (
            <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '28px', transition: 'border-color 0.2s', cursor: 'default' }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#1a5ca8'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#0A2142'}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>{integration.name}</h3>
                <span style={{ background: '#0A2142', color: S.muted, fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.04em' }}>{integration.category}</span>
              </div>
              <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65, marginBottom: '18px' }}>{integration.desc}</p>
              <div style={{ marginBottom: '14px' }}>
                <p style={{ color: '#4a6a9a', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>What Syncs</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {integration.syncs.map(sync => (
                    <span key={sync} style={{ background: '#020D1F', border: '1px solid #0A2142', borderRadius: '4px', padding: '3px 10px', color: S.muted, fontSize: '11px', fontWeight: 500 }}>{sync}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #0A2142' }}>
                <span style={{ color: '#4a6a9a', fontSize: '11px' }}>Auth: <span style={{ color: S.muted, fontWeight: 600 }}>{integration.auth}</span></span>
                {integration.popular && <span style={{ background: '#042016', border: '1px solid #063524', color: '#22c55e', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>Popular</span>}
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 2.5vw, 36px)', fontWeight: 900, letterSpacing: '-0.8px', marginBottom: '12px' }}>Up and Running in Minutes.</h2>
            <p style={{ color: S.muted, fontSize: '15px' }}>Most integrations activate in under 5 minutes with no engineering required.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { num: '01', title: 'Connect', desc: 'Authenticate via OAuth or API key. Takes 30 seconds.' },
              { num: '02', title: 'Map Fields', desc: 'Configure which Ark Data fields map to your CRM schema.' },
              { num: '03', title: 'Set Rules', desc: 'Choose real-time or batch sync, routing rules, and filters.' },
              { num: '04', title: 'Go Live', desc: 'Activate and watch enriched leads flow into your stack.' },
            ].map((step, i) => (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '28px' }}>
                <div style={{ color: '#1a4a8a', fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '14px' }}>{step.num}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Strip */}
        <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '36px 40px', marginBottom: '48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Enterprise Security</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['OAuth 2.0 & API key encryption', 'All data transmitted over TLS 1.2+', 'Webhook payloads signed with HMAC', 'SOC 2 Type II (in progress)'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
                    <span style={{ color: S.muted, fontSize: '13px' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Developer Support</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['REST API with full documentation', 'Webhook event specifications', 'Custom field mapping support', 'Dedicated integration onboarding'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
                    <span style={{ color: S.muted, fontSize: '13px' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 50%, #042016 100%)', border: '1px solid #0A2142', borderRadius: '16px', padding: '56px', textAlign: 'center' }}>
          <p style={{ color: S.red, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>Don't See Your Tool?</p>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(22px, 2.5vw, 32px)', letterSpacing: '-0.8px', marginBottom: '12px' }}>We'll Build It With You.</h2>
          <p style={{ color: S.muted, fontSize: '15px', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px' }}>Use our REST API and webhooks to build custom integrations, or talk to our team about a native connector.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '13px 28px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Book a Call <ArrowRight size={14} />
              </button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <button className="ark-btn-blue" style={{ padding: '13px 28px', fontSize: '14px' }}>Contact Our Team</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}