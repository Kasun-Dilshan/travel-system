import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Image, MapPin, Globe, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import API_URL, { mediaUrl } from '../config';
import { OUTBOUND_CONTINENTS, mergeContinentsWithFallback } from '../data/outbound-regions';

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
  if (token) body.append('admin_token', token);
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}`, 'X-Admin-Token': token } : {},
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Upload failed: ${res.status}`);
  }
  return res.json();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function FormField({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="admin-card"
        style={{ width: wide ? 'min(820px, 100%)' : 'min(640px, 100%)', maxHeight: '90vh', overflow: 'auto', padding: '1.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>{title}</h3>
          <button type="button" className="btn" onClick={onClose} style={{ background: '#f1f5f9', color: '#64748b', padding: '0.4rem 0.75rem' }}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const emptyRegion = { id: '', name: '', description: '', image: '', sortOrder: 0 };
const emptyCountry = {
  id: '',
  regionId: '',
  name: '',
  description: '',
  fullDescription: '',
  image: '',
  matchKeys: '',
  sortOrder: 0,
};

const emptyHighlight = { id: '', name: '', description: '', image: '' };

function normalizeHighlightImage(image) {
  if (typeof image === 'string') return image;
  if (image && typeof image === 'object' && typeof image.src === 'string') return image.src;
  return '';
}

function normalizeHighlights(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item, index) => ({
    id: String(item?.id || slugify(item?.name) || `highlight-${index + 1}`),
    name: String(item?.name || '').trim(),
    description: String(item?.description || '').trim(),
    image: normalizeHighlightImage(item?.image),
  })).filter((item) => item.name);
}

/**
 * Admin Destinations tab: add/edit regions and countries.
 */
export default function AdminDestinationsTab({ continents, onContinentsChange }) {
  const [localContinents, setLocalContinents] = useState(continents || []);
  const [selectedRegionId, setSelectedRegionId] = useState(continents?.[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [regionForm, setRegionForm] = useState(emptyRegion);

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [countryForm, setCountryForm] = useState(emptyCountry);

  const [isHighlightsModalOpen, setIsHighlightsModalOpen] = useState(false);
  const [highlightsCountry, setHighlightsCountry] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [editingHighlightIndex, setEditingHighlightIndex] = useState(null);
  const [highlightForm, setHighlightForm] = useState(emptyHighlight);

  useEffect(() => {
    setLocalContinents(continents || []);
    if (!selectedRegionId && continents?.[0]?.id) {
      setSelectedRegionId(continents[0].id);
    } else if (selectedRegionId && continents?.length && !continents.some((c) => c.id === selectedRegionId)) {
      setSelectedRegionId(continents[0]?.id || '');
    }
  }, [continents, selectedRegionId]);

  const refresh = useCallback(async () => {
    const data = await apiFetch(`${API_URL}/destinations`);
    const merged = mergeContinentsWithFallback(data, OUTBOUND_CONTINENTS);
    setLocalContinents(merged);
    onContinentsChange?.(merged);
    return merged;
  }, [onContinentsChange]);

  const selectedRegion = localContinents.find((c) => c.id === selectedRegionId) || localContinents[0] || null;
  const countries = selectedRegion?.countries || [];

  const openRegionModal = (region = null) => {
    setEditingRegion(region);
    setRegionForm(
      region
        ? {
            id: region.id,
            name: region.name || '',
            description: region.description || '',
            image: region.image || '',
            sortOrder: region.sortOrder ?? 0,
          }
        : { ...emptyRegion }
    );
    setError('');
    setIsRegionModalOpen(true);
  };

  const openCountryModal = (country = null) => {
    const regionId = country?.regionId || selectedRegion?.id || '';
    setEditingCountry(country);
    setCountryForm(
      country
        ? {
            id: country.id,
            regionId,
            name: country.name || '',
            description: country.description || '',
            fullDescription: country.fullDescription || '',
            image: country.image || '',
            matchKeys: Array.isArray(country.matchKeys) ? country.matchKeys.join(', ') : '',
            sortOrder: country.sortOrder ?? 0,
          }
        : { ...emptyCountry, regionId }
    );
    setError('');
    setIsCountryModalOpen(true);
  };

  const openHighlightsModal = (country) => {
    if (!country) return;
    setHighlightsCountry(country);
    setHighlights(normalizeHighlights(country.highlights));
    setEditingHighlightIndex(null);
    setHighlightForm({ ...emptyHighlight });
    setError('');
    setIsHighlightsModalOpen(true);
  };

  const resetHighlightEditor = () => {
    setEditingHighlightIndex(null);
    setHighlightForm({ ...emptyHighlight });
  };

  const startEditHighlight = (index) => {
    const item = highlights[index];
    if (!item) return;
    setEditingHighlightIndex(index);
    setHighlightForm({
      id: item.id || '',
      name: item.name || '',
      description: item.description || '',
      image: item.image || '',
    });
  };

  const upsertHighlight = (e) => {
    e.preventDefault();
    const name = highlightForm.name.trim();
    if (!name) {
      setError('Highlight name is required');
      return;
    }
    const id = slugify(highlightForm.id || name);
    const nextItem = {
      id: id || `highlight-${Date.now()}`,
      name,
      description: highlightForm.description.trim(),
      image: highlightForm.image.trim(),
    };

    setHighlights((prev) => {
      const copy = [...prev];
      if (editingHighlightIndex !== null && editingHighlightIndex >= 0) {
        copy[editingHighlightIndex] = nextItem;
      } else {
        // Avoid duplicate ids when adding
        if (copy.some((h, i) => h.id === nextItem.id && i !== editingHighlightIndex)) {
          nextItem.id = `${nextItem.id}-${copy.length + 1}`;
        }
        copy.push(nextItem);
      }
      return copy;
    });
    setError('');
    resetHighlightEditor();
  };

  const removeHighlight = (index) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
    if (editingHighlightIndex === index) resetHighlightEditor();
    else if (editingHighlightIndex !== null && editingHighlightIndex > index) {
      setEditingHighlightIndex(editingHighlightIndex - 1);
    }
  };

  const moveHighlight = (index, direction) => {
    setHighlights((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[index];
      copy[index] = copy[target];
      copy[target] = tmp;
      return copy;
    });
    if (editingHighlightIndex === index) setEditingHighlightIndex(index + direction);
    else if (editingHighlightIndex === index + direction) setEditingHighlightIndex(index);
  };

  const saveHighlights = async () => {
    if (!highlightsCountry) return;
    setIsSaving(true);
    setError('');
    try {
      const cleaned = normalizeHighlights(highlights);
      await apiFetch(
        `${API_URL}/destinations?entity=country&id=${encodeURIComponent(highlightsCountry.id)}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            id: highlightsCountry.id,
            regionId: highlightsCountry.regionId || selectedRegion?.id,
            name: highlightsCountry.name,
            description: highlightsCountry.description || '',
            fullDescription: highlightsCountry.fullDescription || '',
            image: normalizeHighlightImage(highlightsCountry.image),
            images: highlightsCountry.images || [],
            matchKeys: highlightsCountry.matchKeys || [],
            facts: highlightsCountry.facts || [],
            tips: highlightsCountry.tips || [],
            highlights: cleaned,
            sortOrder: highlightsCountry.sortOrder ?? 0,
            localizations: highlightsCountry.localizations || {},
          }),
        }
      );
      await refresh();
      setIsHighlightsModalOpen(false);
      setHighlightsCountry(null);
    } catch (err) {
      setError(err.message || 'Failed to save highlights');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file, applyUrl) => {
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      const uploaded = await uploadAdminImage(file);
      const url = uploaded.path || uploaded.url || uploaded.image || '';
      if (!url) throw new Error('Upload succeeded but no image URL returned');
      applyUrl(url);
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const saveRegion = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const id = editingRegion ? editingRegion.id : slugify(regionForm.id || regionForm.name);
      if (!regionForm.name.trim()) throw new Error('Region name is required');
      if (!id) throw new Error('Region id is required');

      const payload = {
        id,
        name: regionForm.name.trim(),
        description: regionForm.description.trim(),
        image: regionForm.image.trim(),
        sortOrder: Number(regionForm.sortOrder) || 0,
      };

      const url = editingRegion
        ? `${API_URL}/destinations?entity=region&id=${encodeURIComponent(editingRegion.id)}`
        : `${API_URL}/destinations?entity=region`;
      await apiFetch(url, {
        method: editingRegion ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      const next = await refresh();
      setSelectedRegionId(id);
      if (!next.some((c) => c.id === id) && next[0]) setSelectedRegionId(next[0].id);
      setIsRegionModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save region');
    } finally {
      setIsSaving(false);
    }
  };

  const saveCountry = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const id = editingCountry ? editingCountry.id : slugify(countryForm.id || countryForm.name);
      if (!countryForm.name.trim()) throw new Error('Country name is required');
      if (!countryForm.regionId) throw new Error('Please select a region');
      if (!id) throw new Error('Country id is required');

      const payload = {
        id,
        regionId: countryForm.regionId,
        name: countryForm.name.trim(),
        description: countryForm.description.trim(),
        fullDescription: countryForm.fullDescription.trim(),
        image: countryForm.image.trim(),
        images: countryForm.image.trim() ? [countryForm.image.trim()] : [],
        matchKeys: countryForm.matchKeys,
        sortOrder: Number(countryForm.sortOrder) || 0,
      };

      const url = editingCountry
        ? `${API_URL}/destinations?entity=country&id=${encodeURIComponent(editingCountry.id)}`
        : `${API_URL}/destinations?entity=country`;
      await apiFetch(url, {
        method: editingCountry ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      await refresh();
      setSelectedRegionId(countryForm.regionId);
      setIsCountryModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save country');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRegion = async (region) => {
    if (!region) return;
    if (!window.confirm(`Delete region “${region.name}” and all its countries?`)) return;
    setError('');
    try {
      await apiFetch(`${API_URL}/destinations?entity=region&id=${encodeURIComponent(region.id)}`, {
        method: 'DELETE',
      });
      const next = await refresh();
      setSelectedRegionId(next[0]?.id || '');
    } catch (err) {
      setError(err.message || 'Failed to delete region');
    }
  };

  const deleteCountry = async (country) => {
    if (!country) return;
    if (!window.confirm(`Delete country “${country.name}”?`)) return;
    setError('');
    try {
      await apiFetch(`${API_URL}/destinations?entity=country&id=${encodeURIComponent(country.id)}`, {
        method: 'DELETE',
      });
      await refresh();
    } catch (err) {
      setError(err.message || 'Failed to delete country');
    }
  };

  return (
    <motion.div key="destinations" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p style={{ color: '#64748b', margin: 0 }}>
            {localContinents.length} regions · {localContinents.reduce((n, r) => n + (r.countries?.length || 0), 0)} countries
          </p>
          <p style={{ color: '#94a3b8', margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
            Manage regions, countries, and country highlights shown on the Destinations pages.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => openRegionModal()} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Plus size={18} /> Add Region
          </button>
          <button
            type="button"
            onClick={() => openCountryModal()}
            className="btn"
            style={{ gap: '0.5rem', background: '#ecfdf5', color: '#047857' }}
            disabled={!localContinents.length}
          >
            <Plus size={18} /> Add Country
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', background: '#fef2f2', color: '#b91c1c', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '1.25rem' }}>
        <div className="admin-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#64748b', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.08em' }}>
            <Globe size={14} /> REGIONS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {localContinents.map((region) => {
              const active = region.id === selectedRegion?.id;
              return (
                <div
                  key={region.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    borderRadius: '0.65rem',
                    background: active ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                    padding: '0.2rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      padding: '0.65rem 0.75rem',
                      cursor: 'pointer',
                      fontWeight: 800,
                      color: active ? 'hsl(var(--primary))' : '#0f172a',
                      fontFamily: 'inherit',
                    }}
                  >
                    {region.name}
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', marginTop: '0.15rem' }}>
                      {region.countries?.length || 0} countries · /{region.id}
                    </div>
                  </button>
                  <button type="button" className="btn" style={{ padding: '0.4rem', background: '#f1f5f9', color: '#64748b' }} onClick={() => openRegionModal(region)}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="btn" style={{ padding: '0.4rem', background: '#fef2f2', color: '#ef4444' }} onClick={() => deleteRegion(region)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            {!localContinents.length && (
              <p style={{ color: '#94a3b8', padding: '1rem 0.5rem', margin: 0 }}>No regions yet. Add your first region.</p>
            )}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.08em' }}>
              <MapPin size={14} /> COUNTRIES{selectedRegion ? ` · ${selectedRegion.name.toUpperCase()}` : ''}
            </div>
            <button
              type="button"
              className="btn"
              style={{ gap: '0.4rem', background: '#f1f5f9', color: '#475569', padding: '0.45rem 0.75rem' }}
              onClick={() => openCountryModal()}
              disabled={!selectedRegion}
            >
              <Plus size={16} /> Add in this region
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {countries.map((country) => (
              <div key={country.id} style={{ border: '1px solid #e2e8f0', borderRadius: '0.85rem', overflow: 'hidden' }}>
                <div style={{ height: '120px', background: '#f8fafc' }}>
                  {country.image ? (
                    <img src={mediaUrl(country.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#cbd5e1' }}>
                      <Image size={28} />
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.9rem' }}>
                  <div style={{ fontWeight: 900, color: '#0f172a' }}>{country.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    /{country.id} · {Array.isArray(country.highlights) ? country.highlights.length : 0} highlights
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.55rem 0 0.85rem', minHeight: '2.4em' }}>
                    {country.description || 'No short description yet.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button type="button" className="btn" style={{ padding: '0.45rem', background: '#f1f5f9', color: '#64748b' }} onClick={() => openCountryModal(country)} title="Edit country">
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '0.45rem 0.65rem', background: '#ecfdf5', color: '#047857', gap: '0.35rem', display: 'inline-flex', alignItems: 'center' }}
                      onClick={() => openHighlightsModal(country)}
                      title="Manage highlights"
                    >
                      <Sparkles size={15} /> Highlights
                    </button>
                    <button type="button" className="btn" style={{ padding: '0.45rem', background: '#fef2f2', color: '#ef4444' }} onClick={() => deleteCountry(country)} title="Delete country">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {selectedRegion && countries.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                No countries in this region yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {isRegionModalOpen && (
        <Modal title={editingRegion ? 'Edit Region' : 'Add Region'} onClose={() => setIsRegionModalOpen(false)}>
          <form onSubmit={saveRegion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!editingRegion && (
              <FormField label="URL id (slug)">
                <input
                  className="form-control"
                  value={regionForm.id}
                  onChange={(e) => setRegionForm((p) => ({ ...p, id: slugify(e.target.value) }))}
                  placeholder="e.g. asia (auto from name if blank)"
                />
              </FormField>
            )}
            <FormField label="Name">
              <input
                required
                className="form-control"
                value={regionForm.name}
                onChange={(e) => setRegionForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Asia"
              />
            </FormField>
            <FormField label="Description">
              <textarea
                className="form-control"
                rows={3}
                value={regionForm.description}
                onChange={(e) => setRegionForm((p) => ({ ...p, description: e.target.value }))}
              />
            </FormField>
            <FormField label="Cover image">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    id="region-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(e.target.files?.[0], (url) => setRegionForm((p) => ({ ...p, image: url })))}
                    disabled={isUploading}
                  />
                  <label htmlFor="region-image-file" className="btn" style={{ margin: 0, background: '#f1f5f9', color: '#475569', cursor: isUploading ? 'wait' : 'pointer' }}>
                    <Image size={16} /> {isUploading ? 'Uploading…' : 'Upload image'}
                  </label>
                  <input
                    className="form-control"
                    style={{ flex: 1, minWidth: '180px' }}
                    value={regionForm.image}
                    onChange={(e) => setRegionForm((p) => ({ ...p, image: e.target.value }))}
                    placeholder="/uploads/..."
                  />
                </div>
                {regionForm.image && (
                  <img src={mediaUrl(regionForm.image)} alt="" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '0.65rem' }} />
                )}
              </div>
            </FormField>
            <FormField label="Sort order">
              <input
                type="number"
                className="form-control"
                value={regionForm.sortOrder}
                onChange={(e) => setRegionForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
              />
            </FormField>
            {error && <div style={{ color: '#b91c1c', fontWeight: 600 }}>{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving…' : editingRegion ? 'Save Region' : 'Create Region'}
            </button>
          </form>
        </Modal>
      )}

      {isCountryModalOpen && (
        <Modal title={editingCountry ? 'Edit Country' : 'Add Country'} onClose={() => setIsCountryModalOpen(false)}>
          <form onSubmit={saveCountry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Region">
              <select
                required
                className="form-control"
                value={countryForm.regionId}
                onChange={(e) => setCountryForm((p) => ({ ...p, regionId: e.target.value }))}
              >
                <option value="">Select region</option>
                {localContinents.map((region) => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </FormField>
            {!editingCountry && (
              <FormField label="URL id (slug)">
                <input
                  className="form-control"
                  value={countryForm.id}
                  onChange={(e) => setCountryForm((p) => ({ ...p, id: slugify(e.target.value) }))}
                  placeholder="e.g. japan (auto from name if blank)"
                />
              </FormField>
            )}
            <FormField label="Name">
              <input
                required
                className="form-control"
                value={countryForm.name}
                onChange={(e) => setCountryForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Japan"
              />
            </FormField>
            <FormField label="Short description">
              <input
                className="form-control"
                value={countryForm.description}
                onChange={(e) => setCountryForm((p) => ({ ...p, description: e.target.value }))}
              />
            </FormField>
            <FormField label="Full description">
              <textarea
                className="form-control"
                rows={4}
                value={countryForm.fullDescription}
                onChange={(e) => setCountryForm((p) => ({ ...p, fullDescription: e.target.value }))}
              />
            </FormField>
            <FormField label="Match keywords (comma-separated)">
              <input
                className="form-control"
                value={countryForm.matchKeys}
                onChange={(e) => setCountryForm((p) => ({ ...p, matchKeys: e.target.value }))}
                placeholder="japan, tokyo, osaka"
              />
            </FormField>
            <FormField label="Cover image">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    id="country-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(e.target.files?.[0], (url) => setCountryForm((p) => ({ ...p, image: url })))}
                    disabled={isUploading}
                  />
                  <label htmlFor="country-image-file" className="btn" style={{ margin: 0, background: '#f1f5f9', color: '#475569', cursor: isUploading ? 'wait' : 'pointer' }}>
                    <Image size={16} /> {isUploading ? 'Uploading…' : 'Upload image'}
                  </label>
                  <input
                    className="form-control"
                    style={{ flex: 1, minWidth: '180px' }}
                    value={countryForm.image}
                    onChange={(e) => setCountryForm((p) => ({ ...p, image: e.target.value }))}
                    placeholder="/uploads/..."
                  />
                </div>
                {countryForm.image && (
                  <img src={mediaUrl(countryForm.image)} alt="" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '0.65rem' }} />
                )}
              </div>
            </FormField>
            <FormField label="Sort order">
              <input
                type="number"
                className="form-control"
                value={countryForm.sortOrder}
                onChange={(e) => setCountryForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
              />
            </FormField>
            {error && <div style={{ color: '#b91c1c', fontWeight: 600 }}>{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving…' : editingCountry ? 'Save Country' : 'Create Country'}
            </button>
          </form>
        </Modal>
      )}

      {isHighlightsModalOpen && highlightsCountry && (
        <Modal
          wide
          title={`${highlightsCountry.name} Highlights`}
          onClose={() => {
            setIsHighlightsModalOpen(false);
            setHighlightsCountry(null);
            resetHighlightEditor();
          }}
        >
          <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.9rem' }}>
            These appear as tabs on the country page (name, image, and story), like Tokyo / Mount Fuji / Kyoto.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {highlights.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'stretch',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    background: editingHighlightIndex === index ? 'hsl(var(--primary) / 0.05)' : '#fff',
                  }}
                >
                  <div style={{ width: '88px', flexShrink: 0, background: '#f8fafc' }}>
                    {item.image ? (
                      <img src={mediaUrl(item.image)} alt="" style={{ width: '100%', height: '100%', minHeight: '72px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '100%', minHeight: '72px', display: 'grid', placeItems: 'center', color: '#cbd5e1' }}>
                        <Image size={20} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, padding: '0.65rem 0.35rem 0.65rem 0', minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.15rem' }}>/{item.id}</div>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description || 'No description yet.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.45rem', justifyContent: 'center' }}>
                    <button type="button" className="btn" style={{ padding: '0.3rem', background: '#f8fafc', color: '#64748b' }} onClick={() => moveHighlight(index, -1)} disabled={index === 0} title="Move up">
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" className="btn" style={{ padding: '0.3rem', background: '#f8fafc', color: '#64748b' }} onClick={() => moveHighlight(index, 1)} disabled={index === highlights.length - 1} title="Move down">
                      <ChevronDown size={14} />
                    </button>
                    <button type="button" className="btn" style={{ padding: '0.3rem', background: '#f1f5f9', color: '#64748b' }} onClick={() => startEditHighlight(index)} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button type="button" className="btn" style={{ padding: '0.3rem', background: '#fef2f2', color: '#ef4444' }} onClick={() => removeHighlight(index)} title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {!highlights.length && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '0.75rem' }}>
                  No highlights yet. Add Tokyo, Mount Fuji, and other places on the right.
                </div>
              )}
            </div>

            <form onSubmit={upsertHighlight} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '1rem', background: '#f8fafc', alignSelf: 'start' }}>
              <div style={{ fontWeight: 900, color: '#0f172a' }}>
                {editingHighlightIndex !== null ? 'Edit highlight' : 'Add highlight'}
              </div>
              <FormField label="Name (tab label)">
                <input
                  required
                  className="form-control"
                  value={highlightForm.name}
                  onChange={(e) => setHighlightForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Tokyo"
                />
              </FormField>
              <FormField label="Description">
                <textarea
                  className="form-control"
                  rows={5}
                  value={highlightForm.description}
                  onChange={(e) => setHighlightForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Story shown in the green panel…"
                />
              </FormField>
              <FormField label="Image">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      id="highlight-image-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e.target.files?.[0], (url) => setHighlightForm((p) => ({ ...p, image: url })))}
                      disabled={isUploading}
                    />
                    <label htmlFor="highlight-image-file" className="btn" style={{ margin: 0, background: '#fff', color: '#475569', cursor: isUploading ? 'wait' : 'pointer' }}>
                      <Image size={16} /> {isUploading ? 'Uploading…' : 'Upload'}
                    </label>
                    <input
                      className="form-control"
                      style={{ flex: 1, minWidth: '140px' }}
                      value={highlightForm.image}
                      onChange={(e) => setHighlightForm((p) => ({ ...p, image: e.target.value }))}
                      placeholder="/uploads/..."
                    />
                  </div>
                  {highlightForm.image && (
                    <img src={mediaUrl(highlightForm.image)} alt="" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '0.55rem' }} />
                  )}
                </div>
              </FormField>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary" style={{ gap: '0.35rem' }}>
                  <Plus size={16} />
                  {editingHighlightIndex !== null ? 'Update highlight' : 'Add to list'}
                </button>
                {editingHighlightIndex !== null && (
                  <button type="button" className="btn" style={{ background: '#e2e8f0', color: '#475569' }} onClick={resetHighlightEditor}>
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {error && <div style={{ color: '#b91c1c', fontWeight: 600, marginTop: '1rem' }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="btn"
              style={{ background: '#f1f5f9', color: '#64748b' }}
              onClick={() => {
                setIsHighlightsModalOpen(false);
                setHighlightsCountry(null);
                resetHighlightEditor();
              }}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-primary" disabled={isSaving} onClick={saveHighlights}>
              {isSaving ? 'Saving…' : 'Save Highlights'}
            </button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
