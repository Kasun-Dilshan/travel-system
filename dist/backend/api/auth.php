<?php
// php-backend/api/auth.php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getRequestBody();
    $password = $data['password'] ?? '';

    if (!$password || $password !== ADMIN_SECRET) {
        sendResponse(['message' => 'Invalid credentials'], 401);
    }

    $payload = [
        'role' => 'admin',
        'iat' => time(),
        'exp' => time() + (8 * 3600) // 8 hours
    ];

    $token = generateJWT($payload, JWT_SECRET);

    sendResponse([
        'token' => $token,
        'message' => 'Login successful'
    ]);
} else {
    sendResponse(['message' => 'Method not allowed'], 405);
}
