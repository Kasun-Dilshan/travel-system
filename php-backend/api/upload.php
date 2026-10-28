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

// When post_max_size is exceeded, PHP empties $_POST and $_FILES — which also
// drops multipart admin_token. Detect that before auth so the message is clear.
$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 0 && empty($_POST) && empty($_FILES)) {
    sendResponse([
        'message' => 'Upload exceeded server post_max_size. Try a smaller image (max 8MB).',
    ], 413);
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
        } elseif ($file['error'] === UPLOAD_ERR_NO_FILE) {
            $msg = 'No file received';
        } elseif ($file['error'] === UPLOAD_ERR_PARTIAL) {
            $msg = 'File upload was incomplete';
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

$type = $_POST['type'] ?? $_GET['type'] ?? 'packages';
$type = is_string($type) ? strtolower(trim($type)) : 'packages';
$allowedTypes = ['packages', 'reviews'];
if (!in_array($type, $allowedTypes, true)) {
    sendResponse(['message' => 'Invalid upload type. Allowed: packages, reviews'], 400);
}

$uploadRoot = __DIR__ . '/../uploads';
$uploadDir = $uploadRoot . '/' . $type;

if (!is_dir($uploadRoot)) {
    // Suppress warnings — the custom error handler would otherwise turn them into a bare 500.
    if (!@mkdir($uploadRoot, 0755, true) && !is_dir($uploadRoot)) {
        sendResponse(['message' => 'Could not create uploads directory. Create public_html/uploads and make it writable.'], 500);
    }
}

if (!is_dir($uploadDir)) {
    if (!@mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
        sendResponse(['message' => 'Could not create upload directory. Create public_html/uploads/' . $type . ' and make it writable.'], 500);
    }
}

if (!is_writable($uploadDir)) {
    sendResponse(['message' => 'Upload directory is not writable. Set write permissions on public_html/uploads/' . $type . '.'], 500);
}

$ext = $allowed[$mime];
try {
    $basename = bin2hex(random_bytes(16)) . '.' . $ext;
} catch (Throwable $e) {
    $basename = bin2hex(openssl_random_pseudo_bytes(16)) . '.' . $ext;
}
$dest = $uploadDir . DIRECTORY_SEPARATOR . $basename;

if (!@move_uploaded_file($tmp, $dest)) {
    sendResponse(['message' => 'Failed to save file. Check disk space and folder permissions on uploads/' . $type . '.'], 500);
}

$publicPath = '/uploads/' . $type . '/' . $basename;

// Return an absolute URL so the frontend can display the image even when hosted
// on a different origin than the PHP backend.
$appUrl = getenv('APP_URL');
if (is_string($appUrl) && trim($appUrl) !== '') {
    $absoluteUrl = rtrim(trim($appUrl), '/') . $publicPath;
    sendResponse(['url' => $absoluteUrl, 'path' => $publicPath], 201);
}

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
