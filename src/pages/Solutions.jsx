import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const bySize = [
  { name: 'Startup', desc: 'Quick wins on lean budgets. Maximize early pipeline with minimal ops overhead.', useCase: 'SDR outbound with intent scoring', inputs: 'Website pixel + CRM', outputs: 'Enriched leads + scores', outcome: 'Fill pipeline 3× faster', features: ['Lost Traffic pixel (up to 5k sessions)', 'Firmographic enrichment', 'Intent scoring', 'CSV or HubSpot delivery'] },
  { name: 'SMB', desc: 'Scale pipeline generation and improve conversion without growing your team.', useCase: 'Demand gen + retargeting', inputs: 'Website + email list', outputs: 'Enriched audiences + intent data', outcome: 'Lower CPL, better ROAS', features: ['Lost Traffic + High Intent', 'CRM + ESP integrations', 'Audience builder', 'Custom segments (basic)'] },
  { name: 'Mid-Market', desc: 'Segment more precisely, score at scale, and activate across your full tech stack.', useCase: 'ABM + full-funnel scoring', inputs: 'CRM + website + ad platforms', outputs: 'Scored accounts + contacts', outcome: '+31% qualified meetings avg', features: ['High-volume enrichment', 'Multi-CRM routing', 'API access', 'Priority data refresh'] },
  { name: 'Enterprise', desc: 'Governance, SLAs, data residency, and analyst support for complex organizations.', useCase: 'RevOps governance + custom data', inputs: 'Enterprise data warehouse', outputs: 'Compliant, normalized data', outcome: 'Unified data layer across teams', features: ['Custom data contracts', 'SLA guarantee', 'DPA + compliance support', 'Dedicated analyst'] },
];

const byRole = [
  { role: 'Growth Marketing', icon: '📈', desc: 'Improve retargeting audiences, reduce CPL, and build higher-converting segments using real intent signals.', tactics: ['Build lookalike audiences from high-intent visitors', 'Reduce ad waste with firmographic filters', 'Trigger nurture sequences from intent signals'] },
  { role: 'Demand Gen', icon: '🎯', desc: 'Fill pipeline with buyers who are in-market now — not just anyone who ever visited your site.', tactics: ['Identify in-market accounts by category', 'Enrich form fills in real time', 'Score MQL → SQL handoffs accurately'] },
  { role: 'RevOps', icon: '⚙️', desc: 'Clean routing, consistent enrichment, and audit trails for every record in your CRM.', tactics: ['Automate lead routing rules', 'Normalize and deduplicate CRM records', 'Build unified data pipeline from traffic to close'] },
  { role: 'SDR / BDR', icon: '📞', desc: 'Prioritize outreach by intent score so reps spend time on accounts most likely to respond.', tactics: ['Get daily digest of high-intent accounts', 'Real-time alerts on target account visits', 'Trigger sequences from site activity signals'] },
  { role: 'Sales Ops', icon: '🗂️', desc: 'Improve forecast accuracy and territory planning with enriched, consistently scored data.', tactics: ['Enrich and score all inbound leads', 'Standardize data entry with auto-fill', 'Build territory segmentation with firmographics'] },
  { role: 'Agency / Partner', icon: '🏢', desc: 'Prove traffic quality and ROI to clients, and offer data enrichment as a differentiated service.', tactics: ['White-label enrichment for client websites', 'Deliver intent data as a service', 'Show clients exactly which visitors converted'] },
];

const byIndustry = [
  { industry: 'B2B SaaS', icon: '💻', problem: 'Long sales cycles, low form conversion', solution: 'High Intent + Lost Traffic to identify evaluators early' },
  { industry: 'Healthcare Services', icon: '🏥', problem: 'HIPAA sensitivity + low visibility', solution: 'Compliant firmographic enrichment for facility targeting' },
  { industry: 'Financial Services', icon: '💼', problem: 'Regulatory pressure + broker competition', solution: 'Intent signals for in-market investors and procurement buyers' },
  { industry: 'E-commerce', icon: '🛍️', problem: 'Cart abandonment + anonymous sessions', solution: 'Lost Traffic recovery with purchase intent signals' },
  { industry: 'Home Services', icon: '🏠', problem: 'Local lead quality and CPL', solution: 'Geo-targeted intent data + local business enrichment' },
  { industry: 'Logistics & Manufacturing', icon: '🏭', problem: 'Niche buyers, long procurement cycles', solution: 'Account-level intent + buyer role resolution for niche verticals' },
];

export default function Solutions() {
  const [activeTab, setActiveTab] = useState('size');
  const tabs = [{ id: 'size', label: 'By Company Size' }, { id: 'role', label: 'By Role' }, { id: 'industry', label: 'By Industry' }];

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Solutions</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>Data Solutions for Every Revenue Team.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>From startups to enterprise. SDRs to RevOps. SaaS to e-commerce. Ark Data is built for your specific use case.</p>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ background: '#020D1F', borderBottom: '1px solid #0A2142', padding: '0' }}>
        <div className="sc" style={{ display: 'flex', gap: '0' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '18px 28px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t.id ? '#B1001A' : 'transparent'}`, color: activeTab === t.id ? '#fff' : S.muted, fontWeight: activeTab === t.id ? 700 : 500, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sc" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        {activeTab === 'size' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {bySize.map((s, i) => (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '32px' }}>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>{s.name}</h3>
                <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65, marginBottom: '20px' }}>{s.desc}</p>
                <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Use Case</p>
                  <p style={{ color: S.mutedGreen, fontSize: '13px', marginBottom: '10px' }}>{s.useCase}</p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div><p style={{ color: '#DFFFEF', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '2px' }}>IN</p><p style={{ color: S.muted, fontSize: '12px' }}>{s.inputs}</p></div>
                    <div><p style={{ color: '#DFFFEF', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '2px' }}>OUT</p><p style={{ color: S.muted, fontSize: '12px' }}>{s.outputs}</p></div>
                  </div>
                  <p style={{ color: '#22c55e', fontSize: '12px', fontWeight: 700, marginTop: '10px' }}>→ {s.outcome}</p>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {s.features.map(f => <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: S.muted, fontSize: '13px' }}><CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />{f}</li>)}
                </ul>
                <Link to={createPageUrl('BookADemo')}>
                  <button className="ark-btn-red" style={{ width: '100%', padding: '11px', fontSize: '13px' }}>Get Started</button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'role' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {byRole.map((r, i) => (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '28px' }}>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{r.icon}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>{r.role}</h3>
                <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65, marginBottom: '20px' }}>{r.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {r.tactics.map(t => <li key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: S.muted, fontSize: '13px' }}><ArrowRight size={13} style={{ color: '#1a5ca8', flexShrink: 0, marginTop: '1px' }} />{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'industry' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {byIndustry.map((ind, i) => (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '28px' }}>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{ind.icon}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>{ind.industry}</h3>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: '#B1001A', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Challenge</p>
                  <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.6 }}>{ind.problem}</p>
                </div>
                <div>
                  <p style={{ color: '#DFFFEF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Ark Data Solution</p>
                  <p style={{ color: S.mutedGreen, fontSize: '13px', lineHeight: 1.6 }}>{ind.solution}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <Link to={createPageUrl('BookADemo')}>
            <button className="ark-btn-red" style={{ padding: '14px 36px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Find Your Solution <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}