<?php
// php-backend/utils/auth.php

function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    $data = str_replace(['-', '_'], ['+', '/'], $data);
    return base64_decode($data);
}

function generateJWT($payload, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode(json_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64UrlEncode($signature);
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function validateJWT($token, $secret) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    list($header, $payload, $signature) = $parts;
    $validSignature = base64UrlEncode(hash_hmac('sha256', $header . "." . $payload, $secret, true));

    if ($signature !== $validSignature) return false;

    $payloadJson = base64UrlDecode($payload);
    if ($payloadJson === false) return false;
    $data = json_decode($payloadJson, true);
    if (!is_array($data)) return false;
    if (isset($data['exp']) && $data['exp'] < time()) return false;

    return $data;
}

/**
 * Normalize raw header/body values into a bare JWT string (or null).
 */
function normalizeAuthToken($raw) {
    if (!is_string($raw)) return null;
    $raw = trim($raw);
    if ($raw === '') return null;
    if (preg_match('/Bearer\s+(\S+)/i', $raw, $matches)) {
        return $matches[1];
    }
    // Already a bare JWT (three base64url segments).
    if (substr_count($raw, '.') === 2) {
        return $raw;
    }
    return $raw;
}

/**
 * Collect JWT candidates from Authorization, X-Admin-Token, and multipart body.
 * Order matters for preference, but isAdmin() validates each until one works.
 */
function getAuthTokenCandidates() {
    $candidates = [];

    $authHeader = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } else {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $normalized = [];
        foreach ($headers as $k => $v) {
            $normalized[strtolower((string) $k)] = $v;
        }
        if (isset($normalized['authorization'])) {
            $authHeader = $normalized['authorization'];
        }
    }
    $t = normalizeAuthToken($authHeader);
    if ($t !== null) $candidates[] = $t;

    // Multipart uploads: many Apache/CGI setups strip Authorization.
    $xt = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    $t = normalizeAuthToken($xt);
    if ($t !== null) $candidates[] = $t;

    // Also check common alternate CGI env names for the custom header.
    foreach (['REDIRECT_HTTP_X_ADMIN_TOKEN', 'HTTP_X_ADMINTOKEN'] as $key) {
        if (!empty($_SERVER[$key])) {
            $t = normalizeAuthToken($_SERVER[$key]);
            if ($t !== null) $candidates[] = $t;
        }
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['admin_token'])) {
        $t = normalizeAuthToken($_POST['admin_token']);
        if ($t !== null) $candidates[] = $t;
    }

    // Unique while preserving order.
    $unique = [];
    $seen = [];
    foreach ($candidates as $c) {
        if (isset($seen[$c])) continue;
        $seen[$c] = true;
        $unique[] = $c;
    }
    return $unique;
}

function getBearerToken() {
    $candidates = getAuthTokenCandidates();
    return $candidates[0] ?? null;
}

function isAdmin() {
    if (!defined('JWT_SECRET')) {
        return false;
    }
    foreach (getAuthTokenCandidates() as $token) {
        $decoded = validateJWT($token, JWT_SECRET);
        if ($decoded && isset($decoded['role']) && $decoded['role'] === 'admin') {
            return true;
        }
    }
    return false;
}

function requireAdmin() {
    if (!isAdmin()) {
        header('Content-Type: application/json', true, 401);
        echo json_encode(['message' => 'Unauthorized']);
        exit;
    }
}
