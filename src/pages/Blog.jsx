import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Clock, Tag } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const categoryColors = {
  guide: { bg: '#06162A', border: '#0A2142', text: '#D9ECFF' },
  product: { bg: '#042016', border: '#063524', text: '#DFFFEF' },
  industry: { bg: '#0A2142', border: '#1a4a8a', text: '#D9ECFF' },
  tips: { bg: '#1a0a00', border: '#3d1a00', text: '#FFD9B0' },
  news: { bg: '#1a0020', border: '#3d0050', text: '#E0B0FF' },
};

const categoryLabels = { guide: 'Guide', product: 'Product', industry: 'Industry', tips: 'Tips & Tactics', news: 'News' };

function ArticleCard({ post, featured }) {
  const cat = categoryColors[post.category] || categoryColors.guide;

  if (featured) {
    return (
      <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '14px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', transition: 'border-color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.borderColor = '#1a5ca8'}
        onMouseOut={e => e.currentTarget.style.borderColor = '#0A2142'}>
        {post.cover_image_url && (
          <div style={{ minHeight: '260px', background: `url(${post.cover_image_url}) center/cover no-repeat`, flexShrink: 0 }} />
        )}
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ background: cat.bg, border: `1px solid ${cat.border}`, color: cat.text, fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {categoryLabels[post.category]}
              </span>
              {post.featured && <span style={{ background: '#B1001A', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', letterSpacing: '0.06em' }}>Featured</span>}
            </div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px', lineHeight: 1.3, marginBottom: '12px' }}>{post.title}</h2>
            <p style={{ color: S.muted, fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>{post.excerpt}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', background: '#0A2142', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                {post.author_name?.[0] || 'A'}
              </div>
              <span style={{ color: S.muted, fontSize: '12px', fontWeight: 600 }}>{post.author_name || 'Ark Data Team'}</span>
            </div>
            <Link to={`${createPageUrl('BlogPost')}?slug=${post.slug}`}>
              <button className="ark-btn-red" style={{ padding: '9px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Read <ArrowRight size={13} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s', cursor: 'pointer' }}
      onMouseOver={e => e.currentTarget.style.borderColor = '#1a5ca8'}
      onMouseOut={e => e.currentTarget.style.borderColor = '#0A2142'}>
      {post.cover_image_url && (
        <div style={{ height: '180px', background: `url(${post.cover_image_url}) center/cover no-repeat`, flexShrink: 0 }} />
      )}
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ background: cat.bg, border: `1px solid ${cat.border}`, color: cat.text, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {categoryLabels[post.category]}
          </span>
        </div>
        <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px', lineHeight: 1.35, marginBottom: '10px', letterSpacing: '-0.3px' }}>{post.title}</h3>
        <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65, marginBottom: '20px', flex: 1 }}>{post.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #0A2142' }}>
          <span style={{ color: '#4a6a9a', fontSize: '12px' }}>{post.author_name || 'Ark Data Team'}</span>
          <Link to={`${createPageUrl('BlogPost')}?slug=${post.slug}`} style={{ color: '#D9ECFF', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Read <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

const categories = ['All', 'Guide', 'Tips & Tactics', 'Industry', 'Product', 'News'];
const categoryKeys = { 'All': null, 'Guide': 'guide', 'Tips & Tactics': 'tips', 'Industry': 'industry', 'Product': 'product', 'News': 'news' };

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    base44.entities.BlogPost.filter({ published: true }, '-created_date', 50).then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter(p => p.category === categoryKeys[activeCategory]);

  const featured = filtered.find(p => p.featured);
  const rest = filtered.filter(p => !p.featured || activeCategory !== 'All');

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '72px 0 48px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <p style={{ color: S.red, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Blog & Resources</p>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '14px' }}>Intelligence for Revenue Operators</h1>
          <p style={{ color: S.muted, fontSize: '16px', lineHeight: 1.7 }}>Guides, tactics, and industry insights on intent data, lead enrichment, outbound strategy, and RevOps.</p>
        </div>
      </section>

      <div className="sc" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
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

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: S.muted }}>Loading articles...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: S.muted }}>No articles in this category yet.</div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            {/* Featured */}
            {featured && activeCategory === 'All' && (
              <div style={{ marginBottom: '32px' }}>
                <ArticleCard post={featured} featured />
              </div>
            )}

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {(activeCategory === 'All' ? rest : filtered).map(post => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}

        {/* Newsletter CTA */}
        <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '14px', padding: '48px', textAlign: 'center', marginTop: '64px' }}>
          <p style={{ color: S.red, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Stay Ahead</p>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.6px', marginBottom: '10px' }}>Intelligence in your inbox</h2>
          <p style={{ color: S.muted, fontSize: '14px', marginBottom: '24px' }}>Intent data insights, enrichment playbooks, and RevOps strategies. Delivered weekly.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input className="ark-input" placeholder="your@email.com" style={{ maxWidth: '260px' }} />
            <button className="ark-btn-red" style={{ padding: '12px 20px', fontSize: '13px', whiteSpace: 'nowrap' }}>Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
}