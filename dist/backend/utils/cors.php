<?php
// php-backend/utils/cors.php

// Ensure API always returns JSON on errors (prevents "HTML instead of JSON").
// Works for uncaught exceptions (PDO errors, missing tables, etc.) and most PHP errors.
$__appDebug = getenv('APP_DEBUG');
$__appDebugEnabled = $__appDebug !== false && $__appDebug !== '' && $__appDebug !== '0' && strtolower((string)$__appDebug) !== 'false';

set_exception_handler(function (Throwable $e) use ($__appDebugEnabled) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'message' => 'Internal server error',
        'error' => $__appDebugEnabled ? $e->getMessage() : null,
    ]);
    exit;
});

set_error_handler(function ($severity, $message, $file, $line) use ($__appDebugEnabled) {
    // Respect @-suppression.
    if (!(error_reporting() & $severity)) {
        return false;
    }
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'message' => 'Internal server error',
        'error' => $__appDebugEnabled ? ($message . ' in ' . $file . ':' . $line) : null,
    ]);
    exit;
});

function handleCors() {
    // Allow from any origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }
}

function sendResponse($data, $status = 200) {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true);
}
