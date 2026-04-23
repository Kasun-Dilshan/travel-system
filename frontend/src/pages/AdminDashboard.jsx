import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL, { mediaUrl } from '../config';
import AdminLogin from '../components/AdminLogin';
import { RevenueChart, CategoryDistribution } from '../components/DashboardCharts';
import {
  Users, Calendar, Phone, Mail, MapPin, Trash2,
  CheckCircle2, X, Clock, Search, AlertCircle,
  TrendingUp, LayoutDashboard, Briefcase, Settings,
  Plus, RefreshCcw, Pencil, Save, LogOut, ExternalLink,
  DollarSign, BookOpen, Globe, Image, Link as LinkIcon,
  ChevronDown, ChevronUp, Eye, EyeOff, Star, Tag, FileText
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function uploadAdminImage(file) {
  const token = localStorage.getItem('admin_token');
  const body = new FormData();
  body.append('image', file);
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Upload failed: ${res.status}`);
  }
  return res.json();
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin_session') === 'active' && !!localStorage.getItem('admin_token');
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');

  // Package modal
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const emptyPkg = { title: '', price: 0, image: '', gallery: [], duration: '', description: '', category: 'Inbound', type: 'Round', inclusions: [], exclusions: [], highlights: [], itinerary: [], featured: false, isLimitedTime: false, discountPercentage: 0, seoTitle: '', seoDescription: '' };
  const [pkgForm, setPkgForm] = useState(emptyPkg);

  // Blog modal
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const emptyBlog = { title: '', slug: '', excerpt: '', content: '', coverImage: '', tags: [], category: 'Travel Tips', author: 'Serendib Travel', status: 'draft', readTime: '', seoTitle: '', seoDescription: '' };
  const [blogForm, setBlogForm] = useState(emptyBlog);

  // Settings state
  const [settingsForm, setSettingsForm] = useState({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = useCallback((token) => {
    setIsLoggedIn(true);
    fetchData();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_token');
  };

  // ── Data Fetch ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookingsData, packagesData, blogsData, settingsData] = await Promise.all([
        apiFetch(`${API_URL}/bookings`),
        apiFetch(`${API_URL}/packages`),
        apiFetch(`${API_URL}/blogs?all=true`),
        apiFetch(`${API_URL}/settings`)
      ]);
      if (Array.isArray(bookingsData)) setBookings(bookingsData);
      if (Array.isArray(packagesData)) setPackages(packagesData);
      if (Array.isArray(blogsData)) setBlogs(blogsData);
      if (settingsData) {
        setSiteSettings(settingsData);
        setSettingsForm(settingsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn, fetchData]);

  // ── Bookings ──────────────────────────────────────────────────────────────
  const updateBookingStatus = async (id, status) => {
    try {
      await apiFetch(`${API_URL}/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch (err) { alert(err.message); }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking forever?')) return;
    try {
      await apiFetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (err) { alert(err.message); }
  };

  // ── Packages ──────────────────────────────────────────────────────────────
  const handleOpenPkgModal = (pkg = null) => {
    setCurrentPackage(pkg);
    setPkgForm(pkg ? {
      title: pkg.title || '', price: pkg.price || 0, image: pkg.image || '',
      gallery: pkg.gallery || [], duration: pkg.duration || '',
      description: pkg.description || '', category: pkg.category || 'Inbound',
      type: pkg.type || 'Round', inclusions: pkg.inclusions || [],
      exclusions: pkg.exclusions || [], highlights: pkg.highlights || [],
      itinerary: pkg.itinerary || [], featured: pkg.featured || false,
      isLimitedTime: pkg.isLimitedTime || false,
      discountPercentage: pkg.discountPercentage || 0,
      seoTitle: pkg.seoTitle || '', seoDescription: pkg.seoDescription || ''
    } : emptyPkg);
    setIsPkgModalOpen(true);
  };

  const handlePkgCoverFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (JPEG, PNG, WebP, or GIF).');
      return;
    }
    setIsUploadingCover(true);
    try {
      const { url } = await uploadAdminImage(file);
      setPkgForm(p => ({ ...p, image: url }));
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!String(pkgForm.image || '').trim()) {
      alert('Please upload a cover image.');
      return;
    }
    setIsSaving(true);
    try {
      const method = currentPackage ? 'PUT' : 'POST';
      const url = currentPackage ? `${API_URL}/packages/${currentPackage._id}` : `${API_URL}/packages`;
      const saved = await apiFetch(url, { method, body: JSON.stringify(pkgForm) });
      setPackages(prev => currentPackage ? prev.map(p => p._id === saved._id ? saved : p) : [...prev, saved]);
      setIsPkgModalOpen(false);
    } catch (err) { alert(err.message); }
    finally { setIsSaving(false); }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Delete this tour package?')) return;
    try {
      await apiFetch(`${API_URL}/packages/${id}`, { method: 'DELETE' });
      setPackages(prev => prev.filter(p => p._id !== id));
    } catch (err) { alert(err.message); }
  };

  // ── Blogs ─────────────────────────────────────────────────────────────────
  const handleOpenBlogModal = (blog = null) => {
    setCurrentBlog(blog);
    setBlogForm(blog ? {
      title: blog.title || '', slug: blog.slug || '', excerpt: blog.excerpt || '',
      content: blog.content || '', coverImage: blog.coverImage || '',
      tags: blog.tags || [], category: blog.category || 'Travel Tips',
      author: blog.author || 'Serendib Travel', status: blog.status || 'draft',
      readTime: blog.readTime || '', seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || ''
    } : emptyBlog);
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = currentBlog ? 'PUT' : 'POST';
      const url = currentBlog ? `${API_URL}/blogs/${currentBlog._id}` : `${API_URL}/blogs`;
      const saved = await apiFetch(url, { method, body: JSON.stringify(blogForm) });
      setBlogs(prev => currentBlog ? prev.map(b => b._id === saved._id ? saved : b) : [...prev, saved]);
      setIsBlogModalOpen(false);
    } catch (err) { alert(err.message); }
    finally { setIsSaving(false); }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await apiFetch(`${API_URL}/blogs/${id}`, { method: 'DELETE' });
      setBlogs(prev => prev.filter(b => b._id !== id));
    } catch (err) { alert(err.message); }
  };

  // ── Settings ──────────────────────────────────────────────────────────────
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const saved = await apiFetch(`${API_URL}/settings`, { method: 'PUT', body: JSON.stringify(settingsForm) });
      setSiteSettings(saved);
      setSettingsForm(saved);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) { alert(err.message); }
    finally { setIsSavingSettings(false); }
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const stats = {
    totalBookings: bookings.length,
    revenue: bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + (b.totalPrice || 0), 0),
    avgTourPrice: packages.length > 0 ? packages.reduce((acc, p) => acc + (p.price || 0), 0) / packages.length : 0,
    pendingBookings: bookings.filter(b => b.status === 'pending').length
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = bookingFilter === 'all' || b.status === bookingFilter;
    const matchesSearch = (b.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (b.tourTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar" style={{ width: '280px', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
        <div style={{ padding: '0 0.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'hsl(var(--primary))', borderRadius: '0.5rem' }}></div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>Serendib</h2>
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CMS Portal</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<Calendar size={20} />} label="Bookings" badge={stats.pendingBookings || null} />
          <NavItem active={activeTab === 'tours'} onClick={() => setActiveTab('tours')} icon={<Briefcase size={20} />} label="Tour Packages" />
          <NavItem active={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')} icon={<BookOpen size={20} />} label="Blog Posts" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Site Settings" />
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <button onClick={() => window.open('/', '_blank')} className="admin-nav-item" style={{ color: '#64748b', marginBottom: '0.5rem' }}>
            <ExternalLink size={18} /><span>View Site</span>
          </button>
          <button onClick={handleLogout} className="admin-nav-item" style={{ color: '#ef4444' }}>
            <LogOut size={20} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '3rem', marginLeft: '280px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'bookings' && 'Bookings'}
              {activeTab === 'tours' && 'Tour Packages'}
              {activeTab === 'blogs' && 'Blog Posts'}
              {activeTab === 'settings' && 'Site Settings'}
            </h1>
            <p style={{ color: '#64748b' }}>Welcome back, Admin.</p>
          </div>
          <button onClick={fetchData} className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <RefreshCcw size={18} /> Sync
          </button>
        </header>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '6rem' }}>
            <div className="loader" style={{ margin: '0 auto' }} />
          </div>
        )}

        {!isLoading && (
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <StatCard label="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={<DollarSign size={24} />} trend="+12.5%" className="stat-gradient-1" />
                  <StatCard label="Total Bookings" value={stats.totalBookings} icon={<Users size={24} />} trend="+4 this week" className="stat-gradient-2" />
                  <StatCard label="Pending" value={stats.pendingBookings} icon={<Clock size={24} />} className="stat-gradient-3" />
                  <StatCard label="Blog Posts" value={blogs.length} icon={<BookOpen size={24} />} className="stat-gradient-4" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div className="admin-card">
                    <h3 style={{ fontWeight: '800', marginBottom: '2rem' }}>Revenue Trend</h3>
                    <RevenueChart data={[
                      { label: 'Mon', value: 1200 }, { label: 'Tue', value: 1900 },
                      { label: 'Wed', value: 1500 }, { label: 'Thu', value: 2500 },
                      { label: 'Fri', value: 2200 }, { label: 'Sat', value: 3800 },
                      { label: 'Sun', value: 4200 },
                    ]} />
                  </div>
                  <div className="admin-card">
                    <h3 style={{ fontWeight: '800', marginBottom: '2rem' }}>Tour Categories</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                      <CategoryDistribution data={[
                        { label: 'Inbound', value: packages.filter(p => p.category === 'Inbound').length, color: 'hsl(var(--primary))' },
                        { label: 'Outbound', value: packages.filter(p => p.category === 'Outbound').length, color: '#6366f1' },
                      ]} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="admin-card">
                    <h3 style={{ fontWeight: '800', marginBottom: '1.5rem' }}>Recent Bookings</h3>
                    {bookings.slice(0, 5).map(b => (
                      <div key={b._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{b.clientName}</p>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.tourTitle}</p>
                        </div>
                        <div className={`badge badge-${b.status}`} style={{ fontSize: '0.65rem' }}>{b.status}</div>
                      </div>
                    ))}
                  </div>
                  <div className="admin-card">
                    <h3 style={{ fontWeight: '800', marginBottom: '1.5rem' }}>Latest Blog Posts</h3>
                    {blogs.slice(0, 5).map(b => (
                      <div key={b._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: b.coverImage ? `url(${b.coverImage}) center/cover` : 'linear-gradient(135deg,hsl(var(--primary)),#6366f1)' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{b.title}</p>
                          <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{b.category}</p>
                        </div>
                        <span style={{ fontSize: '0.65rem', padding: '0.25rem 0.6rem', borderRadius: '1rem', background: b.status === 'published' ? '#f0fdf4' : '#f1f5f9', color: b.status === 'published' ? '#15803d' : '#64748b', fontWeight: '700' }}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                    {blogs.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No blog posts yet. Create one in the Blog tab.</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── BOOKINGS ── */}
            {activeTab === 'bookings' && (
              <motion.div key="bookings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="admin-card" style={{ padding: '0' }}>
                  <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
                        <button key={f} onClick={() => setBookingFilter(f)} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', backgroundColor: bookingFilter === f ? '#0f172a' : '#f1f5f9', color: bookingFilter === f ? 'white' : '#64748b', border: 'none', fontWeight: '700', fontSize: '0.85rem', textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.2s' }}>
                          {f} {f !== 'all' ? `(${bookings.filter(b => b.status === f).length})` : ''}
                        </button>
                      ))}
                    </div>
                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                      <input type="text" placeholder="Search..." className="form-control" style={{ paddingLeft: '3rem', borderRadius: '0.75rem', background: '#f8fafc' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                  </div>
                  <div className="admin-table-container" style={{ border: 'none', borderRadius: '0' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th><th>Tour Package</th><th>Status</th><th>Price</th><th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map(b => (
                          <tr key={b._id}>
                            <td>
                              <div style={{ fontWeight: '800', color: '#0f172a' }}>{b.clientName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.email}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: '700', color: 'hsl(var(--primary))' }}>{b.tourTitle}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(b.bookingDate).toLocaleDateString()}</div>
                            </td>
                            <td><div className={`badge badge-${b.status}`}>{b.status}</div></td>
                            <td><div style={{ fontWeight: '800' }}>${b.totalPrice?.toLocaleString()}</div></td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                {b.status === 'pending' && (
                                  <button onClick={() => updateBookingStatus(b._id, 'confirmed')} className="btn" style={{ background: '#f0fdf4', color: '#15803d', padding: '0.5rem' }}>
                                    <CheckCircle2 size={18} />
                                  </button>
                                )}
                                <button onClick={() => handleDeleteBooking(b._id)} className="btn" style={{ background: '#fef2f2', color: '#ef4444', padding: '0.5rem' }}>
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredBookings.length === 0 && (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No bookings found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TOURS ── */}
            {activeTab === 'tours' && (
              <motion.div key="tours" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <p style={{ color: '#64748b' }}>{packages.length} tour packages</p>
                  <button onClick={() => handleOpenPkgModal()} className="btn btn-primary" style={{ gap: '0.75rem' }}>
                    <Plus size={20} /> Create New Package
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                  {packages.map(p => (
                    <div key={p._id} className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                      <div style={{ position: 'relative', height: '180px' }}>
                        <img src={mediaUrl(p.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                          <span style={{ background: '#0f172a', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '800' }}>{p.category}</span>
                          {p.featured && <span style={{ background: '#f59e0b', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '800' }}>⭐ Featured</span>}
                        </div>
                      </div>
                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.35rem', color: '#0f172a' }}>{p.title}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>{p.duration} · {p.type}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a' }}>${p.price}</span>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleOpenPkgModal(p)} className="btn" style={{ padding: '0.5rem', background: '#f1f5f9', color: '#64748b' }}><Pencil size={16} /></button>
                            <button onClick={() => handleDeletePackage(p._id)} className="btn" style={{ padding: '0.5rem', background: '#fef2f2', color: '#ef4444' }}><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {packages.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
                      <Briefcase size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p>No tour packages yet. Create your first one!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── BLOGS ── */}
            {activeTab === 'blogs' && (
              <motion.div key="blogs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <p style={{ color: '#64748b' }}>{blogs.length} posts · {blogs.filter(b => b.status === 'published').length} published</p>
                  <button onClick={() => handleOpenBlogModal()} className="btn btn-primary" style={{ gap: '0.75rem' }}>
                    <Plus size={20} /> New Blog Post
                  </button>
                </div>
                <div className="admin-card" style={{ padding: '0' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Post</th><th>Category</th><th>Status</th><th>Published</th><th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map(b => (
                        <tr key={b._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '48px', height: '36px', borderRadius: '0.5rem', background: b.coverImage ? `url(${b.coverImage}) center/cover` : 'linear-gradient(135deg,hsl(var(--primary)),#6366f1)', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>{b.title}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/{b.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '700' }}>{b.category}</span></td>
                          <td>
                            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '800', background: b.status === 'published' ? '#f0fdf4' : '#f8fafc', color: b.status === 'published' ? '#15803d' : '#64748b' }}>
                              {b.status === 'published' ? '✓ Published' : '◦ Draft'}
                            </span>
                          </td>
                          <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                            {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : '—'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              {b.status === 'published' && (
                                <a href={`/blog/${b.slug}`} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.5rem', background: '#f0fdf4', color: '#15803d' }}>
                                  <ExternalLink size={16} />
                                </a>
                              )}
                              <button onClick={() => handleOpenBlogModal(b)} className="btn" style={{ padding: '0.5rem', background: '#f1f5f9', color: '#64748b' }}><Pencil size={16} /></button>
                              <button onClick={() => handleDeleteBlog(b._id)} className="btn" style={{ padding: '0.5rem', background: '#fef2f2', color: '#ef4444' }}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {blogs.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                          <BookOpen size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
                          No blog posts yet
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <form onSubmit={handleSaveSettings}>
                  <SettingsSection title="Hero Section" icon={<Globe size={18} />}>
                    <FormField label="Hero Title">
                      <input className="form-control" value={settingsForm.heroTitle || ''} onChange={e => setSettingsForm(p => ({ ...p, heroTitle: e.target.value }))} placeholder="e.g. Discover Sri Lanka's Hidden Paradise" />
                    </FormField>
                    <FormField label="Hero Subtitle">
                      <textarea className="form-control" rows={3} value={settingsForm.heroSubtitle || ''} onChange={e => setSettingsForm(p => ({ ...p, heroSubtitle: e.target.value }))} style={{ resize: 'vertical' }} />
                    </FormField>
                    <FormField label="Hero Background Image URL (primary)">
                      <input className="form-control" value={(settingsForm.heroImages || [])[0] || ''} onChange={e => setSettingsForm(p => ({ ...p, heroImages: [e.target.value, ...(p.heroImages || []).slice(1)] }))} placeholder="https://..." />
                    </FormField>
                  </SettingsSection>

                  <SettingsSection title="Company Info" icon={<Briefcase size={18} />}>
                    <div className="grid-2">
                      <FormField label="Company Name">
                        <input className="form-control" value={settingsForm.companyName || ''} onChange={e => setSettingsForm(p => ({ ...p, companyName: e.target.value }))} />
                      </FormField>
                      <FormField label="Tagline">
                        <input className="form-control" value={settingsForm.companyTagline || ''} onChange={e => setSettingsForm(p => ({ ...p, companyTagline: e.target.value }))} />
                      </FormField>
                    </div>
                    <FormField label="Company Logo URL">
                      <input className="form-control" value={settingsForm.companyLogo || ''} onChange={e => setSettingsForm(p => ({ ...p, companyLogo: e.target.value }))} placeholder="https://..." />
                    </FormField>
                    <FormField label="About Text">
                      <textarea className="form-control" rows={4} value={settingsForm.aboutText || ''} onChange={e => setSettingsForm(p => ({ ...p, aboutText: e.target.value }))} style={{ resize: 'vertical' }} />
                    </FormField>
                  </SettingsSection>

                  <SettingsSection title="Contact Details" icon={<Phone size={18} />}>
                    <div className="grid-2">
                      <FormField label="Email">
                        <input className="form-control" type="email" value={settingsForm.contactEmail || ''} onChange={e => setSettingsForm(p => ({ ...p, contactEmail: e.target.value }))} />
                      </FormField>
                      <FormField label="Phone">
                        <input className="form-control" value={settingsForm.contactPhone || ''} onChange={e => setSettingsForm(p => ({ ...p, contactPhone: e.target.value }))} />
                      </FormField>
                      <FormField label="WhatsApp Number (digits only)">
                        <input className="form-control" value={settingsForm.contactWhatsApp || ''} onChange={e => setSettingsForm(p => ({ ...p, contactWhatsApp: e.target.value }))} placeholder="94771234567" />
                      </FormField>
                      <FormField label="Address">
                        <input className="form-control" value={settingsForm.contactAddress || ''} onChange={e => setSettingsForm(p => ({ ...p, contactAddress: e.target.value }))} />
                      </FormField>
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Social Media Links" icon={<LinkIcon size={18} />}>
                    <div className="grid-2">
                      {[
                        { key: 'socialFacebook', label: 'Facebook URL' },
                        { key: 'socialInstagram', label: 'Instagram URL' },
                        { key: 'socialTwitter', label: 'Twitter / X URL' },
                        { key: 'socialYoutube', label: 'YouTube URL' },
                        { key: 'socialTripAdvisor', label: 'TripAdvisor URL' },
                      ].map(({ key, label }) => (
                        <FormField key={key} label={label}>
                          <input className="form-control" value={settingsForm[key] || ''} onChange={e => setSettingsForm(p => ({ ...p, [key]: e.target.value }))} placeholder="https://..." />
                        </FormField>
                      ))}
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Announcement Banner" icon={<AlertCircle size={18} />}>
                    <FormField label="">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={settingsForm.announcementEnabled || false} onChange={e => setSettingsForm(p => ({ ...p, announcementEnabled: e.target.checked }))} style={{ width: '18px', height: '18px', accentColor: 'hsl(var(--primary))' }} />
                        <span style={{ fontWeight: '700', color: '#475569' }}>Enable announcement banner on site</span>
                      </label>
                    </FormField>
                    <FormField label="Banner Text">
                      <input className="form-control" value={settingsForm.announcementText || ''} onChange={e => setSettingsForm(p => ({ ...p, announcementText: e.target.value }))} placeholder="e.g. 🎉 Special 20% discount on all packages this month!" />
                    </FormField>
                    <FormField label="Banner Link (optional)">
                      <input className="form-control" value={settingsForm.announcementLink || ''} onChange={e => setSettingsForm(p => ({ ...p, announcementLink: e.target.value }))} placeholder="https://..." />
                    </FormField>
                  </SettingsSection>

                  <SettingsSection title="SEO Defaults" icon={<Search size={18} />}>
                    <FormField label="Default SEO Title">
                      <input className="form-control" value={settingsForm.seoTitle || ''} onChange={e => setSettingsForm(p => ({ ...p, seoTitle: e.target.value }))} />
                    </FormField>
                    <FormField label="Default SEO Description">
                      <textarea className="form-control" rows={3} value={settingsForm.seoDescription || ''} onChange={e => setSettingsForm(p => ({ ...p, seoDescription: e.target.value }))} style={{ resize: 'vertical' }} />
                    </FormField>
                    <FormField label="Footer Text">
                      <input className="form-control" value={settingsForm.footerText || ''} onChange={e => setSettingsForm(p => ({ ...p, footerText: e.target.value }))} />
                    </FormField>
                  </SettingsSection>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    {settingsSaved && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: '700' }}>
                        <CheckCircle2 size={18} /> Settings saved!
                      </motion.span>
                    )}
                    <button type="submit" disabled={isSavingSettings} className="btn btn-primary" style={{ gap: '0.75rem', minWidth: '180px' }}>
                      {isSavingSettings ? 'Saving...' : <><Save size={18} /> Save All Settings</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* ── Package Modal ── */}
      <AnimatePresence>
        {isPkgModalOpen && (
          <Modal onClose={() => setIsPkgModalOpen(false)} title={currentPackage ? 'Edit Tour Package' : 'Create New Package'}>
            <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-2">
                <FormField label="Package Title"><input required className="form-control" value={pkgForm.title} onChange={e => setPkgForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Cultural Triangle Experience" /></FormField>
                <FormField label="Category">
                  <select className="form-control" value={pkgForm.category} onChange={e => setPkgForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="Inbound">Inbound (Sri Lanka)</option>
                    <option value="Outbound">Outbound (International)</option>
                  </select>
                </FormField>
              </div>
              <div className="grid-2">
                <FormField label="Price (USD)"><input required type="number" className="form-control" value={pkgForm.price} onChange={e => setPkgForm(p => ({ ...p, price: Number(e.target.value) }))} /></FormField>
                <FormField label="Duration"><input required className="form-control" value={pkgForm.duration} onChange={e => setPkgForm(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 8 Days" /></FormField>
              </div>
              <div className="grid-2">
                <FormField label="Type">
                  <select className="form-control" value={pkgForm.type} onChange={e => setPkgForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="Day">Day Trip</option>
                    <option value="Round">Round Trip</option>
                  </select>
                </FormField>
                <FormField label="Options">
                  <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '700', color: '#475569' }}>
                      <input type="checkbox" checked={pkgForm.featured} onChange={e => setPkgForm(p => ({ ...p, featured: e.target.checked }))} style={{ accentColor: 'hsl(var(--primary))' }} /> Featured
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '700', color: '#475569' }}>
                      <input type="checkbox" checked={pkgForm.isLimitedTime} onChange={e => setPkgForm(p => ({ ...p, isLimitedTime: e.target.checked }))} style={{ accentColor: 'hsl(var(--primary))' }} /> Limited Time
                    </label>
                  </div>
                </FormField>
              </div>
              {pkgForm.isLimitedTime && (
                <FormField label="Discount %">
                  <input type="number" min={0} max={100} className="form-control" value={pkgForm.discountPercentage} onChange={e => setPkgForm(p => ({ ...p, discountPercentage: Number(e.target.value) }))} />
                </FormField>
              )}
              <FormField label="Cover image">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                    <input id="pkg-cover-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handlePkgCoverFile} disabled={isUploadingCover} />
                    <label htmlFor="pkg-cover-file" className="btn" style={{ cursor: isUploadingCover ? 'wait' : 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', color: '#475569' }}>
                      <Image size={18} /> {isUploadingCover ? 'Uploading…' : 'Choose file'}
                    </label>
                  </div>
                  {pkgForm.image && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <img src={mediaUrl(pkgForm.image)} alt="" style={{ width: '120px', height: '72px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                      <button type="button" className="btn" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', background: '#fef2f2', color: '#b91c1c' }} onClick={() => setPkgForm(p => ({ ...p, image: '' }))}>Remove</button>
                    </div>
                  )}
                </div>
              </FormField>
              <FormField label="Description">
                <textarea required className="form-control" rows={3} style={{ resize: 'vertical' }} value={pkgForm.description} onChange={e => setPkgForm(p => ({ ...p, description: e.target.value }))} />
              </FormField>
              <FormField label="Highlights (one per line)">
                <textarea className="form-control" rows={3} style={{ resize: 'vertical' }} value={(pkgForm.highlights || []).join('\n')} onChange={e => setPkgForm(p => ({ ...p, highlights: e.target.value.split('\n').filter(Boolean) }))} placeholder="Temple of the Tooth Relic&#10;Elephant Safari&#10;Tea Plantation Visit" />
              </FormField>
              <div className="grid-2">
                <FormField label="Inclusions (one per line)">
                  <textarea className="form-control" rows={4} style={{ resize: 'vertical' }} value={(pkgForm.inclusions || []).join('\n')} onChange={e => setPkgForm(p => ({ ...p, inclusions: e.target.value.split('\n').filter(Boolean) }))} placeholder="Airport transfers&#10;Accommodation&#10;Daily breakfast" />
                </FormField>
                <FormField label="Exclusions (one per line)">
                  <textarea className="form-control" rows={4} style={{ resize: 'vertical' }} value={(pkgForm.exclusions || []).join('\n')} onChange={e => setPkgForm(p => ({ ...p, exclusions: e.target.value.split('\n').filter(Boolean) }))} placeholder="International flights&#10;Visa fees&#10;Travel insurance" />
                </FormField>
              </div>
              <FormField label="SEO Title (optional)">
                <input className="form-control" value={pkgForm.seoTitle} onChange={e => setPkgForm(p => ({ ...p, seoTitle: e.target.value }))} />
              </FormField>
              <FormField label="SEO Description (optional)">
                <textarea className="form-control" rows={2} style={{ resize: 'vertical' }} value={pkgForm.seoDescription} onChange={e => setPkgForm(p => ({ ...p, seoDescription: e.target.value }))} />
              </FormField>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsPkgModalOpen(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
                <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ flex: 1, gap: '0.75rem' }}>
                  {isSaving ? 'Saving...' : <><Save size={18} /> {currentPackage ? 'Update' : 'Create'} Package</>}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Blog Modal ── */}
      <AnimatePresence>
        {isBlogModalOpen && (
          <Modal onClose={() => setIsBlogModalOpen(false)} title={currentBlog ? 'Edit Blog Post' : 'New Blog Post'} wide>
            <form onSubmit={handleSaveBlog} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <FormField label="Post Title">
                <input required className="form-control" value={blogForm.title} onChange={e => {
                  const title = e.target.value;
                  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
                  setBlogForm(p => ({ ...p, title, slug }));
                }} placeholder="e.g. Top 10 Things to Do in Kandy" />
              </FormField>
              <div className="grid-2">
                <FormField label="URL Slug">
                  <input className="form-control" value={blogForm.slug} onChange={e => setBlogForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated from title" />
                </FormField>
                <FormField label="Category">
                  <input className="form-control" list="blog-categories" value={blogForm.category} onChange={e => setBlogForm(p => ({ ...p, category: e.target.value }))} />
                  <datalist id="blog-categories">
                    {['Travel Tips', 'Destinations', 'Culture', 'Food & Cuisine', 'Adventure', 'News', 'Guides'].map(c => <option key={c} value={c} />)}
                  </datalist>
                </FormField>
              </div>
              <div className="grid-2">
                <FormField label="Author">
                  <input className="form-control" value={blogForm.author} onChange={e => setBlogForm(p => ({ ...p, author: e.target.value }))} />
                </FormField>
                <FormField label="Read Time">
                  <input className="form-control" value={blogForm.readTime} onChange={e => setBlogForm(p => ({ ...p, readTime: e.target.value }))} placeholder="e.g. 5 min read" />
                </FormField>
              </div>
              <FormField label="Cover Image URL">
                <input className="form-control" value={blogForm.coverImage} onChange={e => setBlogForm(p => ({ ...p, coverImage: e.target.value }))} placeholder="https://..." />
              </FormField>
              <FormField label="Excerpt (short summary)">
                <textarea required className="form-control" rows={2} style={{ resize: 'vertical' }} value={blogForm.excerpt} onChange={e => setBlogForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="A short engaging summary of this article..." />
              </FormField>
              <FormField label="Content (HTML supported)">
                <textarea required className="form-control" rows={12} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.9rem' }} value={blogForm.content} onChange={e => setBlogForm(p => ({ ...p, content: e.target.value }))} placeholder="<h2>Introduction</h2><p>Your content here...</p>" />
              </FormField>
              <FormField label="Tags (comma separated)">
                <input className="form-control" value={(blogForm.tags || []).join(', ')} onChange={e => setBlogForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} placeholder="sri lanka, culture, travel" />
              </FormField>
              <FormField label="Status">
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['draft', 'published'].map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '700', color: blogForm.status === s ? 'hsl(var(--primary))' : '#475569' }}>
                      <input type="radio" name="status" value={s} checked={blogForm.status === s} onChange={e => setBlogForm(p => ({ ...p, status: e.target.value }))} style={{ accentColor: 'hsl(var(--primary))' }} />
                      {s === 'published' ? '✓ Publish' : '◦ Save as Draft'}
                    </label>
                  ))}
                </div>
              </FormField>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsBlogModalOpen(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
                <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ flex: 1, gap: '0.75rem' }}>
                  {isSaving ? 'Saving...' : <><Save size={18} /> {currentBlog ? 'Update' : 'Publish'} Post</>}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helper Sub-Components ────────────────────────────────────────────────────

function NavItem({ active, onClick, icon, label, badge }) {
  return (
    <button className={`admin-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {badge > 0 && (
        <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: '900' }}>
          {badge}
        </span>
      )}
      {active && !badge && (
        <motion.div layoutId="activeTab" style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
      )}
    </button>
  );
}

function StatCard({ label, value, icon, trend, className }) {
  return (
    <div className={`admin-card ${className}`} style={{ color: 'white', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, transform: 'rotate(-15deg)' }}>
        {React.cloneElement(icon, { size: 120 })}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          {trend && <div style={{ fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.6rem', borderRadius: '1rem' }}>{trend}</div>}
        </div>
        <p style={{ fontSize: '0.85rem', fontWeight: '600', opacity: 0.8, marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: '900' }}>{value}</p>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '0', overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.75rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: open ? '1px solid #f1f5f9' : 'none' }}>
        <span style={{ color: 'hsl(var(--primary))' }}>{icon}</span>
        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>{title}</span>
        <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="form-group">
      {label && <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>{label}</label>}
      {children}
    </div>
  );
}

function Modal({ onClose, title, children, wide }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="admin-card"
        style={{ width: '100%', maxWidth: wide ? '900px' : '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', cursor: 'pointer', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          <X size={18} />
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '2rem', color: '#0f172a' }}>{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
}
