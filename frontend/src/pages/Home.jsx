import React, { useState, useEffect } from 'react';
import { Vote as VoteIcon, Key, Fingerprint, ShieldCheck, CheckCircle2, AlertCircle, Loader2, LogOut } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

export default function Home() {
  const [token, setToken] = useState(localStorage.getItem('voter_token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('voter_token'));
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(localStorage.getItem('has_voted') === 'true');
  const [message, setMessage] = useState(null);
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    document.title = "TPS Online | Coblos Online";
    if (isLoggedIn) {
      fetchCandidates();
    }
  }, [isLoggedIn]);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/candidates`);
      setCandidates(res.data);
    } catch (err) { console.error(err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/login/voter`, { token });
      setIsRedirecting(true);
      setTimeout(() => {
        localStorage.setItem('voter_token', token);
        setIsLoggedIn(true);
        setIsRedirecting(false);
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Token tidak valid' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId) => {
    if (hasVoted) return;
    try {
      await axios.post(`${API_BASE_URL}/votes`, {
        candidate_id: candidateId,
        token: token
      });
      setHasVoted(true);
      setShowThankYou(true);
      
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          localStorage.clear();
          window.location.reload();
        }
      }, 1000);

    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengirim suara' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary-500/30">
            <Loader2 className="text-white animate-spin" size={32} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Verifikasi Berhasil!</h2>
          <p className="text-sm md:text-base text-slate-500">Anda akan dialihkan ke halaman pemilih...</p>
        </motion.div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 w-full max-w-sm md:max-w-md glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] border-emerald-100 bg-emerald-50/30">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 text-white">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900">Terima Kasih!</h2>
          <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">Anda telah berhasil menyampaikan hak pilih Anda secara sah.</p>
          <div className="py-3 px-6 bg-white rounded-2xl border border-emerald-100 inline-block">
             <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold">Log out otomatis dalam</p>
             <p className="text-3xl md:text-4xl font-black text-primary-500 mt-1">{countdown}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary-500/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white border border-slate-200 shadow-2xl p-6 md:p-8 rounded-[32px] relative z-10 text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30 text-white"><Fingerprint size={28} /></div>
          <h1 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">Verifikasi Pemilih</h1>
          <p className="text-slate-500 text-xs md:text-sm mb-8">Masukkan token akses unik Anda untuk mulai memilih.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Token Akses" value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-center font-mono font-bold text-lg tracking-widest text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-300" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary-500 hover:bg-primary-600 py-4 rounded-2xl font-bold text-lg text-white shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
              {loading ? <Loader2 className="animate-spin" /> : <span>Masuk ke TPS</span>}
            </button>
          </form>
          {message && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-xs md:text-sm font-medium text-rose-600">{message.text}</motion.div>}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col space-y-6 md:space-y-0 md:flex-row justify-between items-center mb-8 md:mb-12">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Halo, Pemilih!</h1>
            <p className="text-slate-500 text-sm md:text-base mt-1 md:mt-2">Pilih satu kandidat terbaik untuk masa depan.</p>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-6 bg-white p-2 md:p-3 pr-4 md:pr-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 md:space-x-4 border-r border-slate-100 pr-3 md:pr-6">
              <div className="p-2 md:p-3 bg-primary-500/10 rounded-xl"><ShieldCheck className="text-primary-600" size={20} /></div>
              <div className="text-left">
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Token Aktif</p>
                <p className="text-sm md:text-lg font-mono font-bold text-primary-600">{token}</p>
              </div>
            </div>
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="flex items-center space-x-2 text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all"
              title="Keluar"
            >
              <LogOut size={18} />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Keluar</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {candidates.map(candidate => (
            <motion.div key={candidate.id} whileHover={{ y: -5 }} className="bg-white border border-slate-200 shadow-sm rounded-[32px] overflow-hidden flex flex-col group">
              <div className="h-48 md:h-64 relative bg-slate-100 flex items-end justify-center overflow-hidden">
                <div className="flex -space-x-8 md:-space-x-12 mb-4 relative z-10 transition-transform group-hover:scale-105 duration-500">
                  <img src={candidate.image_ketua_url} alt="Ketua" className="w-32 h-40 md:w-40 md:h-48 object-cover rounded-2xl md:rounded-3xl shadow-2xl border-2 md:border-4 border-white rotate-[-5deg]" />
                  <img src={candidate.image_wakil_url} alt="Wakil" className="w-32 h-40 md:w-40 md:h-48 object-cover rounded-2xl md:rounded-3xl shadow-2xl border-2 md:border-4 border-white rotate-[5deg]" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                   <span className="px-3 md:px-4 py-1.5 md:py-2 bg-primary-500 rounded-full text-[10px] md:text-xs font-black text-white uppercase tracking-widest shadow-lg">Paslon {candidate.id}</span>
                </div>
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col text-center">
                <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-slate-900 group-hover:text-primary-600 transition-colors">{candidate.name}</h3>
                <div className="space-y-4 mb-6 md:mb-8 text-left border-t border-slate-50 pt-4 md:pt-6">
                  <div>
                    <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visi Kami</h4>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed italic">"{candidate.vision}"</p>
                  </div>
                  <div>
                    <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Misi Kami</h4>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-3">{candidate.mission}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleVote(candidate.id)} 
                  disabled={hasVoted} 
                  className="mt-auto w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20 active:scale-95"
                >
                   <VoteIcon size={18} />
                   <span className="text-sm md:text-base">Pilih Sekarang</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <footer className="mt-12 mb-6 text-center">
           <p className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-[0.3em]">Coblos Online &bull; Secure Voting System</p>
        </footer>
      </div>
    </div>
  );
}
