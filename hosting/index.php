<?php
/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  COBLOS ONLINE - Smart Proxy/Viewer                      ║
 * ║  File ini di-upload ke hosting Anda                       ║
 * ║  osisvote.codeteacher.full.diskon.cloud                   ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * Menampilkan aplikasi Coblos Online dari tunnel URL
 * dalam iframe sehingga URL tetap di domain Anda.
 */

// Read current tunnel URL
$configFile = __DIR__ . '/.tunnel_config.json';
$tunnelUrl = '';
$lastUpdate = '';

if (file_exists($configFile)) {
    $config = json_decode(file_get_contents($configFile), true);
    $tunnelUrl = rtrim($config['frontend_url'] ?? '', '/');
    $lastUpdate = $config['updated_at'] ?? '';
}

// Teruskan path request (contoh /admin atau /login) ke iframe
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = ltrim(parse_url($requestUri, PHP_URL_PATH), '/');
$query = parse_url($requestUri, PHP_URL_QUERY);

if ($path === 'index.php') {
    $path = '';
}

$iframeUrl = $tunnelUrl;
if (!empty($path) && !empty($tunnelUrl)) {
    $iframeUrl .= '/' . $path;
}
if (!empty($query) && !empty($tunnelUrl)) {
    $iframeUrl .= '?' . $query;
}

// Check if tunnel is online (simple check)
$isOnline = !empty($tunnelUrl);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSIS Vote - Coblos Online</title>
    <meta name="description" content="Platform pemilihan OSIS online - Vote kandidat pilihanmu!">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            min-height: 100vh;
        }

        /* When tunnel is online - fullscreen iframe */
        .app-frame {
            width: 100%;
            height: 100vh;
            border: none;
            display: block;
        }

        /* Loading overlay */
        .loading-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 1000;
            transition: opacity 0.5s ease;
        }

        .loading-overlay.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .spinner {
            width: 50px; height: 50px;
            border: 4px solid rgba(99, 102, 241, 0.2);
            border-top: 4px solid #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Offline page */
        .offline-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }

        .offline-card {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 24px;
            padding: 60px 40px;
            text-align: center;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }

        .offline-icon {
            font-size: 72px;
            margin-bottom: 24px;
            display: block;
        }

        .offline-title {
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 16px;
        }

        .offline-message {
            font-size: 16px;
            color: #94a3b8;
            line-height: 1.7;
            margin-bottom: 32px;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 20px;
            border-radius: 100px;
            font-size: 14px;
            font-weight: 600;
        }

        .status-offline {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .status-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            background: #f87171;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }

        .retry-btn {
            display: inline-block;
            margin-top: 24px;
            padding: 12px 32px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .retry-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }

        /* Direct link bar at bottom */
        .direct-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(99, 102, 241, 0.2);
            padding: 8px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 13px;
            z-index: 999;
            color: #64748b;
        }

        .direct-bar a {
            color: #6366f1;
            text-decoration: none;
            font-weight: 500;
        }

        .direct-bar a:hover {
            text-decoration: underline;
        }

        .direct-bar .close-bar {
            position: absolute;
            right: 16px;
            cursor: pointer;
            color: #475569;
            font-size: 18px;
        }

        .direct-bar .close-bar:hover {
            color: #e2e8f0;
        }
    </style>
</head>
<body>

<?php if ($isOnline): ?>
    <!-- Loading overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="spinner"></div>
        <p>Memuat Coblos Online...</p>
    </div>

    <!-- App iframe -->
    <iframe 
        src="<?= htmlspecialchars($iframeUrl) ?>" 
        class="app-frame" 
        id="appFrame"
        allow="clipboard-write"
        loading="eager"
        onload="document.getElementById('loadingOverlay').classList.add('hidden')"
    ></iframe>

    <!-- Direct link bar -->
    <div class="direct-bar" id="directBar">
        <span>Jika halaman tidak tampil dengan benar:</span>
        <a href="<?= htmlspecialchars($iframeUrl) ?>" target="_blank">Buka langsung ↗</a>
        <span class="close-bar" onclick="this.parentElement.style.display='none'">✕</span>
    </div>

    <script>
        // Auto-hide loading after 10 seconds (fallback)
        setTimeout(() => {
            document.getElementById('loadingOverlay').classList.add('hidden');
        }, 10000);

        // Hide direct bar after 5 seconds
        setTimeout(() => {
            const bar = document.getElementById('directBar');
            if (bar) bar.style.display = 'none';
        }, 8000);
    </script>

<?php else: ?>
    <!-- Offline page -->
    <div class="offline-container">
        <div class="offline-card">
            <span class="offline-icon">🗳️</span>
            <h1 class="offline-title">OSIS Vote</h1>
            <p class="offline-message">
                Sistem pemilihan sedang <strong>offline</strong>.<br>
                Admin belum mengaktifkan server voting.<br>
                Silakan coba lagi nanti.
            </p>
            <div class="status-badge status-offline">
                <span class="status-dot"></span>
                Server Offline
            </div>
            <br>
            <a href="?" class="retry-btn">🔄 Coba Lagi</a>
        </div>
    </div>
<?php endif; ?>

</body>
</html>
