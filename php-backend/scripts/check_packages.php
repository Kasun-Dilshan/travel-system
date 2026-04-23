<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

$count = (int) $pdo->query('SELECT COUNT(*) FROM packages')->fetchColumn();
echo "packages_count\t" . $count . PHP_EOL;

$stmt = $pdo->query('SELECT id, title, category, price FROM packages ORDER BY id ASC LIMIT 20');
foreach ($stmt->fetchAll() as $row) {
    echo $row['id'] . "\t" . $row['title'] . "\t" . $row['category'] . "\t" . $row['price'] . PHP_EOL;
}

