import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ArrowRight, Play } from 'lucide-react';

const DEMO_URL = 'https://arkdata-audience-builder-demo.netlify.app';

// Homepage teaser for the flagship Audience Builder.
// Click-to-load iframe keeps the ~3MB demo off the homepage critical path.
export default function BuilderShowcase() {
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="sp" style={{ background: 'radial-gradient(1000px 500px at 50% 0%, rgba(25,195,125,0.07) 0%, transparent 60%), #060D1A', borderTop: '1px solid #101E33' }}>
      <div className="sc">
        <div style={{ maxWidth: '680px', margin: '0 auto 40px', textAlign: 'center' }}>
          <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>
            THE FLAGSHIP · AUDIENCE BUILDER
          </p>
          <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: '14px' }}>
            Describe your buyer. Watch the audience build itself.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, margin: 0 }}>
            Stack intent topics with demographic, firmographic, and geographic filters — and watch a plain-English
            description, a live map, and a 500-row preview assemble in seconds. This is the real builder. Try it.
          </p>
        </div>

        {/* Browser-chrome frame */}
        <div style={{ maxWidth: '1080px', margin: '0 auto', borderRadius: '14px', overflow: 'hidden', border: '1px solid #1B3050', boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(25,195,125,0.06)' }}>
          <div style={{ background: '#0B1526', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #14263F' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
            <span className="ark-mono" style={{ color: '#5B7699', fontSize: '11px', marginLeft: '12px' }}>app.arkdata.io/audience-builder</span>
            <span className="ark-mono" style={{ marginLeft: 'auto', color: '#19C37D', fontSize: '10px', letterSpacing: '0.1em', border: '1px solid rgba(25,195,125,0.35)', borderRadius: '100px', padding: '3px 10px', background: 'rgba(25,195,125,0.07)' }}>
              LIVE DEMO
            </span>
          </div>

          <div style={{ position: 'relative', background: '#081020', aspectRatio: '16 / 9.6', minHeight: '420px' }}>
            {loaded ? (
              <iframe
                src={DEMO_URL}
                title="ArkData Audience Builder — interactive demo"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                loading="lazy"
              />
            ) : (
              <button
                onClick={() => setLoaded(true)}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px', background: 'radial-gradient(600px 300px at 50% 45%, rgba(25,195,125,0.10) 0%, transparent 60%), #081020' }}
              >
                <span style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(25,195,125,0.12)', border: '2px solid #19C37D', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(25,195,125,0.3)' }}>
                  <Play size={26} style={{ color: '#19C37D', marginLeft: '4px' }} fill="#19C37D" />
                </span>
                <span className="ark-display" style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>Load the interactive demo</span>
                <span className="ark-mono" style={{ color: '#5B7699', fontSize: '12px' }}>Free-play · real filters, real map, masked sample records</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '36px' }}>
          <Link to={createPageUrl('Demo')}>
            <button className="ark-btn-green" style={{ padding: '14px 30px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Open full-screen demo <ArrowRight size={15} />
            </button>
          </Link>
          <Link to={createPageUrl('BookADemo')}>
            <button className="ark-btn-blue" style={{ padding: '14px 30px', fontSize: '15px' }}>Book a walkthrough</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
