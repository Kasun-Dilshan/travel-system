<?php
// php-backend/api/packages.php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/translate.php';

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
            $decoded = json_decode($row[$field], true);
            $row[$field] = is_array($decoded) ? $decoded : [];
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

function safeArray($value): array {
    return is_array($value) ? $value : [];
}

function safeString($value): string {
    return is_string($value) ? $value : (is_numeric($value) ? (string)$value : '');
}

function translatePackageBucket(array $pkg, string $lang): ?array {
    $lang = strtolower(trim($lang));
    if ($lang === '' || $lang === 'en') return null;

    $title = safeString($pkg['title'] ?? '');
    $description = safeString($pkg['description'] ?? '');
    $duration = safeString($pkg['duration'] ?? '');
    $type = safeString($pkg['type'] ?? '');
    $category = safeString($pkg['category'] ?? '');

    $highlights = array_values(array_filter(array_map('safeString', safeArray($pkg['highlights'] ?? [])), fn ($s) => trim($s) !== ''));
    $inclusions = array_values(array_filter(array_map('safeString', safeArray($pkg['inclusions'] ?? [])), fn ($s) => trim($s) !== ''));
    $exclusions = array_values(array_filter(array_map('safeString', safeArray($pkg['exclusions'] ?? [])), fn ($s) => trim($s) !== ''));

    // Itinerary can be an array of strings OR an array of { day, activities[] } objects.
    $itinerary = safeArray($pkg['itinerary'] ?? []);
    $itineraryOut = $itinerary;

    // Translate scalar fields first.
    $baseTexts = [$title, $description, $duration, $type, $category];
    $translatedBase = translate_list($baseTexts, $lang, 'en');
    if (!$translatedBase || count($translatedBase) !== 5) return null;

    $bucket = [
        'title' => $translatedBase[0],
        'description' => $translatedBase[1],
        'duration' => $translatedBase[2],
        'type' => $translatedBase[3],
        'category' => $translatedBase[4],
    ];

    $translatedHighlights = $highlights ? translate_list($highlights, $lang, 'en') : [];
    if ($highlights && $translatedHighlights === null) return null;
    $bucket['highlights'] = $translatedHighlights ?: $highlights;

    $translatedInclusions = $inclusions ? translate_list($inclusions, $lang, 'en') : [];
    if ($inclusions && $translatedInclusions === null) return null;
    $bucket['inclusions'] = $translatedInclusions ?: $inclusions;

    $translatedExclusions = $exclusions ? translate_list($exclusions, $lang, 'en') : [];
    if ($exclusions && $translatedExclusions === null) return null;
    $bucket['exclusions'] = $translatedExclusions ?: $exclusions;

    if (is_array($itinerary) && count($itinerary) > 0) {
        $first = $itinerary[0];
        $hasDayObjects = is_array($first) && array_key_exists('day', $first);

        if ($hasDayObjects) {
            $days = [];
            $activityTexts = [];
            $activityIndex = []; // [ [dayIdx, actIdx, fieldKey], ... ]

            foreach ($itinerary as $dIdx => $dayObj) {
                if (!is_array($dayObj)) continue;
                $days[] = safeString($dayObj['day'] ?? '');
                $acts = safeArray($dayObj['activities'] ?? []);
                foreach ($acts as $aIdx => $act) {
                    if (is_string($act)) {
                        $activityTexts[] = $act;
                        $activityIndex[] = [$dIdx, $aIdx, 'string'];
                    } elseif (is_array($act)) {
                        $loc = safeString($act['location'] ?? '');
                        $txt = safeString($act['text'] ?? '');
                        $activityTexts[] = $loc;
                        $activityIndex[] = [$dIdx, $aIdx, 'location'];
                        $activityTexts[] = $txt;
                        $activityIndex[] = [$dIdx, $aIdx, 'text'];
                    }
                }
            }

            $translatedDays = $days ? translate_list($days, $lang, 'en') : [];
            if ($days && $translatedDays === null) return null;

            $translatedActivities = $activityTexts ? translate_list($activityTexts, $lang, 'en') : [];
            if ($activityTexts && $translatedActivities === null) return null;

            $itineraryOut = $itinerary;
            // Apply day translations
            $dayCursor = 0;
            foreach ($itineraryOut as $dIdx => &$dayObj) {
                if (!is_array($dayObj)) continue;
                if ($dayCursor < count($translatedDays)) {
                    $dayObj['day'] = $translatedDays[$dayCursor];
                }
                $dayCursor++;
            }
            unset($dayObj);

            // Apply activity translations
            $actCursor = 0;
            foreach ($activityIndex as $meta) {
                if ($actCursor >= count($translatedActivities)) break;
                [$dIdx, $aIdx, $field] = $meta;
                if (!isset($itineraryOut[$dIdx]) || !is_array($itineraryOut[$dIdx])) { $actCursor++; continue; }
                if (!isset($itineraryOut[$dIdx]['activities']) || !is_array($itineraryOut[$dIdx]['activities'])) { $actCursor++; continue; }
                if (!array_key_exists($aIdx, $itineraryOut[$dIdx]['activities'])) { $actCursor++; continue; }

                $current = $itineraryOut[$dIdx]['activities'][$aIdx];
                if ($field === 'string' && is_string($current)) {
                    $itineraryOut[$dIdx]['activities'][$aIdx] = $translatedActivities[$actCursor];
                } elseif (($field === 'location' || $field === 'text') && is_array($current)) {
                    $itineraryOut[$dIdx]['activities'][$aIdx][$field] = $translatedActivities[$actCursor];
                }
                $actCursor++;
            }
        } else {
            // Array of strings (or mixed); translate only the string items.
            $stringItems = [];
            $stringIdx = [];
            foreach ($itinerary as $idx => $item) {
                if (is_string($item) && trim($item) !== '') {
                    $stringItems[] = $item;
                    $stringIdx[] = $idx;
                }
            }
            $translatedItems = $stringItems ? translate_list($stringItems, $lang, 'en') : [];
            if ($stringItems && $translatedItems === null) return null;
            $itineraryOut = $itinerary;
            foreach ($stringIdx as $i => $idx) {
                if (isset($translatedItems[$i])) $itineraryOut[$idx] = $translatedItems[$i];
            }
        }
    }

    $bucket['itinerary'] = $itineraryOut;
    return $bucket;
}

function ensurePackageLocalization(array $pkg, string $lang, $pdo): array {
    $lang = strtolower(trim($lang));
    if ($lang === '' || $lang === 'en') return $pkg;

    $localizations = isset($pkg['localizations']) && is_array($pkg['localizations']) ? $pkg['localizations'] : [];
    $existing = (isset($localizations[$lang]) && is_array($localizations[$lang])) ? $localizations[$lang] : null;

    $hasNonEmptyList = function ($value): bool {
        if (!is_array($value)) return false;
        foreach ($value as $v) {
            if (is_string($v) && trim($v) !== '') return true;
            if (is_array($v) && count($v) > 0) return true;
        }
        return false;
    };

    $isBucketComplete = function (?array $bucket) use ($pkg, $hasNonEmptyList): bool {
        if (!$bucket || !count($bucket)) return false;
        // Scalars
        if (!isset($bucket['title']) || trim((string) $bucket['title']) === '') return false;
        if (!isset($bucket['description']) || trim((string) $bucket['description']) === '') return false;
        if (!isset($bucket['duration']) || trim((string) $bucket['duration']) === '') return false;
        // Lists: only require when base has data
        if ($hasNonEmptyList($pkg['inclusions'] ?? []) && !$hasNonEmptyList($bucket['inclusions'] ?? [])) return false;
        if ($hasNonEmptyList($pkg['highlights'] ?? []) && !$hasNonEmptyList($bucket['highlights'] ?? [])) return false;
        if ($hasNonEmptyList($pkg['exclusions'] ?? []) && !$hasNonEmptyList($bucket['exclusions'] ?? [])) return false;
        if ($hasNonEmptyList($pkg['itinerary'] ?? []) && !$hasNonEmptyList($bucket['itinerary'] ?? [])) return false;
        return true;
    };

    if ($isBucketComplete($existing)) {
        return $pkg;
    }

    $bucket = translatePackageBucket($pkg, $lang);
    if (!$bucket) return $pkg;

    // Merge with existing so any manually-entered translations win.
    if (is_array($existing)) {
        foreach ($bucket as $k => $v) {
            $hasKey = array_key_exists($k, $existing);
            $cur = $hasKey ? $existing[$k] : null;
            $curIsEmptyArray = is_array($cur) && !count($cur);
            $curIsEmptyScalar = $cur === null || $cur === '';

            // If older/legacy saves stored list fields as strings/objects instead of arrays,
            // prefer the translated array output.
            $incomingIsArray = is_array($v);
            $curIsArray = is_array($cur);
            $shouldReplaceNonArrayWithArray = $incomingIsArray && !$curIsArray;

            if (!$hasKey || $curIsEmptyScalar || $curIsEmptyArray || $shouldReplaceNonArrayWithArray) {
                $existing[$k] = $v;
            }
        }
        $localizations[$lang] = $existing;
    } else {
        $localizations[$lang] = $bucket;
    }
    $pkg['localizations'] = $localizations;

    // Persist back to DB for future requests.
    if ($pdo && isset($pkg['id'])) {
        try {
            $stmt = $pdo->prepare('UPDATE packages SET localizations = :localizations WHERE id = :id');
            $stmt->execute([
                'id' => (int) $pkg['id'],
                'localizations' => json_encode($localizations),
            ]);
        } catch (Throwable $e) {
            // Ignore persistence failure; return translated content anyway.
        }
    }

    return $pkg;
}

function applyLocalizationBucketToRoot(array $pkg, string $lang): array {
    $lang = strtolower(trim($lang));
    if ($lang === '' || $lang === 'en') return $pkg;
    $loc = isset($pkg['localizations']) && is_array($pkg['localizations']) ? $pkg['localizations'] : [];
    $bucket = (isset($loc[$lang]) && is_array($loc[$lang])) ? $loc[$lang] : (isset($loc['en']) && is_array($loc['en']) ? $loc['en'] : null);
    if (!$bucket || !is_array($bucket)) return $pkg;

    $keys = [
        'title', 'description', 'duration', 'type', 'category',
        'highlights', 'itinerary', 'inclusions', 'exclusions',
        'seoTitle', 'seoDescription',
    ];
    foreach ($keys as $k) {
        if (array_key_exists($k, $bucket) && $bucket[$k] !== null && $bucket[$k] !== '') {
            $pkg[$k] = $bucket[$k];
        }
    }
    return $pkg;
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
    $lang = $_GET['lang'] ?? null;
    $lang = is_string($lang) ? trim($lang) : null;
    if (isset($_GET['id'])) {
        $id = (int) $_GET['id'];
        if (!$pdo) {
            $seed = require __DIR__ . '/../data/packages_seed.php';
            foreach ($seed as $row) {
                if ((int) ($row['id'] ?? 0) === $id) {
                    $out = formatSeedRow($row);
                    // Seed/no-DB mode: still translate on demand so language switching works.
                    if ($lang) {
                        $out = ensurePackageLocalization($out, (string) $lang, null);
                        $out = applyLocalizationBucketToRoot($out, (string) $lang);
                    }
                    sendResponse($out);
                }
            }
            sendResponse(['message' => 'Package not found'], 404);
        }

        $stmt = $pdo->prepare('SELECT * FROM packages WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $out = formatData($row);
            if ($lang) {
                $out = ensurePackageLocalization($out, $lang, $pdo);
                $out = applyLocalizationBucketToRoot($out, $lang);
            }
            sendResponse($out);
        }
        sendResponse(['message' => 'Package not found'], 404);
    } else {
        $category = $_GET['category'] ?? null;
        if (!$pdo) {
            $seed = require __DIR__ . '/../data/packages_seed.php';
            if ($category) {
                $seed = array_values(array_filter($seed, fn ($p) => isset($p['category']) && $p['category'] === $category));
            }
            $outSeed = array_map('formatSeedRow', $seed);
            if ($lang) {
                $outSeed = array_map(fn ($p) => applyLocalizationBucketToRoot(ensurePackageLocalization($p, (string) $lang, null), (string) $lang), $outSeed);
            }
            sendResponse($outSeed);
        }

        if ($category) {
            $stmt = $pdo->prepare('SELECT * FROM packages WHERE category = ? ORDER BY created_at DESC');
            $stmt->execute([$category]);
        } else {
            $stmt = $pdo->query('SELECT * FROM packages ORDER BY created_at DESC');
        }
        $rows = $stmt->fetchAll();
        $outRows = array_map('formatData', $rows);
        if ($lang) {
            $outRows = array_map(fn ($p) => applyLocalizationBucketToRoot(ensurePackageLocalization($p, $lang, $pdo), $lang), $outRows);
        }
        sendResponse($outRows);
    }
} 
elseif ($method === 'POST') {
    requireAdmin();
    if (!$pdo) sendResponse(['message' => 'Database unavailable'], 503);
    $data = getRequestBody();
    $data = prepareData($data);

    $sql = "INSERT INTO packages (title, price, image, gallery, duration, description, highlights, itinerary, inclusions, exclusions, category, type, featured, isHot, localizations, route, isLimitedTime, discountPercentage, expiryDate, seoTitle, seoDescription) 
            VALUES (:title, :price, :image, :gallery, :duration, :description, :highlights, :itinerary, :inclusions, :exclusions, :category, :type, :featured, :isHot, :localizations, :route, :isLimitedTime, :discountPercentage, :expiryDate, :seoTitle, :seoDescription)";
    
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
            'isHot' => isset($data['isHot']) ? (int)$data['isHot'] : 0,
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
            category = :category, type = :type, featured = :featured, isHot = :isHot,
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
            'isHot' => isset($data['isHot']) ? (int)$data['isHot'] : 0,
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
