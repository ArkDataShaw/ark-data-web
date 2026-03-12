import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import EnrichedVisitsCalculator from '../components/pricing/EnrichedVisitsCalculator';
import { Check, X as XIcon } from 'lucide-react';

function TypewriterText({ text, delay = 0, speed = 60 }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStarted(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!started || displayed.length >= text.length) return;
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    return () => clearTimeout(t);
  }, [started, displayed, text, speed]);
  return <>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0 }}>|</span></>;
}

const S = { muted: '#D9ECFF' };

const FEATURE_ROWS = [
  { label: 'Person-level identification', free: '200/mo', paid: 'Unlimited (usage-based)' },
  { label: 'Company-level identification', free: '200/mo', paid: 'Unlimited' },
  { label: 'Email addresses', free: false, paid: true },
  { label: 'LinkedIn profile URLs', free: false, paid: true },
  { label: 'Dashboard & visitor feed', free: 'View only', paid: 'Full access' },
  { label: 'Slack integration', free: false, paid: true },
  { label: 'HubSpot integration', free: false, paid: true },
  { label: 'Salesforce integration', free: false, paid: true },
  { label: 'Clay, Zapier, webhook', free: false, paid: true },
  { label: 'CSV export', free: false, paid: true },
  { label: 'Hot Pages & Hot Leads', free: false, paid: true },
  { label: 'Reporting & analytics', free: false, paid: true },
  { label: 'Multiple domains', free: false, paid: true },
];

const COMPETITOR_TABLE = [
  { ev: '150',    arkdata: 'FREE',    rb2b: 'FREE',        opensend: '$500',       warmly: '$833+*' },
  { ev: '300',    arkdata: '$37',     rb2b: '$79',         opensend: '$500',       warmly: '$833+*' },
  { ev: '500',    arkdata: '$60',     rb2b: '$149',        opensend: '$500',       warmly: '$833+*' },
  { ev: '1,000',  arkdata: '$117',    rb2b: '$249',        opensend: '$500',       warmly: '$833+*' },
  { ev: '1,500',  arkdata: '$169',    rb2b: '$349',        opensend: '$500',       warmly: '$833+*' },
  { ev: '2,000',  arkdata: '$218',    rb2b: '$349',        opensend: '$500',       warmly: '$833+*' },
  { ev: '2,500',  arkdata: '$264',    rb2b: '$349',        opensend: '$1,000',     warmly: '$833+*' },
  { ev: '3,000',  arkdata: '$306',    rb2b: '$499',        opensend: '$1,000',     warmly: '$833+*' },
  { ev: '5,000',  arkdata: '$450',    rb2b: '$499',        opensend: '$2,000',     warmly: '$833+*' },
  { ev: '7,500',  arkdata: '$582',    rb2b: '$649',        opensend: 'Enterprise', warmly: 'Enterprise' },
  { ev: '10,000', arkdata: '$675',    rb2b: '$799',        opensend: 'Enterprise', warmly: 'Enterprise' },
  { ev: '12,500', arkdata: '$741',    rb2b: '$849',        opensend: 'Enterprise', warmly: 'Enterprise' },
];

function CellVal({ val }) {
  if (val === true) return <Check size={16} color="#22c55e" />;
  if (val === false) return <XIcon size={16} color="#4a6a9a" />;
  return <span style={{ color: '#D9ECFF', fontSize: '13px' }}>{val}</span>;
}

export default function Pricing() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === '#pricing-calculator') {
      setTimeout(() => {
        const el = document.getElementById('pricing-calculator');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [hash]);

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 65%)', borderBottom: '1px solid #0A2142', padding: '80px 0 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '10%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(177,0,26,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '5%', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,92,168,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="sc" style={{ maxWidth: '720px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '100px', padding: '5px 14px', marginBottom: '20px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ color: '#86efac', fontSize: '12px', fontWeight: 600 }}>Usage-Based Pricing</span>
          </div>
          <h1 style={{ fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.15, textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: 'clamp(36px, 5vw, 62px)', color: '#D9ECFF' }}>
              <TypewriterText text="Pricing That" delay={0} speed={65} />
            </span>
            <span style={{ display: 'block', fontSize: 'clamp(48px, 7vw, 88px)', color: '#C8001E', textShadow: '0 0 40px rgba(177,0,26,0.5)', letterSpacing: '-3px' }}>
              <TypewriterText text="Scales" delay={900} speed={80} />
            </span>
            <span style={{ display: 'block', fontSize: 'clamp(36px, 5vw, 62px)', color: '#D9ECFF' }}>
              <TypewriterText text="With You." delay={1600} speed={65} />
            </span>
          </h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '560px', margin: '0 auto 32px' }}>
            No plans to choose. No seats. No hidden fees. Pay only for what you identify - and your rate drops automatically as your volume grows.
          </p>

          <div style={{ background: 'rgba(10,33,66,0.5)', border: '1px solid rgba(26,92,168,0.3)', borderRadius: '12px', padding: '20px 24px', textAlign: 'left' }}>
            <p style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>How it works</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Enter your monthly website visitors.',
                'Choose an enrichment rate (default 55%).',
                'We calculate Enriched Visits = floor(visitors × rate).',
                'Your cost follows a smooth curve that drops automatically as you grow. Free through 200 enriched visits, never more than $900/mo.',
              ].map((text, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#22c55e', fontWeight: 900, fontSize: '13px', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: S.muted, fontSize: '13px', lineHeight: 1.55 }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section style={{ padding: '56px 0 80px', background: '#000002' }}>
        <div className="sc" style={{ maxWidth: '900px' }}>
          <EnrichedVisitsCalculator />
        </div>
      </section>

      {/* Free Tier Card */}
      <section style={{ padding: '0 0 80px', background: '#000002' }}>
        <div className="sc" style={{ maxWidth: '900px' }}>
          <div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '100px', padding: '5px 14px', marginBottom: '16px' }}>
              <span style={{ color: '#86efac', fontSize: '12px', fontWeight: 600 }}>Free Forever</span>
            </div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: '8px', letterSpacing: '-1px' }}>Start Free</h2>
            <p style={{ color: '#86efac', fontSize: '16px', marginBottom: '28px' }}>See your visitors. Upgrade when you're ready to act.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto 28px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              {[
                '250 person-level visitors identified per month',
                '500 company-level visitors identified per month',
                'View names and companies in your dashboard',
                'No email addresses, integrations, or exports on free plan',
                'No credit card required',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Check size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: '#D9ECFF', fontSize: '14px', lineHeight: 1.55 }}>{item}</span>
                </li>
              ))}
            </ul>
            <a href="https://app.arkdata.io" target="_blank" rel="noopener noreferrer">
              <button style={{ background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)', border: '1px solid rgba(34,197,94,0.45)', borderRadius: '10px', padding: '16px 40px', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 24px rgba(34,197,94,0.2)' }}>
                Create Free Account
              </button>
            </a>
            <p style={{ color: '#4a6a9a', fontSize: '12px', marginTop: '12px' }}>Upgrade anytime to unlock email addresses, CRM integrations, and unlimited identifications.</p>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section style={{ padding: '0 0 80px', background: '#000002' }}>
        <div className="sc" style={{ maxWidth: '900px' }}>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(22px, 3vw, 32px)', letterSpacing: '-0.5px', marginBottom: '8px', textAlign: 'center' }}>Free vs Paid</h2>
          <p style={{ color: '#4a6a9a', fontSize: '15px', textAlign: 'center', marginBottom: '32px' }}>Everything in free, plus everything you need to actually act on your data.</p>
          <div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(26,92,168,0.4)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr style={{ background: 'rgba(10,33,66,0.5)' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', color: '#7eb8ff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Feature</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', color: '#7eb8ff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Free</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', color: '#86efac', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(10,33,66,0.7)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '13px 20px', color: '#D9ECFF', fontSize: '13px' }}>{row.label}</td>
                      <td style={{ padding: '13px 20px', textAlign: 'center' }}><CellVal val={row.free} /></td>
                      <td style={{ padding: '13px 20px', textAlign: 'center' }}><CellVal val={row.paid} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section style={{ padding: '0 0 80px', background: '#000002' }}>
        <div className="sc" style={{ maxWidth: '900px' }}>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(22px, 3vw, 32px)', letterSpacing: '-0.5px', marginBottom: '8px', textAlign: 'center' }}>How ArkData Compares</h2>
          <p style={{ color: '#4a6a9a', fontSize: '15px', textAlign: 'center', marginBottom: '32px' }}>Same volume. Same data type. Different price.</p>
          <div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(26,92,168,0.4)', borderRadius: '14px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr style={{ background: 'rgba(10,33,66,0.5)' }}>
                    {['Monthly Enrichments', 'ArkData', 'RB2B', 'OpenSend', 'Warmly'].map((h, i) => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: i === 0 ? 'left' : 'center', color: i === 1 ? '#86efac' : '#7eb8ff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPETITOR_TABLE.map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(10,33,66,0.7)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '13px 16px', color: '#D9ECFF', fontSize: '13px', fontWeight: 600 }}>{row.ev}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'center', color: '#22c55e', fontWeight: 800, fontSize: '14px', fontFamily: 'monospace' }}>{row.arkdata}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'center', color: row.rb2b === 'Enterprise' ? '#4a6a9a' : '#D9ECFF', fontSize: '13px', fontFamily: 'monospace' }}>{row.rb2b}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'center', color: row.opensend === 'Enterprise' ? '#4a6a9a' : '#D9ECFF', fontSize: '13px', fontFamily: 'monospace' }}>{row.opensend}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'center', color: row.warmly === 'Enterprise' ? '#4a6a9a' : '#D9ECFF', fontSize: '13px', fontFamily: 'monospace' }}>{row.warmly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ color: '#4a6a9a', fontSize: '12px', textAlign: 'center' }}>
            *Warmly requires $10,000/yr minimum for person-level identification. Competitor pricing estimated from publicly available information as of March 2026. RB2B and OpenSend prices include base plan cost plus overage charges at published rates.
          </p>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section style={{ padding: '0 0 100px', background: '#000002' }}>
        <div className="sc" style={{ maxWidth: '700px', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(145deg, #06162A 0%, #040E1A 100%)', border: '1px solid rgba(26,92,168,0.4)', borderRadius: '16px', padding: '56px 40px' }}>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(26px, 4vw, 40px)', letterSpacing: '-1px', marginBottom: '12px' }}>Need Custom Terms?</h2>
            <p style={{ color: '#D9ECFF', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
              SLAs, data residency, custom integrations, dedicated support - we'll build a plan around your requirements.
            </p>
            <a href="https://app.arkdata.io" target="_blank" rel="noopener noreferrer">
              <button style={{ background: 'linear-gradient(135deg, #C8001E 0%, #8B0015 100%)', border: 'none', borderRadius: '8px', padding: '16px 40px', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(177,0,26,0.4)' }}>
                Talk to Our Team
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}