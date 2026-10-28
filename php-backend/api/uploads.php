<?php
// php-backend/api/uploads.php — admin-only list uploaded images
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    sendResponse(['message' => 'Method not allowed'], 405);
}

requireAdmin();

$type = $_GET['type'] ?? 'packages';
$type = is_string($type) ? strtolower(trim($type)) : 'packages';

$allowedTypes = ['packages', 'reviews'];
if (!in_array($type, $allowedTypes, true)) {
    sendResponse(['message' => 'Invalid type'], 400);
}

$dir = realpath(__DIR__ . '/../uploads/' . $type);
if ($dir === false) {
    sendResponse(['files' => []]);
}

// Safety: ensure we only ever list under php-backend/uploads/
$uploadsRoot = realpath(__DIR__ . '/../uploads');
if ($uploadsRoot === false || strpos($dir, $uploadsRoot) !== 0) {
    sendResponse(['message' => 'Invalid uploads directory'], 400);
}

$entries = @scandir($dir);
if (!is_array($entries)) {
    sendResponse(['files' => []]);
}

$allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$files = [];

foreach ($entries as $name) {
    if (!is_string($name) || $name === '.' || $name === '..') continue;
    $path = $dir . DIRECTORY_SEPARATOR . $name;
    if (!is_file($path)) continue;
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) continue;
    $files[] = [
        'path' => '/uploads/' . $type . '/' . $name,
        'name' => $name
    ];
}

// Newest first (best-effort by mtime)
usort($files, function ($a, $b) use ($dir) {
    $pa = $dir . DIRECTORY_SEPARATOR . ($a['name'] ?? '');
    $pb = $dir . DIRECTORY_SEPARATOR . ($b['name'] ?? '');
    $ta = @filemtime($pa) ?: 0;
    $tb = @filemtime($pb) ?: 0;
    return $tb <=> $ta;
});

sendResponse(['files' => $files]);

