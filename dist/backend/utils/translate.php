<?php
declare(strict_types=1);

/**
 * Minimal translation helper for dynamic content.
 *
 * This is intentionally dependency-free (no composer). It calls an external
 * LibreTranslate-compatible endpoint (Argos/OpenTranslate style).
 *
 * Configure via env:
 * - TRANSLATE_ENDPOINT: e.g. https://translate.argosopentech.com/translate
 * - TRANSLATE_API_KEY: optional
 * - TRANSLATE_SOURCE: default source language (default "en")
 *
 * Notes:
 * - If the service fails, we return null and callers should fall back.
 * - We keep requests small by batching lists into one call when possible.
 */

function translate_endpoints(): array {
    // Allow multiple endpoints (comma separated) for reliability.
    // Example:
    // TRANSLATE_ENDPOINTS="https://translate.argosopentech.com/translate,https://libre.realting.com/translate"
    $eps = getenv('TRANSLATE_ENDPOINTS');
    $eps = is_string($eps) ? trim($eps) : '';
    if ($eps !== '') {
        $parts = array_values(array_filter(array_map('trim', explode(',', $eps))));
        if (count($parts)) return $parts;
    }

    $ep = getenv('TRANSLATE_ENDPOINT');
    $ep = is_string($ep) ? trim($ep) : '';
    if ($ep !== '') return [$ep];

    // Defaults (LibreTranslate-compatible instances). Order matters.
    return [
        'https://translate.argosopentech.com/translate',
        'https://libre.realting.com/translate',
    ];
}

function translate_api_key(): string {
    $k = getenv('TRANSLATE_API_KEY');
    return is_string($k) ? trim($k) : '';
}

function translate_default_source(): string {
    $s = getenv('TRANSLATE_SOURCE');
    $s = is_string($s) ? trim($s) : '';
    return $s !== '' ? $s : 'en';
}

function translate_insecure_ssl(): bool {
    $v = getenv('TRANSLATE_INSECURE_SSL');
    if ($v !== false) {
        $s = strtolower(trim((string) $v));
        return $s === '1' || $s === 'true' || $s === 'yes' || $s === 'on';
    }
    // Windows PHP often lacks a CA bundle in default setups.
    return defined('PHP_OS_FAMILY') && PHP_OS_FAMILY === 'Windows';
}

function translate_http_json(string $url, array $payload, int $timeoutSeconds = 12): ?array {
    $json = json_encode($payload);
    if (!is_string($json)) return null;

    // Prefer cURL when available (more consistent TLS + error reporting).
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if ($ch === false) return null;

        $headers = [
            'Content-Type: application/json',
            'Accept: application/json',
        ];

        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeoutSeconds);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, min(6, $timeoutSeconds));
        if (translate_insecure_ssl()) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        }

        $raw = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($raw === false || $status < 200 || $status >= 300) {
            return null;
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : null;
    }

    // Fallback: file_get_contents for hosts without cURL.
    // If allow_url_fopen is disabled, this will fail; caller will try another endpoint.
    $headersStr = "Content-Type: application/json\r\nAccept: application/json\r\n";
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => $headersStr,
            'content' => $json,
            'timeout' => $timeoutSeconds,
            'ignore_errors' => true, // allow reading body on non-2xx
        ],
        'ssl' => translate_insecure_ssl()
            ? [
                'verify_peer' => false,
                'verify_peer_name' => false,
              ]
            : [],
    ]);

    $raw = @file_get_contents($url, false, $ctx);
    if (!is_string($raw) || $raw === '') return null;

    // Parse status code from response headers if present.
    $status = 0;
    if (isset($http_response_header) && is_array($http_response_header) && isset($http_response_header[0])) {
        if (preg_match('#HTTP/\S+\s+(\d{3})#', (string) $http_response_header[0], $m)) {
            $status = (int) $m[1];
        }
    }
    if ($status !== 0 && ($status < 200 || $status >= 300)) return null;

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

/**
 * Translate a single string. Returns null on failure.
 */
function translate_text(string $text, string $target, ?string $source = null): ?string {
    $text = trim($text);
    $target = trim(strtolower($target));
    if ($text === '' || $target === '') return null;
    if ($target === 'en') return $text;

    $source = $source ? trim(strtolower($source)) : translate_default_source();

    $payload = [
        'q' => $text,
        'source' => $source ?: 'auto',
        'target' => $target,
        'format' => 'text',
    ];
    $apiKey = translate_api_key();
    if ($apiKey !== '') {
        $payload['api_key'] = $apiKey;
    }

    $res = null;
    foreach (translate_endpoints() as $ep) {
        $res = translate_http_json($ep, $payload);
        if ($res) break;
    }
    if (!$res) return null;
    if (isset($res['translatedText']) && is_string($res['translatedText'])) {
        return $res['translatedText'];
    }
    // Some instances return { translation: "..." }
    if (isset($res['translation']) && is_string($res['translation'])) {
        return $res['translation'];
    }
    return null;
}

/**
 * Translate a list of strings in one request by joining with a delimiter.
 * Returns null on failure.
 */
function translate_list(array $texts, string $target, ?string $source = null): ?array {
    $target = trim(strtolower($target));
    if ($target === '') return null;
    if ($target === 'en') return $texts;

    $clean = [];
    foreach ($texts as $t) {
        $s = is_string($t) ? trim($t) : '';
        $clean[] = $s;
    }
    if (!count($clean)) return [];

    // Use a delimiter unlikely to appear in content.
    $delimiter = "\n<<<__SPLIT__>>>\n";
    $joined = implode($delimiter, $clean);
    $translated = translate_text($joined, $target, $source);
    if ($translated === null) return null;

    $parts = explode($delimiter, $translated);
    // If the translator altered the delimiter, fall back to per-item translation.
    if (count($parts) !== count($clean)) {
        $out = [];
        foreach ($clean as $t) {
            if ($t === '') { $out[] = ''; continue; }
            $one = translate_text($t, $target, $source);
            if ($one === null) return null;
            $out[] = $one;
        }
        return $out;
    }
    return $parts;
}

