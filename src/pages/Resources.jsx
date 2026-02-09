import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Resources() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog_posts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }),
  });

  const defaultPosts = [
    {
      id: '1',
      title: 'How to Identify Lost Revenue in Your Website Traffic',
      category: 'guide',
      excerpt: 'A complete guide to finding the qualified prospects you\'re currently losing to form abandonment.',
      cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      author_name: 'Sarah Chen',
      published: true,
    },
    {
      id: '2',
      title: 'Intent Scoring: Beyond Basic Lead Scoring',
      category: 'product',
      excerpt: 'Learn how AI-powered intent signals give you competitive advantage in sales.',
      cover_image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
      author_name: 'Mike Johnson',
      published: true,
    },
    {
      id: '3',
      title: 'SaaS Revenue Operations: A Playbook for 2024',
      category: 'tips',
      excerpt: 'Best practices for building a high-performing RevOps function in 2024.',
      cover_image_url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80',
      author_name: 'Alex Rivera',
      published: true,
    },
    {
      id: '4',
      title: 'Privacy-First Analytics: A New Era Begins',
      category: 'industry',
      excerpt: 'How cookie deprecation is reshaping visitor identification and what to do about it.',
      cover_image_url: 'https://images.unsplash.com/photo-1516534775068-bb57451e330f?w=800&q=80',
      author_name: 'Jordan Taylor',
      published: true,
    },
    {
      id: '5',
      title: 'Measuring Sales Productivity: Metrics That Matter',
      category: 'guide',
      excerpt: 'Define and track the KPIs that actually drive revenue outcomes.',
      cover_image_url: 'https://images.unsplash.com/photo-1460925895917-adf4e565db7d?w=800&q=80',
      author_name: 'Emma Wilson',
      published: true,
    },
  ];

  const posts = blogPosts.filter(p => p.published).length > 0 ? blogPosts : defaultPosts;
  
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'guide', label: 'Guides' },
    { id: 'product', label: 'Product' },
    { id: 'industry', label: 'Industry' },
    { id: 'tips', label: 'Tips' },
  ];

  const filtered = selectedCategory === 'all'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Resources & insights
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Learn best practices, industry trends, and practical guides for revenue teams.
        </p>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap gap-3 justify-center mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((post) => (
            <article key={post.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition">
              <div className="h-48 bg-gray-200 overflow-hidden">
                {post.cover_image_url ? (
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100" />
                )}
              </div>

              <div className="p-6">
                <span className="text-xs font-semibold text-blue-600 uppercase">
                  {categories.find(c => c.id === post.category)?.label}
                </span>

                <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    {post.author_name && (
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {post.author_name}
                      </span>
                    )}
                  </div>
                </div>

                <button className="text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center gap-2">
                  Read more
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Stay updated
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Subscribe to our newsletter for weekly insights on revenue operations and visitor intelligence.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); }} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap">
              Subscribe
            </button>
          </form>

          <p className="text-xs text-gray-600 mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}