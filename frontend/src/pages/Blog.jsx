import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Search, BookOpen } from 'lucide-react';
import API_URL from '../config';
import SubHero from '../components/SubHero';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket, normalizeLanguageCode } from '../utils/localization';

export default function Blog() {
  const [rawBlogs, setRawBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { language, t } = useSite();
  const activeLang = normalizeLanguageCode(language);

  const uiByLang = {
    en: { all: 'All', title: 'Travel Blog', subtitle: 'Stories, tips, and guides to inspire your next adventure', searchPlaceholder: 'Search articles...', loadingArticles: 'Loading articles...', noArticlesMatch: 'No articles match your search', noArticlesYet: 'No articles yet', tryDifferent: 'Try a different search term or category.', checkBackSoon: 'Check back soon for travel stories and tips!', featured: 'FEATURED', draft: 'Draft', readArticle: 'Read Article', readMore: 'Read More' },
    de: { all: 'Alle', title: 'Reiseblog', subtitle: 'Geschichten, Tipps und Guides fur Ihr nachstes Abenteuer', searchPlaceholder: 'Artikel suchen...', loadingArticles: 'Artikel werden geladen...', noArticlesMatch: 'Keine Artikel fur Ihre Suche', noArticlesYet: 'Noch keine Artikel', tryDifferent: 'Versuchen Sie einen anderen Suchbegriff oder eine andere Kategorie.', checkBackSoon: 'Schauen Sie bald wieder vorbei fur Reisetipps und Stories!', featured: 'EMPFOHLEN', draft: 'Entwurf', readArticle: 'Artikel lesen', readMore: 'Mehr lesen' },
    fr: { all: 'Tous', title: 'Blog Voyage', subtitle: 'Histoires, conseils et guides pour inspirer votre prochaine aventure', searchPlaceholder: 'Rechercher des articles...', loadingArticles: 'Chargement des articles...', noArticlesMatch: 'Aucun article ne correspond a votre recherche', noArticlesYet: 'Aucun article pour le moment', tryDifferent: 'Essayez un autre mot-cle ou une autre categorie.', checkBackSoon: 'Revenez bientot pour des histoires et conseils voyage !', featured: 'A LA UNE', draft: 'Brouillon', readArticle: "Lire l'article", readMore: 'Lire plus' },
    zh: { all: '全部', title: '旅行博客', subtitle: '故事、贴士与指南，激发你的下一次冒险', searchPlaceholder: '搜索文章...', loadingArticles: '正在加载文章...', noArticlesMatch: '没有匹配的文章', noArticlesYet: '暂无文章', tryDifferent: '请尝试其他关键词或分类。', checkBackSoon: '请稍后回来查看旅行故事与贴士！', featured: '精选', draft: '草稿', readArticle: '阅读文章', readMore: '阅读更多' },
    jp: { all: 'すべて', title: 'トラベルブログ', subtitle: '次の冒険に役立つストーリー・ヒント・ガイド', searchPlaceholder: '記事を検索...', loadingArticles: '記事を読み込み中...', noArticlesMatch: '検索に一致する記事がありません', noArticlesYet: 'まだ記事がありません', tryDifferent: '別のキーワードまたはカテゴリをお試しください。', checkBackSoon: '旅のストーリーとヒントをお楽しみに！', featured: '注目', draft: '下書き', readArticle: '記事を読む', readMore: '続きを読む' },
    ar: { all: 'الكل', title: 'مدونة السفر', subtitle: 'قصص ونصائح وادلة تلهم مغامرتك القادمة', searchPlaceholder: 'ابحث في المقالات...', loadingArticles: 'جار تحميل المقالات...', noArticlesMatch: 'لا توجد مقالات مطابقة', noArticlesYet: 'لا توجد مقالات بعد', tryDifferent: 'جرب كلمة بحث او تصنيفا اخر.', checkBackSoon: 'عد قريبا لقصص ونصائح السفر!', featured: 'مميز', draft: 'مسودة', readArticle: 'اقرا المقال', readMore: 'اقرا المزيد' },
    hi: { all: 'सभी', title: 'ट्रैवल ब्लॉग', subtitle: 'आपकी अगली यात्रा के लिए कहानियां, टिप्स और गाइड', searchPlaceholder: 'लेख खोजें...', loadingArticles: 'लेख लोड हो रहे हैं...', noArticlesMatch: 'आपकी खोज से कोई लेख नहीं मिला', noArticlesYet: 'अभी कोई लेख नहीं', tryDifferent: 'कोई दूसरा खोज शब्द या श्रेणी आजमाएं।', checkBackSoon: 'यात्रा कहानियों और टिप्स के लिए फिर आएं!', featured: 'फीचर्ड', draft: 'ड्राफ्ट', readArticle: 'लेख पढ़ें', readMore: 'और पढ़ें' },
  };
  const ui = uiByLang[activeLang] || uiByLang.en;

  const [selectedCategory, setSelectedCategory] = useState(ui.all);

  useEffect(() => {
    setSelectedCategory(ui.all);
  }, [ui.all]);

  useEffect(() => {
    fetch(`${API_URL}/blogs`)
      .then((r) => r.json())
      .then((data) => setRawBlogs(Array.isArray(data) ? data : []))
      .catch(() => setRawBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const blogs = rawBlogs.map((b) => {
    const bucket = getLocalizationBucket(b, activeLang);
    return { ...b, ...bucket };
  });

  const categories = [ui.all, ...new Set(blogs.map((b) => b.category).filter(Boolean))];

  const filtered = blogs.filter((b) => {
    const title = String(b.title || '');
    const excerpt = String(b.excerpt || '');
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === ui.all || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <SubHero title={ui.title} subtitle={ui.subtitle} breadcrumb={[{ label: t.navHome || 'Home', href: '/' }, { label: t.navBlogMain || 'Blog' }]} />

      <section dir={activeLang === 'ar' ? 'rtl' : 'ltr'} style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder={ui.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', border: '2px solid #e2e8f0', borderRadius: '1rem', fontSize: '0.95rem', outline: 'none', background: 'white', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '0.6rem 1.2rem', borderRadius: '2rem', border: '2px solid', borderColor: selectedCategory === cat ? 'hsl(var(--primary))' : '#e2e8f0', background: selectedCategory === cat ? 'hsl(var(--primary))' : 'white', color: selectedCategory === cat ? 'white' : '#64748b', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>{ui.loadingArticles}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <BookOpen size={64} style={{ marginBottom: '1.5rem', color: '#cbd5e1' }} />
            <h3 style={{ color: '#64748b', fontWeight: '700', marginBottom: '0.5rem' }}>{search || selectedCategory !== ui.all ? ui.noArticlesMatch : ui.noArticlesYet}</h3>
            <p style={{ color: '#94a3b8' }}>{search || selectedCategory !== ui.all ? ui.tryDifferent : ui.checkBackSoon}</p>
          </div>
        ) : (
          <>
            {filtered.length > 0 && !search && selectedCategory === ui.all && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3rem' }}>
                <FeaturedCard blog={filtered[0]} ui={ui} activeLang={activeLang} />
              </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
              {(search || selectedCategory !== ui.all ? filtered : filtered.slice(1)).map((blog, i) => (
                <motion.div key={blog._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <BlogCard blog={blog} ui={ui} activeLang={activeLang} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function FeaturedCard({ blog, ui, activeLang }) {
  return (
    <Link to={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        borderRadius: '1.5rem',
        overflow: 'hidden',
        background: 'white',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '380px',
        transition: 'transform 0.3s, box-shadow 0.3s'
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'; }}
      >
        <div style={{
          background: blog.coverImage ? `url(${blog.coverImage}) center/cover` : 'linear-gradient(135deg, hsl(var(--primary)), #6366f1)',
          minHeight: '300px'
        }} />
        <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', padding: '0.3rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '800' }}>
              ⭐ {ui.featured}
            </span>
            {blog.category && (
              <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.3rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '700' }}>
                {blog.category}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem', lineHeight: 1.3 }}>
            {blog.title}
          </h2>
          <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '1.5rem' }}>{blog.excerpt}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} /> {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString(activeLang, { month: 'short', day: 'numeric', year: 'numeric' }) : ui.draft}
            </span>
            {blog.readTime && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {blog.readTime}</span>}
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))', fontWeight: '800', fontSize: '0.9rem' }}>
            {ui.readArticle} <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ blog, ui, activeLang }) {
  return (
    <Link to={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        borderRadius: '1.25rem', overflow: 'hidden', background: 'white',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)', height: '100%',
        transition: 'transform 0.3s, box-shadow 0.3s', display: 'flex', flexDirection: 'column'
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; }}
      >
        <div style={{
          height: '220px',
          background: blog.coverImage ? `url(${blog.coverImage}) center/cover` : 'linear-gradient(135deg, hsl(var(--primary)), #6366f1)',
          position: 'relative'
        }}>
          {blog.category && (
            <span style={{
              position: 'absolute', top: '1rem', left: '1rem',
              background: 'white', color: '#0f172a', padding: '0.3rem 0.75rem',
              borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '800'
            }}>
              {blog.category}
            </span>
          )}
        </div>
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={13} /> {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString(activeLang, { month: 'short', day: 'numeric', year: 'numeric' }) : ui.draft}
            </span>
            {blog.readTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={13} /> {blog.readTime}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.6rem', lineHeight: 1.4 }}>
            {blog.title}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
            {blog.excerpt}
          </p>
          {blog.tags && blog.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {blog.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ background: '#f8fafc', color: '#64748b', padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: '700' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--primary))', fontWeight: '800', fontSize: '0.85rem' }}>
            {ui.readMore} <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
