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

function getBearerToken() {
    $token = null;

    // Some SAPIs don't expose Authorization via getallheaders().
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $token = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $token = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } else {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $normalized = [];
        foreach ($headers as $k => $v) {
            $normalized[strtolower((string) $k)] = $v;
        }
        if (isset($normalized['authorization'])) {
            $token = $normalized['authorization'];
        }
    }

    if ($token && preg_match('/Bearer\s+(\S+)/i', $token, $matches)) {
        return $matches[1];
    }
    return null;
}

function isAdmin() {
    $token = getBearerToken();
    if (!$token) return false;
    $decoded = validateJWT($token, JWT_SECRET);
    return $decoded && isset($decoded['role']) && $decoded['role'] === 'admin';
}

function requireAdmin() {
    if (!isAdmin()) {
        header('Content-Type: application/json', true, 401);
        echo json_encode(['message' => 'Unauthorized']);
        exit;
    }
}
