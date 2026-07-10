import React, { useState, useEffect } from 'react';
import { Mail, Lock, LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';
import ServerOffline from '../components/ServerOffline';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverOffline, setServerOffline] = useState(false);

  useEffect(() => {
    document.title = "Login Admin | Coblos Online";
    axios.get(`${API_BASE_URL}/candidates`).then(() => setServerOffline(false)).catch(() => setServerOffline(true));
  }, []);

  if (serverOffline) return <ServerOffline />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/login/admin`, { email, password });
      localStorage.setItem('admin_token', res.data.token);
      window.location.href = '/admin';
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
        <LayoutDashboard size={200} className="text-primary-500" />
      </div>
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass p-10 rounded-[40px] relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="text-slate-400 mt-2">Kelola jalannya pemilihan online.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="email" 
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <span>Masuk ke Dashboard</span>}
          </button>
        </form>

        {error && <p className="mt-6 text-center text-rose-500 text-sm font-medium">{error}</p>}
      </motion.div>
    </div>
  );
}
