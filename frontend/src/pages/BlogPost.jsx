import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Tag, ArrowLeft, Share2, User, BookOpen } from 'lucide-react';
import API_URL from '../config';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket, normalizeLanguageCode } from '../utils/localization';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function seemsHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
}

function formatPlainBlogContentToHtml(input) {
  const original = String(input || '').replace(/\r\n/g, '\n');
  if (!original.trim()) return '';

  // Handle "inline bullets" like: "Text... • A • B • C"
  const preprocessed = original.includes('•')
    ? original.replace(/\s*•\s+/g, '\n• ')
    : original;

  const lines = preprocessed.split('\n');
  const out = [];
  let paragraph = [];
  let listType = null; // 'ul' | 'ol'
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const html = escapeHtml(paragraph.join(' ')).replace(/\s+/g, ' ').trim();
    if (html) out.push(`<p>${html}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) { listType = null; listItems = []; return; }
    out.push(`<${listType}>${listItems.map((li) => `<li>${escapeHtml(li)}</li>`).join('')}</${listType}>`);
    listType = null;
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = String(rawLine || '').trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const unorderedMatch = line.match(/^([•*\-–—])\s+(.*)$/);
    const orderedMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);

    if (unorderedMatch) {
      flushParagraph();
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(unorderedMatch[2].trim());
      continue;
    }

    if (orderedMatch) {
      flushParagraph();
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(orderedMatch[2].trim());
      continue;
    }

    // Normal text line
    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return out.join('\n');
}

function formatBlogContentToHtml(input) {
  if (seemsHtml(input)) return String(input || '');
  return formatPlainBlogContentToHtml(input);
}

export default function BlogPost() {
  const { slug } = useParams();
  const [rawBlog, setRawBlog] = useState(null);
  const [rawRelated, setRawRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { language, t } = useSite();
  const activeLang = normalizeLanguageCode(language);
  const uiByLang = {
    en: { loading: 'Loading article...', notFoundTitle: 'Article not found', notFoundDesc: 'This article may have been removed or the link is incorrect.', backToBlog: 'Back to Blog', copied: 'Link copied to clipboard!', share: 'Share', tags: 'Tags', backToAll: 'Back to all articles', draft: 'Draft', authorFallback: 'Serendib Travel' },
    de: { loading: 'Artikel wird geladen...', notFoundTitle: 'Artikel nicht gefunden', notFoundDesc: 'Dieser Artikel wurde moglicherweise entfernt oder der Link ist falsch.', backToBlog: 'Zuruck zum Blog', copied: 'Link in die Zwischenablage kopiert!', share: 'Teilen', tags: 'Tags', backToAll: 'Zuruck zu allen Artikeln', draft: 'Entwurf', authorFallback: 'Serendib Travel' },
    fr: { loading: "Chargement de l'article...", notFoundTitle: 'Article introuvable', notFoundDesc: "Cet article a peut-etre ete supprime ou le lien est incorrect.", backToBlog: 'Retour au blog', copied: 'Lien copie dans le presse-papiers !', share: 'Partager', tags: 'Tags', backToAll: 'Retour a tous les articles', draft: 'Brouillon', authorFallback: 'Serendib Travel' },
    zh: { loading: '正在加载文章...', notFoundTitle: '未找到文章', notFoundDesc: '该文章可能已被删除或链接不正确。', backToBlog: '返回博客', copied: '链接已复制到剪贴板！', share: '分享', tags: '标签', backToAll: '返回全部文章', draft: '草稿', authorFallback: 'Serendib Travel' },
    jp: { loading: '記事を読み込み中...', notFoundTitle: '記事が見つかりません', notFoundDesc: 'この記事は削除されたか、リンクが間違っている可能性があります。', backToBlog: 'ブログへ戻る', copied: 'リンクをクリップボードにコピーしました！', share: '共有', tags: 'タグ', backToAll: 'すべての記事へ戻る', draft: '下書き', authorFallback: 'Serendib Travel' },
    ar: { loading: 'جار تحميل المقال...', notFoundTitle: 'المقال غير موجود', notFoundDesc: 'قد يكون هذا المقال قد تمت ازالته او ان الرابط غير صحيح.', backToBlog: 'العودة الى المدونة', copied: 'تم نسخ الرابط!', share: 'مشاركة', tags: 'الوسوم', backToAll: 'العودة الى كل المقالات', draft: 'مسودة', authorFallback: 'Serendib Travel' },
    hi: { loading: 'लेख लोड हो रहा है...', notFoundTitle: 'लेख नहीं मिला', notFoundDesc: 'यह लेख हटाया जा चुका हो सकता है या लिंक गलत है।', backToBlog: 'ब्लॉग पर वापस जाएं', copied: 'लिंक क्लिपबोर्ड में कॉपी हो गया!', share: 'शेयर करें', tags: 'टैग', backToAll: 'सभी लेखों पर वापस जाएं', draft: 'ड्राफ्ट', authorFallback: 'Serendib Travel' },
  };
  const ui = uiByLang[activeLang] || uiByLang.en;

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`${API_URL}/blogs/slug/${encodeURIComponent(slug ?? '')}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (data) {
          setRawBlog(data);
          return fetch(`${API_URL}/blogs`)
            .then(r => r.json())
            .then(all => ({ article: data, all }));
        }
        return null;
      })
      .then(result => {
        if (result?.article && Array.isArray(result.all)) {
          const { article, all } = result;
          setRawRelated(all.filter(b => b._id !== article._id && b.category === article.category).slice(0, 3));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const blog = rawBlog
    ? ({ ...rawBlog, ...getLocalizationBucket(rawBlog, activeLang) })
    : null;

  const related = rawRelated.map((b) => ({ ...b, ...getLocalizationBucket(b, activeLang) }));

  const contentHtml = useMemo(() => formatBlogContentToHtml(blog?.content), [blog?.content]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(ui.copied);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div className="loader" />
        <p style={{ color: '#94a3b8' }}>{ui.loading}</p>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
        <BookOpen size={64} style={{ color: '#cbd5e1' }} />
        <h2 style={{ color: '#0f172a', fontWeight: '900' }}>{ui.notFoundTitle}</h2>
        <p style={{ color: '#64748b' }}>{ui.notFoundDesc}</p>
        <Link to="/blog" style={{ color: 'hsl(var(--primary))', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> {ui.backToBlog}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        width: '100%',
        height: '480px',
        background: blog.coverImage
          ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.65)), url(${blog.coverImage}) center/cover`
          : 'linear-gradient(135deg, hsl(var(--primary)), #6366f1)',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '4rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            <ArrowLeft size={18} /> {ui.backToBlog}
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {blog.category && (
              <span style={{ background: 'hsl(var(--primary))', color: 'white', padding: '0.35rem 1rem', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: '800' }}>
                {blog.category}
              </span>
            )}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: '900', color: 'white', lineHeight: 1.2, marginBottom: '1.5rem' }}
          >
            {blog.title}
          </motion.h1>
          <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} /> {blog.author || ui.authorFallback}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} /> {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString(activeLang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ui.draft}
            </span>
            {blog.readTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} /> {blog.readTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Share Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', border: '2px solid #e2e8f0', background: 'white', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '700', color: '#64748b', fontSize: '0.85rem' }}>
            <Share2 size={16} /> {ui.share}
          </button>
        </div>

        {/* Excerpt */}
        <p style={{ fontSize: '1.2rem', color: '#475569', lineHeight: 1.8, fontWeight: '500', borderLeft: '4px solid hsl(var(--primary))', paddingLeft: '1.5rem', marginBottom: '3rem', fontStyle: 'italic' }}>
          {blog.excerpt}
        </p>

        {/* Main Content */}
        <div
          className="blog-content"
          style={{ color: '#334155', lineHeight: 1.9, fontSize: '1.05rem' }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={14} /> {ui.tags}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {blog.tags.map(tag => (
                <Link key={tag} to={`/blog?tag=${tag}`} style={{ background: '#f1f5f9', color: '#475569', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none' }}>
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))', fontWeight: '800', textDecoration: 'none', fontSize: '1rem' }}>
            <ArrowLeft size={20} /> {ui.backToAll}
          </Link>
        </div>
      </div>
    </div>
  );
}
