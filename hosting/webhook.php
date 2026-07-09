<?php
/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  COBLOS ONLINE - Webhook Endpoint                        ║
 * ║  Menerima update tunnel URL dari script lokal             ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * Endpoint: POST /webhook.php
 * Body: { "secret": "...", "frontend_url": "...", "backend_url": "..." }
 */

// ============ CONFIG ============
// Ganti secret ini dengan yang lebih aman jika mau
$WEBHOOK_SECRET = 'coblos-osis-2026';
// ================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// GET = status check
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

// POST = update tunnel URL
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

// Validate secret
if (!isset($body['secret']) || $body['secret'] !== $WEBHOOK_SECRET) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid secret']);
    exit;
}

// Validate URL
if (empty($body['frontend_url'])) {
    http_response_code(400);
    echo json_encode(['error' => 'frontend_url is required']);
    exit;
}

// Save config
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
