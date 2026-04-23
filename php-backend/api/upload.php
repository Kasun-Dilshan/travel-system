<?php
// php-backend/api/upload.php — admin-only image upload for package covers, etc.
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    sendResponse(['message' => 'Method not allowed'], 405);
}

requireAdmin();

if (!isset($_FILES['image'])) {
    sendResponse(['message' => 'Missing file field "image"'], 400);
}

$file = $_FILES['image'];
if (!is_array($file) || !isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
    $msg = 'Upload failed';
    if (isset($file['error'])) {
        if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
            $msg = 'File is too large';
        }
    }
    sendResponse(['message' => $msg], 400);
}

$maxBytes = 8 * 1024 * 1024;
if (isset($file['size']) && (int) $file['size'] > $maxBytes) {
    sendResponse(['message' => 'Image must be 8MB or smaller'], 400);
}

$tmp = $file['tmp_name'];
if (!is_uploaded_file($tmp)) {
    sendResponse(['message' => 'Invalid upload'], 400);
}

$info = @getimagesize($tmp);
if ($info === false) {
    sendResponse(['message' => 'Invalid or corrupt image file'], 400);
}

$mime = $info['mime'] ?? '';
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];
if (!isset($allowed[$mime])) {
    sendResponse(['message' => 'Allowed types: JPEG, PNG, WebP, GIF'], 400);
}

$uploadDir = __DIR__ . '/../uploads/packages';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        sendResponse(['message' => 'Could not create upload directory'], 500);
    }
}

$ext = $allowed[$mime];
$basename = bin2hex(random_bytes(16)) . '.' . $ext;
$dest = $uploadDir . DIRECTORY_SEPARATOR . $basename;

if (!move_uploaded_file($tmp, $dest)) {
    sendResponse(['message' => 'Failed to save file'], 500);
}

$publicPath = '/uploads/packages/' . $basename;

// Return an absolute URL so the frontend can display the image even when hosted
// on a different origin than the PHP backend.
$forwardedProto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '';
$scheme = 'http';
if (is_string($forwardedProto) && $forwardedProto !== '') {
    $scheme = strtolower(trim(explode(',', $forwardedProto)[0]));
} elseif (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    $scheme = 'https';
}

$forwardedHost = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? '';
$host = '';
if (is_string($forwardedHost) && $forwardedHost !== '') {
    $host = trim(explode(',', $forwardedHost)[0]);
} elseif (!empty($_SERVER['HTTP_HOST'])) {
    $host = (string) $_SERVER['HTTP_HOST'];
}

$scriptName = (string) ($_SERVER['SCRIPT_NAME'] ?? '');
$basePath = str_replace('\\', '/', rtrim(dirname($scriptName), '/'));
// Common deployments expose API under `/api`; uploads live at the same level.
if (preg_match('#/api$#i', $basePath)) {
    $basePath = preg_replace('#/api$#i', '', $basePath) ?? '';
}
$basePath = $basePath === '/' ? '' : $basePath;

$absoluteUrl = ($host !== '') ? ($scheme . '://' . $host . $basePath . $publicPath) : $publicPath;
sendResponse(['url' => $absoluteUrl, 'path' => $publicPath], 201);
