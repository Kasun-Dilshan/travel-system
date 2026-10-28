<?php
// php-backend/api/contact.php — public contact form → inbox email
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/mail.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(['message' => 'Method not allowed'], 405);
}

$data = getRequestBody();
if (!is_array($data)) {
    sendResponse(['message' => 'Invalid request body'], 400);
}

$message = trim((string) ($data['message'] ?? ''));
$senderEmail = trim((string) ($data['email'] ?? ''));
$senderName = trim((string) ($data['name'] ?? ''));

if ($message === '') {
    sendResponse(['message' => 'Message is required'], 400);
}

if (strlen($message) > 5000) {
    sendResponse(['message' => 'Message is too long'], 400);
}

if ($senderEmail !== '' && !filter_var($senderEmail, FILTER_VALIDATE_EMAIL)) {
    sendResponse(['message' => 'Invalid email address'], 400);
}

if (strlen($senderName) > 120) {
    sendResponse(['message' => 'Name is too long'], 400);
}

// Prefer site settings contact email, then env, then default inbox.
$to = '';
try {
    $stmt = $pdo->query('SELECT contactEmail FROM site_settings WHERE id = 1 LIMIT 1');
    $row = $stmt ? $stmt->fetch() : false;
    if ($row && !empty($row['contactEmail'])) {
        $to = trim((string) $row['contactEmail']);
    }
} catch (Throwable $e) {
    // fall through to env / default
}

if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    $envTo = getenv('BOOKING_NOTIFY_EMAIL');
    $to = ($envTo !== false && trim((string) $envTo) !== '')
        ? trim((string) $envTo)
        : 'ticketing@serendibgroups.com';
}

$ok = notifyContactMessage([
    'message' => $message,
    'email' => $senderEmail,
    'name' => $senderName,
], $to);

if (!$ok) {
    sendResponse(['message' => 'Unable to send email. Please try again later.'], 500);
}

sendResponse(['message' => 'Message sent successfully']);
