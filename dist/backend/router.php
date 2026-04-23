<?php
// Router for PHP's built-in server (php -S).
// Mirrors `php-backend/.htaccess` rewrite behavior for local development.
//
// Usage (from repo root):
//   php -S localhost:8000 -t php-backend php-backend/router.php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
if ($uri === '') $uri = '/';

// If a real file exists, let the server handle it (static assets, direct PHP files, etc.)
$requestedPath = __DIR__ . $uri;
if ($uri !== '/' && file_exists($requestedPath) && !is_dir($requestedPath)) {
  return false;
}

// Normalize and route API endpoints.
// Supported routes (same as .htaccess):
// - /api/auth/login
// - /api/packages, /api/packages/{id}
// - /api/bookings, /api/bookings/{id}
// - /api/blogs, /api/blogs/{id}, /api/blogs/slug/{slug}
// - /api/settings
// - /api/upload

if ($uri === '/api/auth/login') {
  require __DIR__ . '/api/auth.php';
  exit;
}

if ($uri === '/api/packages') {
  require __DIR__ . '/api/packages.php';
  exit;
}
if (preg_match('#^/api/packages/([0-9]+)$#', $uri, $m)) {
  $_GET['id'] = $m[1];
  require __DIR__ . '/api/packages.php';
  exit;
}

if ($uri === '/api/bookings') {
  require __DIR__ . '/api/bookings.php';
  exit;
}
if (preg_match('#^/api/bookings/([0-9]+)$#', $uri, $m)) {
  $_GET['id'] = $m[1];
  require __DIR__ . '/api/bookings.php';
  exit;
}

if ($uri === '/api/blogs') {
  require __DIR__ . '/api/blogs.php';
  exit;
}
if (preg_match('#^/api/blogs/([0-9]+)$#', $uri, $m)) {
  $_GET['id'] = $m[1];
  require __DIR__ . '/api/blogs.php';
  exit;
}
if (preg_match('#^/api/blogs/slug/([^/]+)$#', $uri, $m)) {
  $_GET['slug'] = $m[1];
  require __DIR__ . '/api/blogs.php';
  exit;
}

if ($uri === '/api/settings') {
  require __DIR__ . '/api/settings.php';
  exit;
}

if ($uri === '/api/upload') {
  require __DIR__ . '/api/upload.php';
  exit;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['message' => 'Not found', 'path' => $uri]);
