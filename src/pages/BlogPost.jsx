import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const S = { muted: '#D9ECFF', red: '#B1001A' };

const categoryLabels = { guide: 'Guide', product: 'Product', industry: 'Industry', tips: 'Tips & Tactics', news: 'News' };

export default function BlogPost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) return;
    base44.entities.BlogPost.filter({ slug, published: true }, '-created_date', 1).then(([found]) => {
      setPost(found || null);
      setLoading(false);
      if (found) {
        base44.entities.BlogPost.filter({ published: true, category: found.category }, '-created_date', 4).then(rel => {
          setRelated(rel.filter(r => r.id !== found.id).slice(0, 3));
        });
      }
    });
  }, []);

  if (loading) return (
    <div style={{ background: '#000002', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.muted }}>Loading...</div>
  );

  if (!post) return (
    <div style={{ background: '#000002', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <p style={{ color: S.muted, fontSize: '16px' }}>Article not found.</p>
      <Link to={createPageUrl('Blog')}><button className="ark-btn-blue" style={{ padding: '10px 20px', fontSize: '14px' }}>Back to Blog</button></Link>
    </div>
  );

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 70%)', borderBottom: '1px solid #0A2142', padding: '60px 0 48px' }}>
        <div className="sc" style={{ maxWidth: '760px' }}>
          <Link to={createPageUrl('Blog')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: S.muted, fontSize: '13px', fontWeight: 500, marginBottom: '24px' }}>
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <span style={{ background: '#0A2142', color: S.muted, fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {categoryLabels[post.category] || post.category}
            </span>
            {post.tags?.map(tag => (
              <span key={tag} style={{ background: '#06162A', border: '1px solid #0A2142', color: '#4a6a9a', fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '100px' }}>{tag}</span>
            ))}
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '16px' }}>{post.title}</h1>
          <p style={{ color: S.muted, fontSize: '16px', lineHeight: 1.7, marginBottom: '24px' }}>{post.excerpt}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '20px', borderTop: '1px solid #0A2142' }}>
            <div style={{ width: '36px', height: '36px', background: '#0A2142', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
              {post.author_name?.[0] || 'A'}
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{post.author_name || 'Ark Data Team'}</p>
              <p style={{ color: '#4a6a9a', fontSize: '12px' }}>{new Date(post.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="sc" style={{ maxWidth: '760px', paddingTop: '32px' }}>
          <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', borderRadius: '12px', border: '1px solid #0A2142', maxHeight: '400px', objectFit: 'cover' }} />
        </div>
      )}

      {/* Content */}
      <div className="sc" style={{ maxWidth: '760px', padding: '40px 32px 80px' }}>
        <div style={{
          color: S.muted,
          lineHeight: 1.8,
          fontSize: '15px',
        }}>
          <style>{`
            .blog-content h2 { color: #fff; font-size: 22px; font-weight: 800; letter-spacing: -0.4px; margin: 36px 0 14px; }
            .blog-content h3 { color: #fff; font-size: 17px; font-weight: 700; margin: 28px 0 10px; }
            .blog-content p { color: #D9ECFF; margin-bottom: 16px; }
            .blog-content ul, .blog-content ol { color: #D9ECFF; padding-left: 20px; margin-bottom: 16px; }
            .blog-content li { margin-bottom: 8px; }
            .blog-content strong { color: #fff; font-weight: 700; }
            .blog-content blockquote { border-left: 3px solid #B1001A; padding: 12px 20px; background: #06162A; border-radius: 0 8px 8px 0; margin: 24px 0; color: #D9ECFF; font-style: italic; }
            .blog-content code { background: #06162A; border: 1px solid #0A2142; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #DFFFEF; }
            .blog-content hr { border: none; border-top: 1px solid #0A2142; margin: 32px 0; }
          `}</style>
          <div className="blog-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '40px', paddingTop: '28px', borderTop: '1px solid #0A2142' }}>
            <span style={{ color: '#4a6a9a', fontSize: '12px', fontWeight: 600, marginRight: '4px' }}>Tags:</span>
            {post.tags.map(tag => (
              <span key={tag} style={{ background: '#06162A', border: '1px solid #0A2142', color: S.muted, fontSize: '12px', padding: '4px 10px', borderRadius: '100px' }}>{tag}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #06162A, #042016)', border: '1px solid #0A2142', borderRadius: '12px', padding: '36px', textAlign: 'center', marginTop: '48px' }}>
          <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.4px', marginBottom: '10px' }}>Ready to put this into practice?</h3>
          <p style={{ color: S.muted, fontSize: '14px', marginBottom: '24px' }}>Book a 30-minute call with our team and see how Ark Data fits your stack.</p>
          <Link to={createPageUrl('BookADemo')}>
            <button className="ark-btn-red" style={{ padding: '12px 28px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Book a Call <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: '56px' }}>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '20px' }}>Related Articles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {related.map(r => (
                <Link key={r.id} to={`${createPageUrl('BlogPost')}?slug=${r.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '20px', transition: 'border-color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#1a5ca8'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#0A2142'}>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', lineHeight: 1.4, marginBottom: '8px' }}>{r.title}</p>
                    <p style={{ color: S.muted, fontSize: '12px', lineHeight: 1.6 }}>{r.excerpt?.slice(0, 80)}...</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}