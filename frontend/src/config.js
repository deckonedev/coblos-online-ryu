/**
 * Smart API URL Configuration
 * 
 * Otomatis mendeteksi environment:
 * - Jika diakses dari localhost/127.0.0.1 → pakai backend lokal
 * - Jika diakses dari tunnel/domain → pakai VITE_API_URL dari .env
 * 
 * Ini mengatasi masalah URL tunnel Cloudflare yang berubah setiap restart,
 * sehingga saat tunnel mati, halaman lokal tetap berfungsi normal.
 */

const getApiBaseUrl = () => {
  const host = window.location.hostname;

  // Jika diakses dari localhost → selalu pakai backend lokal
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api';
  }

  // Jika diakses dari tunnel/domain → pakai VITE_API_URL (diset oleh tunnel script)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback ke localhost
  return 'http://127.0.0.1:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();
