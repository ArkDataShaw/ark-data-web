import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

export default function BookADemo() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Book a Call</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>See Ark Data in Action.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7 }}>No hard sales pitch. A personalized walkthrough built for your use case and team.</p>
        </div>
      </section>

      <div className="sc" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px', alignItems: 'start' }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '17px', marginBottom: '20px' }}>What You'll Get</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {[
                { title: 'Live product demo', desc: 'See Lost Traffic recovery and High Intent data live against your own website.' },
                { title: 'Custom fit assessment', desc: 'We\'ll map your use case to the right package and delivery method.' },
                { title: 'Intent signal exploration', desc: 'Review which intent categories are most relevant for your ICP.' },
                { title: 'ROI estimate', desc: 'We\'ll build a directional pipeline impact estimate based on your current metrics.' },
                { title: 'Compliance overview', desc: 'Quick walk-through of our data handling, privacy posture, and DPA availability.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <CheckCircle size={15} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', marginBottom: '3px' }}>{item.title}</p>
                    <p style={{ color: S.muted, fontSize: '12px', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '8px', padding: '20px' }}>
              <p style={{ color: '#DFFFEF', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Call Details</p>
              <p style={{ color: '#DFFFEF', fontSize: '13px', marginBottom: '6px' }}>⏱ 30 minutes</p>
              <p style={{ color: '#DFFFEF', fontSize: '13px', marginBottom: '6px' }}>👥 Sales, Marketing, or RevOps lead</p>
              <p style={{ color: '#DFFFEF', fontSize: '13px' }}>📧 hello@arkdata.io</p>
            </div>
          </div>

          <div>
            <div
              className="calendly-inline-widget"
              data-url="https://calendly.com/arkdata/demo?hide_event_type_details=1&background_color=06162A&text_color=D9ECFF&primary_color=B1001A"
              style={{ minWidth: '320px', height: '700px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #0A2142' }}
            />
            <p style={{ color: S.muted, fontSize: '12px', marginTop: '14px', textAlign: 'center' }}>
              Trouble scheduling? Email us at{' '}
              <a href="mailto:hello@arkdata.io" style={{ color: '#DFFFEF' }}>hello@arkdata.io</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}