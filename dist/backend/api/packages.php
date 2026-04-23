<?php
// php-backend/api/packages.php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];

/**
 * Cover image must be a single URL/path string. Some rows were saved with trailing
 * " []" (or a JSON array string) so the browser requested a non-existent path.
 */
function normalizePackageImage($value): string {
    if ($value === null) {
        return '';
    }
    if (is_array($value)) {
        foreach ($value as $item) {
            if (is_string($item) && trim($item) !== '') {
                return normalizePackageImage($item);
            }
        }
        return '';
    }
    $s = trim((string) $value);
    if ($s === '') {
        return '';
    }
    $s = preg_replace('/\s*\[\]\s*$/', '', $s) ?? $s;
    $s = trim($s);
    if ($s !== '' && $s[0] === '[') {
        $decoded = json_decode($s, true);
        if (is_array($decoded)) {
            foreach ($decoded as $item) {
                if (is_string($item) && trim($item) !== '') {
                    return normalizePackageImage($item);
                }
            }
        }
        return '';
    }
    // Fix common misspellings from older saves.
    // Keep it conservative: only rewrite the known bad segments.
    $s = preg_replace('#(^|/)(uplods)(/|$)#i', '$1uploads$3', $s) ?? $s;
    $s = preg_replace('#(^|/)(pakejes)(/|$)#i', '$1packages$3', $s) ?? $s;
    return $s;
}

// Helper to encode JSON fields
function prepareData($data) {
    $jsonFields = ['gallery', 'highlights', 'itinerary', 'inclusions', 'exclusions', 'localizations', 'route'];
    foreach ($jsonFields as $field) {
        if (isset($data[$field])) {
            $data[$field] = json_encode($data[$field]);
        }
    }
    if (array_key_exists('image', $data)) {
        $data['image'] = normalizePackageImage($data['image']);
    }
    return $data;
}

// Helper to decode JSON fields
function formatData($row) {
    $jsonFields = ['gallery', 'highlights', 'itinerary', 'inclusions', 'exclusions', 'localizations', 'route'];
    foreach ($jsonFields as $field) {
        if (isset($row[$field]) && !is_null($row[$field])) {
            $row[$field] = json_decode($row[$field], true);
        } else {
            $row[$field] = [];
        }
    }
    if (isset($row['image'])) {
        $row['image'] = normalizePackageImage($row['image']);
    }
    // Mongoose compatibility: _id vs id
    $row['_id'] = $row['id'];
    return $row;
}

function formatSeedRow(array $row): array {
    $row['gallery'] = isset($row['gallery']) && is_array($row['gallery']) ? $row['gallery'] : [];
    $row['highlights'] = isset($row['highlights']) && is_array($row['highlights']) ? $row['highlights'] : [];
    $row['itinerary'] = isset($row['itinerary']) && is_array($row['itinerary']) ? $row['itinerary'] : [];
    $row['inclusions'] = isset($row['inclusions']) && is_array($row['inclusions']) ? $row['inclusions'] : [];
    $row['exclusions'] = isset($row['exclusions']) && is_array($row['exclusions']) ? $row['exclusions'] : [];
    $row['localizations'] = isset($row['localizations']) && (is_array($row['localizations']) || is_object($row['localizations'])) ? $row['localizations'] : [];
    $row['route'] = isset($row['route']) && (is_array($row['route']) || is_object($row['route'])) ? $row['route'] : [];
    if (isset($row['image'])) {
        $row['image'] = normalizePackageImage($row['image']);
    }
    $row['_id'] = $row['id'] ?? null;
    return $row;
}

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $id = (int) $_GET['id'];
        if (!$pdo) {
            $seed = require __DIR__ . '/../data/packages_seed.php';
            foreach ($seed as $row) {
                if ((int) ($row['id'] ?? 0) === $id) {
                    sendResponse(formatSeedRow($row));
                }
            }
            sendResponse(['message' => 'Package not found'], 404);
        }

        $stmt = $pdo->prepare('SELECT * FROM packages WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) sendResponse(formatData($row));
        sendResponse(['message' => 'Package not found'], 404);
    } else {
        $category = $_GET['category'] ?? null;
        if (!$pdo) {
            $seed = require __DIR__ . '/../data/packages_seed.php';
            if ($category) {
                $seed = array_values(array_filter($seed, fn ($p) => isset($p['category']) && $p['category'] === $category));
            }
            sendResponse(array_map('formatSeedRow', $seed));
        }

        if ($category) {
            $stmt = $pdo->prepare('SELECT * FROM packages WHERE category = ? ORDER BY created_at DESC');
            $stmt->execute([$category]);
        } else {
            $stmt = $pdo->query('SELECT * FROM packages ORDER BY created_at DESC');
        }
        $rows = $stmt->fetchAll();
        sendResponse(array_map('formatData', $rows));
    }
} 
elseif ($method === 'POST') {
    requireAdmin();
    if (!$pdo) sendResponse(['message' => 'Database unavailable'], 503);
    $data = getRequestBody();
    $data = prepareData($data);

    $sql = "INSERT INTO packages (title, price, image, gallery, duration, description, highlights, itinerary, inclusions, exclusions, category, type, featured, localizations, route, isLimitedTime, discountPercentage, expiryDate, seoTitle, seoDescription) 
            VALUES (:title, :price, :image, :gallery, :duration, :description, :highlights, :itinerary, :inclusions, :exclusions, :category, :type, :featured, :localizations, :route, :isLimitedTime, :discountPercentage, :expiryDate, :seoTitle, :seoDescription)";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'title' => $data['title'],
            'price' => $data['price'],
            'image' => $data['image'],
            'gallery' => $data['gallery'] ?? '[]',
            'duration' => $data['duration'],
            'description' => $data['description'],
            'highlights' => $data['highlights'] ?? '[]',
            'itinerary' => $data['itinerary'] ?? '[]',
            'inclusions' => $data['inclusions'] ?? '[]',
            'exclusions' => $data['exclusions'] ?? '[]',
            'category' => $data['category'],
            'type' => $data['type'] ?? 'Day',
            'featured' => isset($data['featured']) ? (int)$data['featured'] : 0,
            'localizations' => $data['localizations'] ?? '{}',
            'route' => $data['route'] ?? '{}',
            'isLimitedTime' => isset($data['isLimitedTime']) ? (int)$data['isLimitedTime'] : 0,
            'discountPercentage' => $data['discountPercentage'] ?? 0,
            'expiryDate' => $data['expiryDate'] ?? null,
            'seoTitle' => $data['seoTitle'] ?? '',
            'seoDescription' => $data['seoDescription'] ?? ''
        ]);
        
        $id = $pdo->lastInsertId();
        // Fetch and return the full object for frontend sync
        $stmt = $pdo->prepare('SELECT * FROM packages WHERE id = ?');
        $stmt->execute([$id]);
        $newPackage = formatData($stmt->fetch());
        sendResponse($newPackage, 201);
    } catch (Exception $e) {
        sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
    }
}
elseif ($method === 'PUT') {
    requireAdmin();
    if (!$pdo) sendResponse(['message' => 'Database unavailable'], 503);
    $data = getRequestBody();
    if (!isset($data['id']) && !isset($_GET['id'])) {
        sendResponse(['message' => 'ID is required'], 400);
    }
    $id = $_GET['id'] ?? $data['id'];
    $data = prepareData($data);

    $sql = "UPDATE packages SET 
            title = :title, price = :price, image = :image, gallery = :gallery, 
            duration = :duration, description = :description, highlights = :highlights, 
            itinerary = :itinerary, inclusions = :inclusions, exclusions = :exclusions, 
            category = :category, type = :type, featured = :featured, 
            localizations = :localizations, route = :route, isLimitedTime = :isLimitedTime, 
            discountPercentage = :discountPercentage, expiryDate = :expiryDate, 
            seoTitle = :seoTitle, seoDescription = :seoDescription 
            WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $id,
            'title' => $data['title'],
            'price' => $data['price'],
            'image' => $data['image'],
            'gallery' => $data['gallery'] ?? '[]',
            'duration' => $data['duration'],
            'description' => $data['description'],
            'highlights' => $data['highlights'] ?? '[]',
            'itinerary' => $data['itinerary'] ?? '[]',
            'inclusions' => $data['inclusions'] ?? '[]',
            'exclusions' => $data['exclusions'] ?? '[]',
            'category' => $data['category'],
            'type' => $data['type'] ?? 'Day',
            'featured' => isset($data['featured']) ? (int)$data['featured'] : 0,
            'localizations' => $data['localizations'] ?? '{}',
            'route' => $data['route'] ?? '{}',
            'isLimitedTime' => isset($data['isLimitedTime']) ? (int)$data['isLimitedTime'] : 0,
            'discountPercentage' => $data['discountPercentage'] ?? 0,
            'expiryDate' => $data['expiryDate'] ?? null,
            'seoTitle' => $data['seoTitle'] ?? '',
            'seoDescription' => $data['seoDescription'] ?? ''
        ]);
        
        // Fetch and return the full object for frontend sync
        $stmt = $pdo->prepare('SELECT * FROM packages WHERE id = ?');
        $stmt->execute([$id]);
        $updatedPackage = formatData($stmt->fetch());
        sendResponse($updatedPackage);
    } catch (Exception $e) {
        sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
    }
}
elseif ($method === 'DELETE') {
    requireAdmin();
    if (!$pdo) sendResponse(['message' => 'Database unavailable'], 503);
    $id = $_GET['id'] ?? null;
    if (!$id) {
        sendResponse(['message' => 'ID is required'], 400);
    }
    
    $stmt = $pdo->prepare('DELETE FROM packages WHERE id = ?');
    $stmt->execute([$id]);
    sendResponse(['message' => 'Package deleted']);
}
else {
    sendResponse(['message' => 'Method not allowed'], 405);
}
