import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCcw } from 'lucide-react';

/**
 * Komponen ServerOffline
 * Ditampilkan saat backend API tidak bisa dihubungi (server mati).
 */
export default function ServerOffline() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <WifiOff className="text-rose-400" size={40} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-white mb-3">
          Mohon Maaf, Server Off
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Server sedang tidak aktif atau tidak dapat dihubungi. Silakan hubungi panitia atau coba beberapa saat lagi.
        </p>

        {/* Reload Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 active:scale-95 transition-all text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary-500/20"
        >
          <RefreshCcw size={18} />
          <span>Muat Ulang</span>
        </button>
      </motion.div>
    </div>
  );
}
