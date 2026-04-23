import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import API_URL from '../config';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.toLowerCase().includes('application/json');
      const data = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        const message =
          isJson
            ? (data?.message || 'Invalid credentials')
            : 'Server returned HTML instead of JSON. Check that /api routes are not being redirected to the frontend.';
        throw new Error(message);
      }

      // Store the JWT token
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_session', 'active');
      onLogin(data.token);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-login"
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'hsl(var(--primary))',
            borderRadius: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'white',
            boxShadow: '0 10px 20px -5px hsla(var(--primary) / 0.4)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>
            Portal Access
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Serendib Travel Business Management
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="••••••••"
                style={{ paddingLeft: '3rem', background: 'white' }}
                required
                autoFocus
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: '#ef4444', fontSize: '0.85rem', marginBottom: '1.5rem',
                background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                fontWeight: '600'
              }}
            >
              <AlertTriangle size={16} /> {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', gap: '0.75rem' }}
          >
            {isLoading ? 'Authenticating...' : (
              <>
                Unlock Dashboard <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Default password set in backend <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', color: '#475569' }}>.env</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
