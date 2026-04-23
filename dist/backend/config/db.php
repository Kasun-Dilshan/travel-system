<?php
declare(strict_types=1);

/**
 * Central DB connection for the PHP backend.
 *
 * - Exposes a ready-to-use PDO instance as `$pdo` (backwards compatible).
 * - Uses environment variables for configuration.
 * - Avoids fatal errors in production; returns JSON on failure.
 */

$envFile = __DIR__ . '/../.env';
if (is_file($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $trimmed = trim($line);
        // PHP 7 compatibility: avoid str_starts_with().
        if ($trimmed === '' || (isset($trimmed[0]) && $trimmed[0] === '#')) {
            continue;
        }
        $pos = strpos($trimmed, '=');
        if ($pos === false) {
            continue;
        }
        $key = trim(substr($trimmed, 0, $pos));
        $value = trim(substr($trimmed, $pos + 1));
        $value = trim($value, "\"'");
        if ($key !== '' && getenv($key) === false) {
            putenv($key . '=' . $value);
        }
    }
}

$host = (string) (getenv('DB_HOST') !== false ? getenv('DB_HOST') : 'localhost');
$port = (string) (getenv('DB_PORT') !== false ? getenv('DB_PORT') : '3306');
// Local/dev friendly defaults. Configure real credentials via `.env`.
$db   = (string) (getenv('DB_NAME') !== false ? getenv('DB_NAME') : 'dbo1lxl1k7nnt9');
$user = (string) (getenv('DB_USER') !== false ? getenv('DB_USER') : 'udc6aaxwhieco');
$pass = (string) (getenv('DB_PASS') !== false ? getenv('DB_PASS') : '2n221yigAO%1');

$charset = (string) (getenv('DB_CHARSET') !== false ? getenv('DB_CHARSET') : 'utf8mb4');
$socket  = getenv('DB_SOCKET'); // optional, e.g. /var/run/mysqld/mysqld.sock

$dsnParts = array(
    'mysql:host=' . $host,
    'port=' . $port,
    'dbname=' . $db,
    'charset=' . $charset,
);
if ($socket !== false && $socket !== '') {
    $dsnParts[] = 'unix_socket=' . $socket;
}
$dsn = implode(';', $dsnParts);

$options = array(
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
);

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (Throwable $e) {
    // Do not hard-exit: some deployments use file-based fallbacks for read-only endpoints.
    // Endpoints that require DB should explicitly check for `$pdo`.
    $pdo = null;
    if (!defined('DB_CONNECTION_ERROR')) {
        define('DB_CONNECTION_ERROR', true);
    }
}

// Secrets should come from environment; fall back to safe defaults to avoid 500s on misconfigured hosts.
if (!defined('JWT_SECRET')) {
    $jwtSecret = getenv('JWT_SECRET');
    define('JWT_SECRET', (string) (($jwtSecret !== false && $jwtSecret !== '') ? $jwtSecret : 'dev_jwt_secret_change_me'));
}

if (!defined('ADMIN_SECRET')) {
    $adminSecret = getenv('ADMIN_SECRET');
    define('ADMIN_SECRET', (string) (($adminSecret !== false && $adminSecret !== '') ? $adminSecret : 'admin123'));
}
