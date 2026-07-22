<?php
// php-backend/api/destinations.php
// Public GET returns region → country tree. Admin POST/PUT/DELETE manage catalog.
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];
$entity = strtolower(trim((string) ($_GET['entity'] ?? '')));

/**
 * Create destination tables if missing (safe to call repeatedly).
 */
function ensureDestinationTables($pdo): void {
    static $done = false;
    if ($done || !$pdo) return;
    $done = true;
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS regions (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image VARCHAR(255) DEFAULT '',
            sortOrder INT DEFAULT 0,
            localizations JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");
        $pdo->exec("CREATE TABLE IF NOT EXISTS countries (
            id VARCHAR(64) PRIMARY KEY,
            regionId VARCHAR(64) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            fullDescription TEXT,
            image VARCHAR(255) DEFAULT '',
            images JSON,
            matchKeys JSON,
            facts JSON,
            tips JSON,
            highlights JSON,
            sortOrder INT DEFAULT 0,
            localizations JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_countries_regionId (regionId),
            CONSTRAINT fk_countries_regionId FOREIGN KEY (regionId)
                REFERENCES regions(id) ON DELETE CASCADE
        )");
    } catch (Throwable $e) {
        // Non-fatal here; later queries will surface a clear error.
    }
}

function slugifyDestinationId(string $value): string {
    $s = strtolower(trim($value));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    $s = trim($s, '-');
    return $s !== '' ? $s : 'item';
}

function decodeJsonCol($value, $fallback = []) {
    if (is_array($value)) return $value;
    if ($value === null || $value === '') return $fallback;
    $decoded = json_decode((string) $value, true);
    return is_array($decoded) ? $decoded : $fallback;
}

function encodeJsonCol($value): string {
    return json_encode(is_array($value) ? $value : [], JSON_UNESCAPED_UNICODE);
}

function formatRegionRow(array $row): array {
    $row['localizations'] = decodeJsonCol($row['localizations'] ?? null, []);
    $row['sortOrder'] = (int) ($row['sortOrder'] ?? 0);
    $row['image'] = (string) ($row['image'] ?? '');
    $row['description'] = (string) ($row['description'] ?? '');
    $row['_id'] = $row['id'];
    $row['countries'] = $row['countries'] ?? [];
    return $row;
}

function formatCountryRow(array $row): array {
    $row['images'] = decodeJsonCol($row['images'] ?? null, []);
    $row['matchKeys'] = decodeJsonCol($row['matchKeys'] ?? null, []);
    $row['facts'] = decodeJsonCol($row['facts'] ?? null, []);
    $row['tips'] = decodeJsonCol($row['tips'] ?? null, []);
    $row['highlights'] = decodeJsonCol($row['highlights'] ?? null, []);
    $row['localizations'] = decodeJsonCol($row['localizations'] ?? null, []);
    $row['sortOrder'] = (int) ($row['sortOrder'] ?? 0);
    $row['image'] = (string) ($row['image'] ?? '');
    $row['description'] = (string) ($row['description'] ?? '');
    $row['fullDescription'] = (string) ($row['fullDescription'] ?? '');
    $row['_id'] = $row['id'];
    return $row;
}

function defaultDestinationSeed(): array {
    return [
        [
            'id' => 'asia',
            'name' => 'Asia',
            'description' => 'Temples, neon cities, desert luxury, and vibrant food cultures.',
            'image' => '',
            'sortOrder' => 0,
            'localizations' => [],
            'countries' => [
                [
                    'id' => 'japan',
                    'name' => 'Japan',
                    'description' => 'Neon streets and ancient culture.',
                    'fullDescription' => 'Japan blends neon districts with serene shrines, world-class cuisine, and meticulous design.',
                    'image' => '',
                    'matchKeys' => ['japan', 'tokyo', 'osaka', 'kyoto'],
                    'facts' => [
                        ['label' => 'Continent', 'value' => 'Asia'],
                        ['label' => 'Capital', 'value' => 'Tokyo'],
                        ['label' => 'Best time', 'value' => 'Mar–May, Oct–Nov'],
                        ['label' => 'Highlights', 'value' => 'Temples, cuisine, neon cities'],
                    ],
                    'tips' => [
                        ['label' => 'Capital', 'value' => 'Tokyo'],
                        ['label' => 'Language', 'value' => 'Japanese'],
                        ['label' => 'Currency', 'value' => 'Japanese Yen'],
                        ['label' => 'Religion', 'value' => 'Shinto and Buddhism'],
                        ['label' => 'Time Zone', 'value' => 'UTC+9'],
                        ['label' => 'Best time', 'value' => 'Mar–May, Oct–Nov'],
                    ],
                    'sortOrder' => 0,
                ],
                [
                    'id' => 'uae',
                    'name' => 'United Arab Emirates',
                    'description' => 'Futuristic skylines and desert luxury.',
                    'fullDescription' => 'The UAE blends ultramodern architecture with Arabian heritage.',
                    'image' => '',
                    'matchKeys' => ['uae', 'dubai', 'abu dhabi', 'emirates'],
                    'facts' => [
                        ['label' => 'Continent', 'value' => 'Asia'],
                        ['label' => 'Capital', 'value' => 'Abu Dhabi'],
                        ['label' => 'Best time', 'value' => 'Nov–Mar'],
                        ['label' => 'Highlights', 'value' => 'Burj Khalifa, desert safari'],
                    ],
                    'tips' => [
                        ['label' => 'Capital', 'value' => 'Abu Dhabi'],
                        ['label' => 'Language', 'value' => 'Arabic'],
                        ['label' => 'Currency', 'value' => 'UAE Dirham'],
                        ['label' => 'Religion', 'value' => 'Islam'],
                        ['label' => 'Time Zone', 'value' => 'UTC+4'],
                        ['label' => 'Best time', 'value' => 'Nov–Mar'],
                    ],
                    'sortOrder' => 1,
                ],
                [
                    'id' => 'singapore',
                    'name' => 'Singapore',
                    'description' => 'A garden city with vibrant beats.',
                    'fullDescription' => 'Singapore is a compact city-state of hawker food, gardens, and diverse neighborhoods.',
                    'image' => '',
                    'matchKeys' => ['singapore'],
                    'facts' => [
                        ['label' => 'Continent', 'value' => 'Asia'],
                        ['label' => 'Capital', 'value' => 'Singapore'],
                        ['label' => 'Best time', 'value' => 'Year-round (Feb–Apr drier)'],
                        ['label' => 'Highlights', 'value' => 'Gardens, food, Marina Bay'],
                    ],
                    'tips' => [
                        ['label' => 'Capital', 'value' => 'Singapore'],
                        ['label' => 'Language', 'value' => 'English, Malay, Mandarin, Tamil'],
                        ['label' => 'Currency', 'value' => 'Singapore Dollar'],
                        ['label' => 'Religion', 'value' => 'Multi-religious'],
                        ['label' => 'Time Zone', 'value' => 'UTC+8'],
                        ['label' => 'Best time', 'value' => 'Year-round'],
                    ],
                    'sortOrder' => 2,
                ],
            ],
        ],
        [
            'id' => 'europe',
            'name' => 'Europe',
            'description' => 'Historic capitals, romance, art, and timeless landmarks.',
            'image' => '',
            'sortOrder' => 1,
            'localizations' => [],
            'countries' => [
                [
                    'id' => 'france',
                    'name' => 'France',
                    'description' => 'The land of light, romance, and cuisine.',
                    'fullDescription' => 'France needs little introduction: Paris, café terraces, art, and world-famous cuisine.',
                    'image' => '',
                    'matchKeys' => ['france', 'paris', 'lyon', 'nice'],
                    'facts' => [
                        ['label' => 'Continent', 'value' => 'Europe'],
                        ['label' => 'Capital', 'value' => 'Paris'],
                        ['label' => 'Best time', 'value' => 'Apr–Jun, Sep–Oct'],
                        ['label' => 'Highlights', 'value' => 'Louvre, Eiffel Tower, cuisine'],
                    ],
                    'tips' => [
                        ['label' => 'Capital', 'value' => 'Paris'],
                        ['label' => 'Language', 'value' => 'French'],
                        ['label' => 'Currency', 'value' => 'Euro'],
                        ['label' => 'Religion', 'value' => 'Predominantly Christian'],
                        ['label' => 'Time Zone', 'value' => 'UTC+1'],
                        ['label' => 'Best time', 'value' => 'Apr–Jun, Sep–Oct'],
                    ],
                    'sortOrder' => 0,
                ],
                [
                    'id' => 'united-kingdom',
                    'name' => 'United Kingdom',
                    'description' => 'Historic landmarks and modern energy.',
                    'fullDescription' => 'The United Kingdom offers royal palaces, museums, theatre, and vibrant neighbourhoods.',
                    'image' => '',
                    'matchKeys' => ['united kingdom', 'uk', 'london', 'england', 'britain'],
                    'facts' => [
                        ['label' => 'Continent', 'value' => 'Europe'],
                        ['label' => 'Capital', 'value' => 'London'],
                        ['label' => 'Best time', 'value' => 'May–Sep'],
                        ['label' => 'Highlights', 'value' => 'Museums, theatre, markets'],
                    ],
                    'tips' => [
                        ['label' => 'Capital', 'value' => 'London'],
                        ['label' => 'Language', 'value' => 'English'],
                        ['label' => 'Currency', 'value' => 'Pound Sterling'],
                        ['label' => 'Religion', 'value' => 'Multi-faith'],
                        ['label' => 'Time Zone', 'value' => 'UTC+0'],
                        ['label' => 'Best time', 'value' => 'May–Sep'],
                    ],
                    'sortOrder' => 1,
                ],
            ],
        ],
    ];
}

function seedDestinationsIfEmpty($pdo): void {
    $count = (int) $pdo->query('SELECT COUNT(*) FROM regions')->fetchColumn();
    if ($count > 0) return;

    $seed = defaultDestinationSeed();
    $regionStmt = $pdo->prepare(
        'INSERT INTO regions (id, name, description, image, sortOrder, localizations)
         VALUES (:id, :name, :description, :image, :sortOrder, :localizations)'
    );
    $countryStmt = $pdo->prepare(
        'INSERT INTO countries
         (id, regionId, name, description, fullDescription, image, images, matchKeys, facts, tips, highlights, sortOrder, localizations)
         VALUES
         (:id, :regionId, :name, :description, :fullDescription, :image, :images, :matchKeys, :facts, :tips, :highlights, :sortOrder, :localizations)'
    );

    foreach ($seed as $region) {
        $regionStmt->execute([
            'id' => $region['id'],
            'name' => $region['name'],
            'description' => $region['description'] ?? '',
            'image' => $region['image'] ?? '',
            'sortOrder' => (int) ($region['sortOrder'] ?? 0),
            'localizations' => encodeJsonCol($region['localizations'] ?? []),
        ]);
        foreach ($region['countries'] as $country) {
            $countryStmt->execute([
                'id' => $country['id'],
                'regionId' => $region['id'],
                'name' => $country['name'],
                'description' => $country['description'] ?? '',
                'fullDescription' => $country['fullDescription'] ?? '',
                'image' => $country['image'] ?? '',
                'images' => encodeJsonCol($country['images'] ?? []),
                'matchKeys' => encodeJsonCol($country['matchKeys'] ?? []),
                'facts' => encodeJsonCol($country['facts'] ?? []),
                'tips' => encodeJsonCol($country['tips'] ?? []),
                'highlights' => encodeJsonCol($country['highlights'] ?? []),
                'sortOrder' => (int) ($country['sortOrder'] ?? 0),
                'localizations' => encodeJsonCol($country['localizations'] ?? []),
            ]);
        }
    }
}

function fetchDestinationTree($pdo): array {
    $regions = $pdo->query('SELECT * FROM regions ORDER BY sortOrder ASC, name ASC')->fetchAll();
    $countries = $pdo->query('SELECT * FROM countries ORDER BY sortOrder ASC, name ASC')->fetchAll();

    $byRegion = [];
    foreach ($countries as $country) {
        $formatted = formatCountryRow($country);
        $rid = $formatted['regionId'];
        if (!isset($byRegion[$rid])) $byRegion[$rid] = [];
        $byRegion[$rid][] = $formatted;
    }

    return array_map(function ($region) use ($byRegion) {
        $formatted = formatRegionRow($region);
        $formatted['countries'] = $byRegion[$formatted['id']] ?? [];
        return $formatted;
    }, $regions);
}

function fetchRegionById($pdo, string $id): ?array {
    $stmt = $pdo->prepare('SELECT * FROM regions WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) return null;
    $formatted = formatRegionRow($row);
    $cStmt = $pdo->prepare('SELECT * FROM countries WHERE regionId = ? ORDER BY sortOrder ASC, name ASC');
    $cStmt->execute([$id]);
    $formatted['countries'] = array_map('formatCountryRow', $cStmt->fetchAll());
    return $formatted;
}

function fetchCountryById($pdo, string $id): ?array {
    $stmt = $pdo->prepare('SELECT * FROM countries WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? formatCountryRow($row) : null;
}

function parseMatchKeys($raw): array {
    if (is_array($raw)) {
        return array_values(array_filter(array_map(function ($k) {
            return trim((string) $k);
        }, $raw), fn ($k) => $k !== ''));
    }
    if (is_string($raw)) {
        $parts = preg_split('/[,\\n]+/', $raw) ?: [];
        return array_values(array_filter(array_map('trim', $parts), fn ($k) => $k !== ''));
    }
    return [];
}

if (!$pdo) {
    if ($method === 'GET') {
        sendResponse(defaultDestinationSeed());
    }
    sendResponse(['message' => 'Database unavailable. Configure DB credentials to manage destinations.'], 503);
}

ensureDestinationTables($pdo);
seedDestinationsIfEmpty($pdo);

if ($method === 'GET') {
    sendResponse(fetchDestinationTree($pdo));
}

if ($method === 'POST') {
    requireAdmin();
    $data = getRequestBody() ?: [];

    if ($entity === 'region' || $entity === 'regions') {
        $id = slugifyDestinationId((string) ($data['id'] ?? $data['name'] ?? ''));
        $name = trim((string) ($data['name'] ?? ''));
        if ($name === '') sendResponse(['message' => 'Region name is required'], 400);
        if ($id === '') sendResponse(['message' => 'Region id is required'], 400);

        $exists = $pdo->prepare('SELECT id FROM regions WHERE id = ?');
        $exists->execute([$id]);
        if ($exists->fetch()) sendResponse(['message' => 'Region id already exists'], 400);

        $maxSort = (int) $pdo->query('SELECT COALESCE(MAX(sortOrder), -1) FROM regions')->fetchColumn();
        $stmt = $pdo->prepare(
            'INSERT INTO regions (id, name, description, image, sortOrder, localizations)
             VALUES (:id, :name, :description, :image, :sortOrder, :localizations)'
        );
        try {
            $stmt->execute([
                'id' => $id,
                'name' => $name,
                'description' => trim((string) ($data['description'] ?? '')),
                'image' => trim((string) ($data['image'] ?? '')),
                'sortOrder' => isset($data['sortOrder']) ? (int) $data['sortOrder'] : ($maxSort + 1),
                'localizations' => encodeJsonCol($data['localizations'] ?? []),
            ]);
            sendResponse(fetchRegionById($pdo, $id), 201);
        } catch (Exception $e) {
            sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
        }
    }

    if ($entity === 'country' || $entity === 'countries') {
        $regionId = slugifyDestinationId((string) ($data['regionId'] ?? $data['continentId'] ?? ''));
        $id = slugifyDestinationId((string) ($data['id'] ?? $data['name'] ?? ''));
        $name = trim((string) ($data['name'] ?? ''));
        if ($regionId === '') sendResponse(['message' => 'Region is required'], 400);
        if ($name === '') sendResponse(['message' => 'Country name is required'], 400);
        if ($id === '') sendResponse(['message' => 'Country id is required'], 400);

        $regionExists = $pdo->prepare('SELECT id FROM regions WHERE id = ?');
        $regionExists->execute([$regionId]);
        if (!$regionExists->fetch()) sendResponse(['message' => 'Region not found'], 404);

        $exists = $pdo->prepare('SELECT id FROM countries WHERE id = ?');
        $exists->execute([$id]);
        if ($exists->fetch()) sendResponse(['message' => 'Country id already exists'], 400);

        $sortStmt = $pdo->prepare('SELECT COALESCE(MAX(sortOrder), -1) FROM countries WHERE regionId = ?');
        $sortStmt->execute([$regionId]);
        $maxSort = (int) $sortStmt->fetchColumn();

        $image = trim((string) ($data['image'] ?? ''));
        $images = $data['images'] ?? ($image !== '' ? [$image] : []);
        if (!is_array($images)) $images = [];

        $stmt = $pdo->prepare(
            'INSERT INTO countries
             (id, regionId, name, description, fullDescription, image, images, matchKeys, facts, tips, highlights, sortOrder, localizations)
             VALUES
             (:id, :regionId, :name, :description, :fullDescription, :image, :images, :matchKeys, :facts, :tips, :highlights, :sortOrder, :localizations)'
        );
        try {
            $stmt->execute([
                'id' => $id,
                'regionId' => $regionId,
                'name' => $name,
                'description' => trim((string) ($data['description'] ?? '')),
                'fullDescription' => trim((string) ($data['fullDescription'] ?? '')),
                'image' => $image,
                'images' => encodeJsonCol($images),
                'matchKeys' => encodeJsonCol(parseMatchKeys($data['matchKeys'] ?? [])),
                'facts' => encodeJsonCol($data['facts'] ?? []),
                'tips' => encodeJsonCol($data['tips'] ?? []),
                'highlights' => encodeJsonCol($data['highlights'] ?? []),
                'sortOrder' => isset($data['sortOrder']) ? (int) $data['sortOrder'] : ($maxSort + 1),
                'localizations' => encodeJsonCol($data['localizations'] ?? []),
            ]);
            sendResponse(fetchCountryById($pdo, $id), 201);
        } catch (Exception $e) {
            sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
        }
    }

    sendResponse(['message' => 'entity query required: region or country'], 400);
}

if ($method === 'PUT') {
    requireAdmin();
    $data = getRequestBody() ?: [];
    $id = slugifyDestinationId((string) ($_GET['id'] ?? $data['id'] ?? ''));
    if ($id === '') sendResponse(['message' => 'ID required'], 400);

    if ($entity === 'region' || $entity === 'regions') {
        $existing = fetchRegionById($pdo, $id);
        if (!$existing) sendResponse(['message' => 'Region not found'], 404);

        $name = trim((string) ($data['name'] ?? $existing['name'] ?? ''));
        if ($name === '') sendResponse(['message' => 'Region name is required'], 400);

        $stmt = $pdo->prepare(
            'UPDATE regions SET name = :name, description = :description, image = :image,
             sortOrder = :sortOrder, localizations = :localizations WHERE id = :id'
        );
        try {
            $stmt->execute([
                'id' => $id,
                'name' => $name,
                'description' => trim((string) ($data['description'] ?? $existing['description'] ?? '')),
                'image' => trim((string) ($data['image'] ?? $existing['image'] ?? '')),
                'sortOrder' => isset($data['sortOrder']) ? (int) $data['sortOrder'] : (int) ($existing['sortOrder'] ?? 0),
                'localizations' => encodeJsonCol($data['localizations'] ?? $existing['localizations'] ?? []),
            ]);
            sendResponse(fetchRegionById($pdo, $id));
        } catch (Exception $e) {
            sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
        }
    }

    if ($entity === 'country' || $entity === 'countries') {
        $existing = fetchCountryById($pdo, $id);
        if (!$existing) sendResponse(['message' => 'Country not found'], 404);

        $regionId = slugifyDestinationId((string) ($data['regionId'] ?? $data['continentId'] ?? $existing['regionId'] ?? ''));
        $name = trim((string) ($data['name'] ?? $existing['name'] ?? ''));
        if ($regionId === '') sendResponse(['message' => 'Region is required'], 400);
        if ($name === '') sendResponse(['message' => 'Country name is required'], 400);

        $regionExists = $pdo->prepare('SELECT id FROM regions WHERE id = ?');
        $regionExists->execute([$regionId]);
        if (!$regionExists->fetch()) sendResponse(['message' => 'Region not found'], 404);

        $image = trim((string) ($data['image'] ?? $existing['image'] ?? ''));
        $images = $data['images'] ?? $existing['images'] ?? ($image !== '' ? [$image] : []);
        if (!is_array($images)) $images = [];

        $stmt = $pdo->prepare(
            'UPDATE countries SET
             regionId = :regionId, name = :name, description = :description, fullDescription = :fullDescription,
             image = :image, images = :images, matchKeys = :matchKeys, facts = :facts, tips = :tips,
             highlights = :highlights, sortOrder = :sortOrder, localizations = :localizations
             WHERE id = :id'
        );
        try {
            $stmt->execute([
                'id' => $id,
                'regionId' => $regionId,
                'name' => $name,
                'description' => trim((string) ($data['description'] ?? $existing['description'] ?? '')),
                'fullDescription' => trim((string) ($data['fullDescription'] ?? $existing['fullDescription'] ?? '')),
                'image' => $image,
                'images' => encodeJsonCol($images),
                'matchKeys' => encodeJsonCol(isset($data['matchKeys']) ? parseMatchKeys($data['matchKeys']) : ($existing['matchKeys'] ?? [])),
                'facts' => encodeJsonCol($data['facts'] ?? $existing['facts'] ?? []),
                'tips' => encodeJsonCol($data['tips'] ?? $existing['tips'] ?? []),
                'highlights' => encodeJsonCol($data['highlights'] ?? $existing['highlights'] ?? []),
                'sortOrder' => isset($data['sortOrder']) ? (int) $data['sortOrder'] : (int) ($existing['sortOrder'] ?? 0),
                'localizations' => encodeJsonCol($data['localizations'] ?? $existing['localizations'] ?? []),
            ]);

            // Keep package links consistent if country moved between regions.
            if ($regionId !== ($existing['regionId'] ?? '')) {
                try {
                    $upd = $pdo->prepare('UPDATE packages SET continentId = ? WHERE countryId = ?');
                    $upd->execute([$regionId, $id]);
                } catch (Throwable $e) {
                    // Ignore if packages table/columns missing.
                }
            }

            sendResponse(fetchCountryById($pdo, $id));
        } catch (Exception $e) {
            sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
        }
    }

    sendResponse(['message' => 'entity query required: region or country'], 400);
}

if ($method === 'DELETE') {
    requireAdmin();
    $id = slugifyDestinationId((string) ($_GET['id'] ?? ''));
    if ($id === '') sendResponse(['message' => 'ID required'], 400);

    if ($entity === 'region' || $entity === 'regions') {
        $existing = fetchRegionById($pdo, $id);
        if (!$existing) sendResponse(['message' => 'Region not found'], 404);

        try {
            $pkgCount = $pdo->prepare('SELECT COUNT(*) FROM packages WHERE continentId = ?');
            $pkgCount->execute([$id]);
            if ((int) $pkgCount->fetchColumn() > 0) {
                sendResponse(['message' => 'Cannot delete region: tour packages still reference it. Reassign or delete those packages first.'], 400);
            }
        } catch (Throwable $e) {
            // Continue if packages table unavailable.
        }

        $stmt = $pdo->prepare('DELETE FROM regions WHERE id = ?');
        $stmt->execute([$id]);
        sendResponse(['message' => 'Region deleted']);
    }

    if ($entity === 'country' || $entity === 'countries') {
        $existing = fetchCountryById($pdo, $id);
        if (!$existing) sendResponse(['message' => 'Country not found'], 404);

        try {
            $pkgCount = $pdo->prepare('SELECT COUNT(*) FROM packages WHERE countryId = ?');
            $pkgCount->execute([$id]);
            if ((int) $pkgCount->fetchColumn() > 0) {
                sendResponse(['message' => 'Cannot delete country: tour packages still reference it. Reassign or delete those packages first.'], 400);
            }
        } catch (Throwable $e) {
            // Continue if packages table unavailable.
        }

        $stmt = $pdo->prepare('DELETE FROM countries WHERE id = ?');
        $stmt->execute([$id]);
        sendResponse(['message' => 'Country deleted']);
    }

    sendResponse(['message' => 'entity query required: region or country'], 400);
}

sendResponse(['message' => 'Method not allowed'], 405);
