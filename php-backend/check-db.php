<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/config/db.php';

$result = [
    'connected' => $pdo !== null,
    'host' => getenv('DB_HOST') ?: 'localhost',
    'port' => getenv('DB_PORT') ?: '3306',
    'database' => getenv('DB_NAME') ?: 'seredpjb_travel',
    'user' => getenv('DB_USER') ?: 'seredpjb_traveluser',
    'env_file' => file_exists(__DIR__ . '/.env'),
];

if ($pdo) {
    try {
        $version = $pdo->query('SELECT VERSION() AS v')->fetch();
        $tables = (int) $pdo->query(
            'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()'
        )->fetchColumn();
        $result['mysql_version'] = $version['v'] ?? null;
        $result['table_count'] = $tables;
        $result['message'] = 'Database connection successful';
    } catch (Throwable $e) {
        $result['connected'] = false;
        $result['error'] = $e->getMessage();
    }
} else {
    $result['error'] = 'Could not connect to MySQL. Verify DB_HOST, DB_USER, DB_PASS, and DB_NAME in .env';
}

echo json_encode($result, JSON_PRETTY_PRINT);
