import React from 'react';
import { motion } from 'framer-motion';

/**
 * Komponen PageLoader
 * Ditampilkan saat halaman sedang memuat data dari server.
 */
export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-primary-500/20"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Text */}
        <div className="text-center">
          <motion.p
            className="text-sm font-bold text-white"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Memuat data...
          </motion.p>
          <p className="text-xs text-slate-500 mt-1">Mohon tunggu sebentar</p>
        </div>
      </motion.div>
    </div>
  );
}
