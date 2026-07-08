<?php
// Quick deploy check — visit /health.php after uploading to SiteGround.
header('Content-Type: application/json; charset=utf-8');

$root = __DIR__;
$mainJs = glob($root . '/assets/index-*.js') ?: glob($root . '/public/assets/index-*.js') ?: [];

echo json_encode([
    'ok' => file_exists($root . '/index.html') && count($mainJs) > 0,
    'index_html' => file_exists($root . '/index.html'),
    'htaccess' => file_exists($root . '/.htaccess'),
    'assets_folder' => is_dir($root . '/assets') || is_dir($root . '/public/assets'),
    'main_js' => count($mainJs) > 0 ? basename($mainJs[0]) : null,
    'env_file' => file_exists($root . '/.env'),
    'api_folder' => is_dir($root . '/api'),
    'hint' => 'Upload ALL contents of dist/backend/ into public_html (not the dist folder itself).',
], JSON_PRETTY_PRINT);
