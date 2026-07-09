<?php
/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  COBLOS ONLINE - Single File Auto-Installer              ║
 * ║  Upload HANYA file ini (install.php) ke hosting Anda      ║
 * ║  Lalu buka di browser:                                    ║
 * ║  http://osisvote.codeteacher.full.diskon.cloud/install.php║
 * ╚═══════════════════════════════════════════════════════════╝
 */

$indexContent = <<<'EOD'
<?php
/**
 * COBLOS ONLINE - Smart Proxy/Viewer
 */

$configFile = __DIR__ . '/.tunnel_config.json';
$tunnelUrl = '';
$lastUpdate = '';

if (file_exists($configFile)) {
    $config = json_decode(file_get_contents($configFile), true);
    $tunnelUrl = $config['frontend_url'] ?? '';
    $lastUpdate = $config['updated_at'] ?? '';
}

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
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
        .app-frame { width: 100%; height: 100vh; border: none; display: block; }
        .loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0f172a; display: flex; align-items: center; justify-content: center; flex-direction: column; z-index: 1000; transition: opacity 0.5s ease; }
        .loading-overlay.hidden { opacity: 0; pointer-events: none; }
        .spinner { width: 50px; height: 50px; border: 4px solid rgba(99, 102, 241, 0.2); border-top: 4px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .offline-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .offline-card { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 24px; padding: 60px 40px; text-align: center; max-width: 500px; width: 100%; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4); }
        .offline-icon { font-size: 72px; margin-bottom: 24px; display: block; }
        .offline-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px; }
        .offline-message { font-size: 16px; color: #94a3b8; line-height: 1.7; margin-bottom: 32px; }
        .status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 100px; font-size: 14px; font-weight: 600; }
        .status-offline { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #f87171; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .retry-btn { display: inline-block; margin-top: 24px; padding: 12px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }
        .retry-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }
        .direct-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); border-top: 1px solid rgba(99, 102, 241, 0.2); padding: 8px 16px; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 13px; z-index: 999; color: #64748b; }
        .direct-bar a { color: #6366f1; text-decoration: none; font-weight: 500; }
        .direct-bar a:hover { text-decoration: underline; }
        .direct-bar .close-bar { position: absolute; right: 16px; cursor: pointer; color: #475569; font-size: 18px; }
        .direct-bar .close-bar:hover { color: #e2e8f0; }
    </style>
</head>
<body>
<?php if ($isOnline): ?>
    <div class="loading-overlay" id="loadingOverlay">
        <div class="spinner"></div>
        <p>Memuat Coblos Online...</p>
    </div>
    <iframe src="<?= htmlspecialchars($tunnelUrl) ?>" class="app-frame" id="appFrame" allow="clipboard-write" loading="eager" onload="document.getElementById('loadingOverlay').classList.add('hidden')"></iframe>
    <div class="direct-bar" id="directBar">
        <span>Jika halaman tidak tampil dengan benar:</span>
        <a href="<?= htmlspecialchars($tunnelUrl) ?>" target="_blank">Buka langsung ↗</a>
        <span class="close-bar" onclick="this.parentElement.style.display='none'">✕</span>
    </div>
    <script>
        setTimeout(() => { document.getElementById('loadingOverlay').classList.add('hidden'); }, 10000);
        setTimeout(() => { const bar = document.getElementById('directBar'); if (bar) bar.style.display = 'none'; }, 8000);
    </script>
<?php else: ?>
    <div class="offline-container">
        <div class="offline-card">
            <span class="offline-icon">🗳️</span>
            <h1 class="offline-title">OSIS Vote</h1>
            <p class="offline-message">Sistem pemilihan sedang <strong>offline</strong>.<br>Admin belum mengaktifkan server voting.<br>Silakan coba lagi nanti.</p>
            <div class="status-badge status-offline"><span class="status-dot"></span>Server Offline</div>
            <br>
            <a href="?" class="retry-btn">🔄 Coba Lagi</a>
        </div>
    </div>
<?php endif; ?>
</body>
</html>
EOD;

$webhookContent = <<<'EOD'
<?php
/**
 * COBLOS ONLINE - Webhook Endpoint
 */
$WEBHOOK_SECRET = 'coblos-osis-2026';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $configFile = __DIR__ . '/.tunnel_config.json';
    if (file_exists($configFile)) {
        $config = json_decode(file_get_contents($configFile), true);
        echo json_encode([
            'status' => 'online',
            'frontend_url' => $config['frontend_url'] ?? '',
            'backend_url' => $config['backend_url'] ?? '',
            'updated_at' => $config['updated_at'] ?? '',
        ]);
    } else {
        echo json_encode(['status' => 'offline']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

if (!isset($body['secret']) || $body['secret'] !== $WEBHOOK_SECRET) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid secret']);
    exit;
}

if (empty($body['frontend_url'])) {
    http_response_code(400);
    echo json_encode(['error' => 'frontend_url is required']);
    exit;
}

$config = [
    'frontend_url' => rtrim($body['frontend_url'], '/'),
    'backend_url'  => rtrim($body['backend_url'] ?? $body['frontend_url'], '/'),
    'updated_at'   => date('Y-m-d H:i:s'),
    'ip'           => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
];

$configFile = __DIR__ . '/.tunnel_config.json';
$result = file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT));

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write config file']);
    exit;
}

echo json_encode([
    'status'  => 'ok',
    'message' => 'Tunnel URL updated successfully',
    'config'  => $config,
]);
EOD;

$htaccessContent = <<<'EOD'
# Deny access to sensitive files
<FilesMatch "\.(json)$">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order deny,allow
        Deny from all
    </IfModule>
</FilesMatch>

<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^webhook$ webhook.php [L,QSA]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [L,QSA]
</IfModule>
EOD;

$success = true;
$errors = [];

if (file_put_contents(__DIR__ . '/index.php', $indexContent) === false) {
    $success = false; $errors[] = "Gagal membuat index.php";
}
if (file_put_contents(__DIR__ . '/webhook.php', $webhookContent) === false) {
    $success = false; $errors[] = "Gagal membuat webhook.php";
}
if (file_put_contents(__DIR__ . '/.htaccess', $htaccessContent) === false) {
    $success = false; $errors[] = "Gagal membuat .htaccess";
}

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Installer Coblos Online</title>
    <style>
        body { font-family: sans-serif; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 40px; border-radius: 16px; text-align: center; max-width: 450px; border: 1px solid #334155; }
        h1 { color: #38bdf8; margin-bottom: 20px; }
        .btn { display: inline-block; background: #6366f1; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: bold; }
        .btn:hover { background: #4f46e5; }
        .err { color: #f87171; }
    </style>
</head>
<body>
    <div class="card">
        <?php if ($success): ?>
            <h1>🎉 Instalasi Berhasil!</h1>
            <p>File <b>index.php</b>, <b>webhook.php</b>, dan <b>.htaccess</b> telah otomatis dibuat di server Anda.</p>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 15px;">Anda sekarang bisa menghapus file install.php ini demi keamanan, atau biarkan saja.</p>
            <a href="index.php" class="btn">Lihat Website ↗</a>
        <?php else: ?>
            <h1 class="err">❌ Instalasi Gagal</h1>
            <p>Terdapat kendala hak akses (permission) saat menulis file:</p>
            <ul style="color: #f87171; text-align: left;">
                <?php foreach ($errors as $err) echo "<li>$err</li>"; ?>
            </ul>
        <?php endif; ?>
    </div>
</body>
</html>
