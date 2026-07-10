import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Key, 
  BarChart3, 
  Plus, 
  Trash2, 
  RefreshCcw,
  LayoutDashboard,
  LogOut,
  Printer,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  UserCheck,
  X,
  Upload,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileJson,
  Menu,
  Trophy,
  Activity,
  PieChart as PieIcon,
  Zap,
  Copy,
  Check,
  Edit2
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { API_BASE_URL, checkServerHealth } from '../config';
import ServerOffline from '../components/ServerOffline';
import PageLoader from '../components/PageLoader';
const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Overview');
  const [candidates, setCandidates] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState({ candidates: [], summary: {} });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tokenCount, setTokenCount] = useState(10);
  const [searchToken, setSearchToken] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [customTokenCount, setCustomTokenCount] = useState(10);
  const [customTokenLength, setCustomTokenLength] = useState(6);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(false);
  const [serverOffline, setServerOffline] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '', vision: '', mission: '', image_ketua: null, image_wakil: null
  });
  const [editingCandidate, setEditingCandidate] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'danger' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fileInputRef = useRef(null);
  const adminToken = localStorage.getItem('admin_token');

  useEffect(() => {
    document.title = "Admin Dashboard | Coblos Online";
    checkServerHealth().then((alive) => {
      setServerOffline(!alive);
      if (alive) fetchData();
      setInitialLoading(false);
    });
    const interval = setInterval(() => fetchData(false), 300000);
    return () => clearInterval(interval);
  }, [activeMenu]);

  if (initialLoading) return <PageLoader />;
  if (serverOffline) return <ServerOffline />;

  const fetchData = async (isManual = false) => {
    setRefreshing(true);
    try {
      const sRes = await axios.get(`${API_BASE_URL}/stats`);
      setStats(sRes.data);
      if (activeMenu === 'Candidates') {
        const cRes = await axios.get(`${API_BASE_URL}/candidates`);
        setCandidates(cRes.data);
      }
      if (activeMenu === 'Tokens' || activeMenu === 'Voters') {
        const tRes = await axios.get(`${API_BASE_URL}/tokens`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        setTokens(tRes.data);
      }
      if (isManual === true) {
        showToast('Data berhasil diperbarui!');
      }
    } catch (err) { console.error(err); }
    finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Token Berhasil Disalin!');
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newCandidate.name);
    formData.append('vision', newCandidate.vision);
    formData.append('mission', newCandidate.mission);
    if (newCandidate.image_ketua) formData.append('image_ketua', newCandidate.image_ketua);
    if (newCandidate.image_wakil) formData.append('image_wakil', newCandidate.image_wakil);
    try {
      await axios.post(`${API_BASE_URL}/candidates`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${adminToken}` }
      });
      setShowAddModal(false);
      setNewCandidate({ name: '', vision: '', mission: '', image_ketua: null, image_wakil: null });
      fetchData();
      showToast('Kandidat Berhasil Ditambah!');
    } catch (err) { showToast('Gagal menambah kandidat', 'error'); }
  };

  const handleEditClick = (candidate) => {
    setEditingCandidate({
      ...candidate,
      image_ketua: null,
      image_wakil: null
    });
    setShowEditModal(true);
  };

  const handleUpdateCandidate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editingCandidate.name);
    formData.append('vision', editingCandidate.vision || '');
    formData.append('mission', editingCandidate.mission || '');
    if (editingCandidate.image_ketua) formData.append('image_ketua', editingCandidate.image_ketua);
    if (editingCandidate.image_wakil) formData.append('image_wakil', editingCandidate.image_wakil);

    try {
      await axios.post(`${API_BASE_URL}/candidates/${editingCandidate.id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${adminToken}` }
      });
      setShowEditModal(false);
      fetchData();
      showToast('Kandidat Berhasil Diperbarui!', 'success');
    } catch (err) { 
      const errorMsg = err.response?.data?.message || 'Gagal memperbarui kandidat';
      showToast(errorMsg, 'error'); 
    }
  };

  const deleteCandidate = (id) => {
    setConfirmModal({
      show: true, title: 'Hapus Kandidat', message: 'Yakin hapus kandidat ini?', type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/candidates/${id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
          fetchData();
          showToast('Kandidat Dihapus', 'success');
        } catch (err) { showToast('Gagal menghapus', 'error'); }
      }
    });
  };

  const handleCustomGenerateTokens = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!useNumbers && !useUppercase && !useLowercase) {
      showToast('Pilih minimal satu tipe karakter token!', 'error');
      return;
    }
    const countVal = Math.max(1, Math.min(500, parseInt(customTokenCount) || 1));
    const lengthVal = Math.max(1, Math.min(9, parseInt(customTokenLength) || 6));

    try {
      await axios.post(`${API_BASE_URL}/tokens`, {
        count: countVal,
        length: lengthVal,
        use_numbers: useNumbers,
        use_uppercase: useUppercase,
        use_lowercase: useLowercase
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setShowTokenModal(false);
      fetchData();
      showToast(`${countVal} Token Berhasil Dibuat!`);
    } catch (err) {
      showToast('Gagal membuat token', 'error');
    }
  };

  const deleteToken = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/tokens/${id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      fetchData();
      showToast('Token Berhasil Dihapus');
    } catch (err) { showToast('Gagal hapus token', 'error'); }
  };

  const clearAllTokens = () => {
    setConfirmModal({
      show: true, title: 'Reset Sesi', message: 'Hapus semua token?', type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/tokens/clear-all`, { headers: { Authorization: `Bearer ${adminToken}` } });
          fetchData();
          showToast('Sesi Berhasil Direset');
        } catch (err) { showToast('Gagal reset', 'error'); }
      }
    });
  };

  const backupTokens = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tokens));
      const dl = document.createElement('a');
      dl.setAttribute("href", dataStr);
      dl.setAttribute("download", `backup_${new Date().getTime()}.json`);
      dl.click();
      showToast('Backup Berhasil Diunduh');
    } catch (err) { showToast('Gagal backup', 'error'); }
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        await axios.post(`${API_BASE_URL}/tokens/restore`, { tokens: jsonData }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fetchData();
        showToast('Restore Berhasil!');
      } catch (err) {
        showToast('File tidak valid', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handlePrint = () => { window.print(); };

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

  const chartData = (stats.candidates || []).map(c => ({ 
    name: (c.name || 'Unknown').split(':')[0], 
    votes: c.votes || 0 
  }));
  
  const filteredTokens = tokens.filter(t => t.token && t.token.includes(searchToken.toUpperCase()));
  const unusedTokensList = filteredTokens.filter(t => !t.is_used);
  const printableTokensList = unusedTokensList.length > 0 ? unusedTokensList : filteredTokens;
  const usedTokens = tokens.filter(t => t.is_used);

  const navItems = [
    { id: 'Overview', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Candidates', icon: Users, label: 'Paslon' },
    { id: 'Tokens', icon: Key, label: 'Token' },
    { id: 'Voters', icon: UserCheck, label: 'Pemilih' },
    { id: 'Stats', icon: BarChart3, label: 'Stats' },
  ];

  const sortedCandidates = [...(stats.candidates || [])].sort((a,b) => b.votes - a.votes);
  const leading = sortedCandidates[0];
  const second = sortedCandidates[1];
  const gap = (leading && second) ? leading.votes - second.votes : 0;
  const isDraw = leading && second && leading.votes === second.votes;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <motion.aside initial={false} animate={{ width: isSidebarCollapsed ? 80 : 256 }} className="hidden lg:flex border-r border-white/5 flex-col print:hidden overflow-hidden whitespace-nowrap">
        <div className="p-6 h-20 flex items-center">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mr-3"><LayoutDashboard size={20} className="text-white" /></div>
          {!isSidebarCollapsed && <span className="font-bold text-lg">Admin<span className="text-primary-500">Panel</span></span>}
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center rounded-xl transition-all h-12 ${activeMenu === item.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:bg-white/5'} ${isSidebarCollapsed ? 'justify-center' : 'px-4 space-x-3'}`}>
              <item.icon size={20} />
              {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-white/5">
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className={`w-full flex items-center text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all h-12 ${isSidebarCollapsed ? 'justify-center' : 'px-4 space-x-3'}`}><LogOut size={20} />{!isSidebarCollapsed && <span className="font-medium">Logout</span>}</button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 z-[60] flex items-center justify-around px-2 py-3 print:hidden">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex flex-col items-center space-y-1 px-3 py-1 rounded-xl transition-all ${activeMenu === item.id ? 'text-primary-500' : 'text-slate-500'}`}>
            <item.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pb-20 lg:pb-0">
        <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8 print:hidden">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:block p-2 hover:bg-white/5 rounded-lg text-slate-400">{isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</button>
            <h2 className="text-lg lg:text-xl font-bold tracking-tight">{activeMenu}</h2>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Online</span></div>
            <button onClick={() => fetchData(true)} title="Refresh Data" className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"><RefreshCcw size={18} className={refreshing ? 'animate-spin text-primary-400' : ''} /></button>
            <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="lg:hidden p-2 text-rose-400"><LogOut size={18} /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 print:p-0">
          {activeMenu === 'Overview' && (
            <div className="space-y-6 lg:space-y-8 print:hidden">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                <StatBox title="Total" value={stats.summary?.total_tokens} icon={Key} color="bg-primary-500" />
                <StatBox title="Masuk" value={stats.summary?.used_tokens} icon={UserCheck} color="bg-emerald-500" />
                <StatBox title="Sisa" value={stats.summary?.unused_tokens} icon={XCircle} color="bg-rose-500" />
                <StatBox title="Part" value={`${stats.summary?.participation_rate}%`} icon={TrendingUp} color="bg-amber-500" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 glass p-6 lg:p-8 rounded-[24px] lg:rounded-[32px]">
                  <h3 className="text-sm lg:text-lg font-bold mb-6">Grafik Suara</h3>
                  <div className="h-[250px] lg:h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 11, fontWeight: 'bold'}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 'bold'}} /><Bar dataKey="votes" radius={[6, 6, 0, 0]} barSize={35}>{chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div>
                </div>
                <div className="glass p-6 lg:p-8 rounded-[24px] lg:rounded-[32px]"><h3 className="text-sm lg:text-lg font-bold mb-4">Klasemen</h3><div className="space-y-3">{sortedCandidates.map((c, i) => (<div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><span className="text-xs font-bold truncate max-w-[120px]">{c.name}</span><span className="text-primary-400 font-black text-xs">{c.votes}</span></div>))}</div></div>
              </div>
            </div>
          )}

          {activeMenu === 'Voters' && (
            <div className="glass rounded-[24px] overflow-hidden print:hidden">
              <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold">Riwayat Pemilih</h3></div>
              <div className="overflow-x-auto"><table className="w-full text-left min-w-[500px]"><thead className="bg-white/5 text-[10px] font-bold text-slate-500 uppercase"><tr><th className="px-6 py-4">Token</th><th className="px-6 py-4">Waktu</th><th className="px-6 py-4 text-right">Status</th></tr></thead><tbody className="divide-y divide-white/5">{usedTokens.map(t => (<tr key={t.id} className="hover:bg-white/[0.02]"><td className="px-6 py-4 font-mono text-sm font-bold text-emerald-400">{t.token}</td><td className="px-6 py-4 text-[10px] md:text-xs text-slate-400">{new Date(t.used_at).toLocaleTimeString()}</td><td className="px-6 py-4 text-right"><span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-bold">VALID</span></td></tr>))}</tbody></table></div>
            </div>
          )}

          {activeMenu === 'Tokens' && (
            <div className="space-y-4 lg:space-y-6 print:hidden">
               <div className="flex flex-col space-y-4">
                <div className="glass p-5 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3"><button onClick={() => setShowTokenModal(true)} className="flex-1 md:flex-none bg-primary-500 hover:bg-primary-600 active:scale-95 transition-all text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20"><Key size={16} /><span>Buat Token</span></button></div>
                  <div className="flex items-center justify-between md:justify-end space-x-2">
                    <input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" accept=".json" />
                    <button onClick={backupTokens} title="Download Backup" className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white"><Download size={18} /></button>
                    <button onClick={() => fileInputRef.current.click()} title="Upload Restore" className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white"><Upload size={18} /></button>
                    <button onClick={clearAllTokens} title="Reset Sesi" className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20"><Trash2 size={18} /></button>
                    <button onClick={handlePrint} className="bg-slate-100 text-slate-900 px-6 py-2 rounded-xl font-bold text-sm">Cetak</button>
                  </div>
                </div>
                <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} /><input type="text" placeholder="Cari..." value={searchToken} onChange={(e) => setSearchToken(e.target.value)} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm" /></div>
              </div>
              <div className="glass rounded-[24px] overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left min-w-[400px]"><thead className="bg-white/5 text-[10px] font-bold text-slate-500 uppercase"><tr><th className="px-6 py-4">Token</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-white/5">{filteredTokens.map(token => (<tr key={token.id} className="hover:bg-white/[0.02]"><td className="px-6 py-4 font-mono font-bold text-primary-400 text-sm flex items-center space-x-2"><span>{token.token}</span><button onClick={() => copyToClipboard(token.token)} className="p-1 hover:bg-white/10 rounded text-slate-500"><Copy size={14} /></button></td><td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${token.is_used ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{token.is_used ? 'USED' : 'READY'}</span></td><td className="px-6 py-4 text-right">{!token.is_used && <button onClick={() => deleteToken(token.id)} className="text-slate-600 hover:text-rose-500"><Trash2 size={16} /></button>}</td></tr>))}</tbody></table></div></div>
            </div>
          )}

          {activeMenu === 'Stats' && (
            <div className="space-y-4 lg:space-y-6 pb-6">
              <div className="glass p-6 rounded-[32px] bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/20 relative overflow-hidden"><Zap className="absolute -right-8 -top-8 w-32 h-32 text-primary-500/5 rotate-12" /><div className="flex items-center space-x-4 mb-6"><div className="p-3 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/20"><Trophy className="text-white" size={24} /></div><div><h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Kandidat Unggul</h3><p className="text-xl font-black text-white">{leading ? leading.name : 'Belum Ada Data'}</p></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="p-4 bg-white/5 rounded-2xl border border-white/5"><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Status Persaingan</p><p className={`text-lg font-black ${isDraw ? 'text-amber-500' : 'text-emerald-500'}`}>{isDraw ? 'POSISI SERI (DRAW)' : 'UNGGUL SEMENTARA'}</p></div><div className="p-4 bg-white/5 rounded-2xl border border-white/5"><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Selisih Suara</p><div className="flex items-end space-x-2"><p className="text-2xl font-black text-primary-400">{gap}</p><p className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Suara</p></div></div></div></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="glass p-6 rounded-[32px] flex flex-col h-[350px]"><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Distribusi Suara</h3><PieIcon className="text-slate-600" size={18} /></div><div className="flex-1"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="votes" label={renderCustomLabel} labelLine={{ stroke: '#64748b', strokeWidth: 1.5 }}>{chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}</Pie><Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}} /></PieChart></ResponsiveContainer></div></div><div className="glass p-6 rounded-[32px] flex flex-col justify-between space-y-6"><div className="space-y-4"><h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Rangkuman Suara</h3><div className="space-y-3">{sortedCandidates.map((c, i) => (<div key={i} className="space-y-1"><div className="flex justify-between text-xs font-bold"><span>{c.name}</span><span className="text-primary-400">{c.votes} Suara ({((c.votes / (stats.summary?.used_tokens || 1)) * 100).toFixed(1)}%)</span></div><div className="h-2 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(c.votes / (stats.summary?.used_tokens || 1)) * 100}%` }} className="h-full bg-primary-500" /></div></div>))}</div></div><div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center space-x-4"><div className="p-2 bg-amber-500/20 rounded-lg"><Activity className="text-amber-500" size={20} /></div><div><p className="text-[10px] font-bold text-amber-500/60 uppercase">Suara Belum Masuk (Potensi)</p><p className="text-xl font-black text-amber-500">{stats.summary?.unused_tokens} Pemilih Lagi</p></div></div></div></div>
            </div>
          )}

          {activeMenu === 'Candidates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 print:hidden">
              {candidates.map(candidate => (
                <div key={candidate.id} className="glass p-5 rounded-[24px] flex items-center justify-between border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-3">
                      <img src={candidate.image_ketua_url} className="w-12 h-12 rounded-xl object-cover border-2 border-slate-900" />
                      <img src={candidate.image_wakil_url} className="w-12 h-12 rounded-xl object-cover border-2 border-slate-900" />
                    </div>
                    <span className="font-bold text-sm truncate max-w-[120px]">{candidate.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleEditClick(candidate)} className="p-2 text-slate-400 hover:text-primary-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => deleteCandidate(candidate.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowAddModal(true)} className="border-2 border-dashed border-white/5 rounded-[24px] p-6 flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-primary-500 transition-all"><Plus size={24} /><span className="text-[10px] font-bold uppercase">Tambah Paslon</span></button>
            </div>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <motion.div initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5 }} className={`${toast.type === 'error' ? 'bg-rose-500 shadow-rose-500/40' : 'bg-primary-500 shadow-primary-500/40'} text-white px-8 py-4 rounded-[24px] shadow-2xl flex items-center space-x-3 border border-white/20 backdrop-blur-xl`}>
               <div className="p-1.5 bg-white/20 rounded-full">{toast.type === 'error' ? <XCircle size={20} /> : <Check size={20} />}</div>
               <span className="font-black text-sm uppercase tracking-widest">{toast.message}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generate Token Modal */}
      <AnimatePresence>
        {showTokenModal && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-slate-900 w-full max-md:max-w-full max-w-lg rounded-t-[32px] md:rounded-[32px] overflow-hidden flex flex-col border border-white/10 shadow-2xl">
              <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl">
                    <Key size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Generate Token Custom</h3>
                    <p className="text-xs text-slate-400">Atur jumlah, karakter, dan panjang token</p>
                  </div>
                </div>
                <button onClick={() => setShowTokenModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400"><X size={20} /></button>
              </div>

              <form onSubmit={handleCustomGenerateTokens} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jumlah Token</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={customTokenCount}
                    onChange={(e) => setCustomTokenCount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Karakter Random Token (Ceklis yang diinginkan)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-center space-x-3 p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer select-none transition-colors">
                      <input
                        type="checkbox"
                        checked={useNumbers}
                        onChange={(e) => setUseNumbers(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-xs font-bold">Angka (0-9)</span>
                    </label>

                    <label className="flex items-center space-x-3 p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer select-none transition-colors">
                      <input
                        type="checkbox"
                        checked={useUppercase}
                        onChange={(e) => setUseUppercase(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-xs font-bold">Huruf (A-Z)</span>
                    </label>

                    <label className="flex items-center space-x-3 p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer select-none transition-colors">
                      <input
                        type="checkbox"
                        checked={useLowercase}
                        onChange={(e) => setUseLowercase(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-xs font-bold">Huruf (a-z)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panjang / Jumlah Digit Token (1-9)</label>
                    <span className="text-xs font-bold text-primary-400">{customTokenLength} Digit</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={customTokenLength}
                    onChange={(e) => setCustomTokenLength(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="flex flex-col-reverse md:flex-row gap-3 pt-2">
                  <button type="button" onClick={() => setShowTokenModal(false)} className="w-full py-3.5 rounded-2xl font-bold text-sm text-slate-400 hover:bg-white/5 transition-colors">Batal</button>
                  <button type="submit" className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-primary-500 shadow-lg shadow-primary-500/20 active:scale-95 transition-all">Generate Sekarang</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>{confirmModal.show && (<div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-md"><motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-slate-900 w-full max-md:max-w-full max-w-md rounded-t-[32px] md:rounded-[32px] p-8 text-center border-t md:border border-white/10 shadow-2xl"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary-500/10 text-primary-500'}`}><AlertTriangle size={28} /></div><h3 className="text-lg font-bold mb-2">{confirmModal.title}</h3><p className="text-slate-400 text-xs mb-8 px-4">{confirmModal.message}</p><div className="flex flex-col-reverse md:flex-row gap-3"><button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="w-full py-4 rounded-2xl font-bold text-sm text-slate-400">Batal</button><button onClick={() => { confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, show: false }); }} className={`w-full py-4 rounded-2xl font-bold text-sm text-white shadow-lg ${confirmModal.type === 'danger' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-primary-500 shadow-primary-500/20'}`}>Lanjutkan</button></div></motion.div></div>)}</AnimatePresence>

      {/* Add Candidate Modal */}
      <AnimatePresence>{showAddModal && (<div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/90 backdrop-blur-sm"><motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-slate-900 w-full max-w-2xl h-[90vh] md:h-auto md:rounded-[40px] rounded-t-[40px] overflow-hidden flex flex-col"><div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center shrink-0"><h3 className="text-xl font-bold">Tambah Paslon</h3><button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button></div><form onSubmit={handleAddCandidate} className="p-6 md:p-8 space-y-6 overflow-y-auto"><div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Pasangan Calon</label><input type="text" placeholder="Contoh: 01 - Budi & Iwan" value={newCandidate.name} onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-1 focus:ring-primary-500" required /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Foto Ketua</label><input type="file" onChange={(e) => setNewCandidate({...newCandidate, image_ketua: e.target.files[0]})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-2 text-[10px]" required /></div><div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Foto Wakil</label><input type="file" onChange={(e) => setNewCandidate({...newCandidate, image_wakil: e.target.files[0]})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-2 text-[10px]" required /></div></div><div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Visi & Misi</label><textarea placeholder="Visi" value={newCandidate.vision} onChange={(e) => setNewCandidate({...newCandidate, vision: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 h-24 text-sm mb-4" /><textarea placeholder="Misi" value={newCandidate.mission} onChange={(e) => setNewCandidate({...newCandidate, mission: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 h-24 text-sm" /></div><button type="submit" className="w-full bg-primary-500 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/20 active:scale-95 transition-all">Simpan Paslon</button></form></motion.div></div>)}</AnimatePresence>

      {/* Edit Candidate Modal */}
      <AnimatePresence>
        {showEditModal && editingCandidate && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/90 backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-slate-900 w-full max-w-2xl h-[90vh] md:h-auto md:rounded-[40px] rounded-t-[40px] overflow-hidden flex flex-col">
              <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold">Edit Paslon</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateCandidate} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Pasangan Calon</label>
                  <input type="text" value={editingCandidate.name} onChange={(e) => setEditingCandidate({...editingCandidate, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-1 focus:ring-primary-500" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Update Foto Ketua (Opsional)</label>
                    <input type="file" onChange={(e) => setEditingCandidate({...editingCandidate, image_ketua: e.target.files[0]})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-2 text-[10px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Update Foto Wakil (Opsional)</label>
                    <input type="file" onChange={(e) => setEditingCandidate({...editingCandidate, image_wakil: e.target.files[0]})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-2 text-[10px]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Visi & Misi</label>
                  <textarea placeholder="Visi" value={editingCandidate.vision} onChange={(e) => setEditingCandidate({...editingCandidate, vision: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 h-24 text-sm mb-4" />
                  <textarea placeholder="Misi" value={editingCandidate.mission} onChange={(e) => setEditingCandidate({...editingCandidate, mission: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 h-24 text-sm" />
                </div>
                <button type="submit" className="w-full bg-primary-500 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/20 active:scale-95 transition-all">Perbarui Paslon</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Printable Token Grid Sheet Optimized for A4 */}
      <div className="hidden print:block print:w-full print:bg-white print:text-black print:p-4">
        <div className="text-center border-b-2 border-slate-800 pb-3 mb-5">
          <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">KARTU TOKEN PEMILIHAN OSIS (COBLOS ONLINE)</h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">Potong mengikuti garis tepi (garis putus-putus) di bawah ini dan bagikan kepada setiap pemilih. Setiap token hanya dapat digunakan 1 kali.</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {printableTokensList.map((t, idx) => (
            <div
              key={t.id || idx}
              className="border border-dashed border-slate-400 rounded-xl p-3 flex flex-col items-center justify-center text-center bg-white break-inside-avoid"
              style={{ pageBreakInside: 'avoid' }}
            >
              <p className="text-[11px] font-black text-slate-900 uppercase tracking-wide">KODE TOKEN RAHASIA</p>
              
              <div className="w-full border-b border-slate-200 my-1.5" />

              <div className="w-full py-2 px-3 border border-slate-300 rounded-xl bg-white text-center">
                <p className="font-mono text-base font-black tracking-wider text-slate-900">{t.token}</p>
              </div>

              <div className="w-full border-b border-slate-200 my-1.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const StatBox = ({ title, value, icon: Icon, color }) => (
  <div className="glass p-4 lg:p-6 rounded-[20px] lg:rounded-[32px] relative overflow-hidden group">
    <div className={`absolute -right-2 -top-2 w-12 lg:w-20 h-12 lg:h-20 ${color} opacity-10 blur-xl rounded-full`} />
    <div className={`p-2 lg:p-3 rounded-xl ${color} bg-opacity-20 inline-block mb-2`}><Icon className={color.replace('bg-', 'text-')} size={16} /></div>
    <p className="text-slate-500 text-[10px] lg:text-xs font-bold uppercase tracking-widest">{title}</p>
    <p className="text-lg lg:text-3xl font-black mt-0.5 text-white">{value}</p>
  </div>
);
