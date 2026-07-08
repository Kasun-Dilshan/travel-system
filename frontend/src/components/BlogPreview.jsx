import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, User } from 'lucide-react';
import SectionHeader from './SectionHeader';
import API_URL from '../config';

const BlogPreview = ({ title, accentColor = 'hsl(var(--primary))' }) => {
  const fallbackBlogs = [
    { 
      title: "10 Hidden Gems in the Hill Country", 
      excerpt: "Explore the misty tea plantations and secret waterfalls of Ella and beyond.",
      date: "May 12, 2024",
      author: "Serendib Team"
    },
    { 
      title: "Sustainable Travel: A Guide to Sri Lanka", 
      excerpt: "How to minimize your footprint while maximizing your experience on the island.",
      date: "June 05, 2024",
      author: "Echoes of Lanka"
    },
    { 
      title: "Global Travel Trends for 2024", 
      excerpt: "The destinations and experiences that are capturing the world's imagination.",
      date: "July 20, 2024",
      author: "World Explorer"
    }
  ];

  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_URL}/blogs`)
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted || !Array.isArray(data)) return;

        const publishedBlogs = data
          .filter((blog) => blog?.status === 'published')
          .slice(0, 3)
          .map((blog) => ({
            ...blog,
            date: blog.publishedAt
              ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: '2-digit',
                  year: 'numeric'
                })
              : 'Draft',
            author: blog.author || 'Serendib Team'
          }));

        setBlogs(publishedBlogs);
      })
      .catch(() => {
        if (isMounted) setBlogs([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const previewBlogs = useMemo(() => {
    return blogs.length ? blogs : fallbackBlogs;
  }, [blogs]);

  return (
    <section style={{ padding: '80px 0' }}>
      <SectionHeader title={title} center={true} accentColor={accentColor} />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        marginTop: '3rem'
      }}>
        {previewBlogs.map((blog, i) => {
          const href = blog.slug ? `/blog/${blog.slug}` : '/blog';
          return (
            <Link key={blog._id || blog.slug || i} to={href} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: '2.5rem',
                  borderRadius: '2rem',
                  backgroundColor: 'hsl(var(--primary) / 0.02)',
                  border: '1px solid hsl(var(--glass-border))',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', opacity: 0.5, fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} />
                    <span>{blog.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={14} />
                    <span>{blog.author}</span>
                  </div>
                </div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: 'hsl(var(--secondary))', lineHeight: 1.3 }}>
                  {blog.title}
                </h4>
                <p style={{ fontSize: '1rem', opacity: 0.6, lineHeight: 1.6, marginBottom: '2rem', color: 'hsl(var(--foreground))' }}>
                  {blog.excerpt}
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: accentColor,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Read More <ArrowUpRight size={18} />
                </motion.div>

                <div style={{
                  position: 'absolute',
                  top: '2.5rem',
                  right: '2.5rem',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: accentColor,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                  opacity: 0,
                  transition: 'opacity 0.3s'
                }} className="blog-arrow">
                  <ArrowUpRight size={24} />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default BlogPreview;
