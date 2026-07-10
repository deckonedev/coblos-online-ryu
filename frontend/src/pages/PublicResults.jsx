import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Zap, Activity, PieChart as PieIcon, RefreshCcw, ArrowLeft, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ServerOffline from '../components/ServerOffline';
import PageLoader from '../components/PageLoader';
const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function PublicResults() {
  const [stats, setStats] = useState({ candidates: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverOffline, setServerOffline] = useState(false);

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed fetching public stats:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 600);
    }
  };

  useEffect(() => {
    document.title = "Live Hasil Pemilihan | Coblos Online";
    axios.get(`${API_BASE_URL}/stats`)
      .then(() => { setServerOffline(false); fetchData(); })
      .catch(() => setServerOffline(true))
      .finally(() => setLoading(false));
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <PageLoader />;
  if (serverOffline) return <ServerOffline />;

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 22;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#f8fafc"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '11px', fontWeight: 'bold' }}
      >
        {`${name}: ${value} Suara (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

  const sortedCandidates = [...(stats.candidates || [])].sort((a, b) => b.votes - a.votes);
  const leading = sortedCandidates[0];
  const second = sortedCandidates[1];
  const gap = (leading && second) ? leading.votes - second.votes : 0;
  const isDraw = leading && second && leading.votes === second.votes;

  const chartData = (stats.candidates || []).map(c => ({
    name: (c.name || 'Unknown').split(':')[0],
    votes: c.votes || 0
  }));

  const totalUsed = stats.summary?.used_tokens || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Top Navigation */}
      <header className="h-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-12">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <TrendingUp size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight">Live <span className="text-primary-500">Quick Count</span></h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Hasil Real-Time Pemilihan OSIS</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Update</span>
          </div>

          <button
            onClick={() => fetchData(true)}
            title="Refresh Hasil"
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCcw size={18} className={refreshing ? 'animate-spin text-primary-400' : ''} />
          </button>

          <Link
            to="/"
            className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Halaman Depan</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-sm">Memuat Hasil Pemilihan...</p>
          </div>
        ) : (
          <>
            {/* Kandidat Unggul Banner */}
            <div className="glass p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent border border-primary-500/20 relative overflow-hidden shadow-2xl">
              <Zap className="absolute -right-8 -top-8 w-40 h-40 text-primary-500/5 rotate-12 pointer-events-none" />
              <div className="flex items-center space-x-4 mb-6 relative z-10">
                <div className="p-3.5 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/30">
                  <Trophy className="text-white" size={26} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">Kandidat Unggul Sementara</h3>
                  <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                    {leading ? leading.name : 'Belum Ada Suara'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status Persaingan</p>
                  <p className={`text-lg sm:text-xl font-black ${isDraw ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isDraw ? 'POSISI SERI (DRAW)' : 'UNGGUL SEMENTARA'}
                  </p>
                </div>

                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Selisih Suara</p>
                  <div className="flex items-end space-x-2">
                    <p className="text-2xl sm:text-3xl font-black text-primary-400">{gap}</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-400 mb-1.5 uppercase">Suara</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Grid: Pie Chart & Progress Rangkuman */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Pie Chart Card */}
              <div className="glass p-6 sm:p-8 rounded-[32px] flex flex-col h-[400px] border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">Distribusi Suara</h3>
                  <PieIcon className="text-slate-500" size={18} />
                </div>
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="votes"
                        label={renderCustomLabel}
                        labelLine={{ stroke: '#64748b', strokeWidth: 1.5 }}
                      >
                        {chartData.map((e, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Rangkuman Suara Card */}
              <div className="glass p-6 sm:p-8 rounded-[32px] flex flex-col justify-between space-y-6 border border-white/5">
                <div className="space-y-5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">Rangkuman Suara</h3>
                  <div className="space-y-4">
                    {sortedCandidates.map((c, i) => {
                      const pct = ((c.votes / totalUsed) * 100).toFixed(1);
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs sm:text-sm font-bold">
                            <span className="text-slate-200">{c.name}</span>
                            <span className="text-primary-400">{c.votes} Suara ({pct}%)</span>
                          </div>
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full bg-primary-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center space-x-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl shrink-0">
                    <Activity className="text-amber-500" size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-amber-500/70 uppercase">Suara Belum Masuk (Potensi)</p>
                    <p className="text-xl sm:text-2xl font-black text-amber-500">{stats.summary?.unused_tokens || 0} Pemilih Lagi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="glass p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Suara Masuk</p>
                  <p className="text-lg font-black text-white">{stats.summary?.used_tokens || 0}</p>
                </div>
              </div>

              <div className="glass p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
                <div className="p-3 bg-primary-500/10 text-primary-400 rounded-xl">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Total Pemilih</p>
                  <p className="text-lg font-black text-white">{stats.summary?.total_tokens || 0}</p>
                </div>
              </div>

              <div className="glass p-5 rounded-2xl border border-white/5 flex items-center space-x-4 col-span-2 sm:col-span-1">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Partisipasi</p>
                  <p className="text-lg font-black text-white">{stats.summary?.participation_rate || 0}%</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-white/5 mt-auto">
        &copy; {new Date().getFullYear()} Coblos Online &bull; E-Voting System &bull; Live Quick Count
      </footer>
    </div>
  );
}
