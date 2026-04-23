<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

/**
 * Idempotent seed for tour packages.
 *
 * - Inserts if missing (matched by title + category)
 * - Updates if already exists
 */

function nowIso(): string {
    return gmdate('c');
}

function normalizeType(string $duration): string {
    $d = strtolower($duration);
    // Heuristic: anything with nights/days counts as a "Round" trip
    if (str_contains($d, 'night') || preg_match('/\b\d+\s*day/', $d)) {
        return 'Round';
    }
    return 'Day';
}

function toJson($value, $defaultJson): string {
    if ($value === null) return $defaultJson;
    if (is_string($value)) return json_encode([$value], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

$packages = [
    [
        'title' => 'Sigiriya Rock Fortress',
        'price' => 200,
        'image' => '/src/assets/sigiriya.png',
        'gallery' => ['/src/assets/sigiriya.png', '/src/assets/sigiriya-2.png'],
        'duration' => 'Full Day',
        'description' => "Scale the majestic 'Lion Rock', a UNESCO World Heritage site featuring ancient frescoes and symmetrical water gardens.",
        'itinerary' => [
            '08:00 AM - Hotel pickup and scenic drive to Sigiriya',
            '09:30 AM - Guided climb of the 1,200 steps to the summit',
            '12:00 PM - Authentic Sri Lankan village lunch',
            '02:00 PM - Explore the Pidurangala Vihara temple complex',
            '04:30 PM - Traditional tea service and return to hotel',
        ],
        'inclusions' => ['Luxury Transport', 'English Speaking Guide', 'Entrance Fees', 'Traditional Buffet Lunch', 'Mineral Water'],
        'category' => 'Inbound',
    ],
    [
        'title' => 'Ella Adventure',
        'price' => 150,
        'image' => '/src/assets/ella.png',
        'gallery' => ['/src/assets/ella.png', '/src/assets/ella-2.png'],
        'duration' => 'Full Day',
        'description' => "Trek through misty mountains to find the iconic Nine Arch Bridge and Little Adam's Peak.",
        'itinerary' => [
            '07:00 AM - Departure to Ella',
            "09:00 AM - Hike to Little Adam's Peak for sunrise views",
            '11:00 AM - Visit Nine Arch Bridge and watch the train pass',
            '01:00 PM - Picnic lunch with mountain views',
            '03:00 PM - Refreshing dip in Ravana Falls',
        ],
        'inclusions' => ['Round-trip Transport', 'Expert Hiking Guide', 'Picnic Meal Kit', 'First Aid Support'],
        'category' => 'Inbound',
    ],
    [
        'title' => 'Galle Heritage Trip',
        'price' => 120,
        'image' => '/src/assets/galle.png',
        'gallery' => ['/src/assets/galle.png', '/src/assets/galle-2.png'],
        'duration' => 'Full Day',
        'description' => 'A walk through time in the Dutch Fort of Galle followed by the golden beaches of Unawatuna.',
        'itinerary' => [
            '08:30 AM - Coastal drive via Southern Expressway',
            '10:00 AM - Guided walking tour of Galle Fort',
            '12:30 PM - Lunch at a boutique colonial restaurant',
            '02:30 PM - Stilt fishing observation and photography',
            '04:00 PM - Beach time at Unawatuna',
        ],
        'inclusions' => ['AC Van Transport', 'Historical Guide', 'Photography Session', 'Fort Entrance'],
        'category' => 'Inbound',
    ],
    [
        'title' => 'Kandy Cultural Tour',
        'price' => 80,
        'image' => '/src/assets/kandy.png',
        'gallery' => ['/src/assets/kandy.png', '/src/assets/kandy-2.png', '/src/assets/kandy-3.png'],
        'duration' => 'Full Day',
        'description' => 'Visit the sacred Temple of the Tooth and witness a vibrant traditional dance performance.',
        'itinerary' => [
            '08:00 AM - Travel to the Hill Capital',
            '10:30 AM - Visit the Temple of the Sacred Tooth Relic',
            '12:30 PM - Lake-view lunch',
            '02:00 PM - Peradeniya Botanical Gardens walk',
            '05:00 PM - Cultural dance show',
        ],
        'inclusions' => ['Guided City Tour', 'Temple Entrance', 'Botanical Garden Ticket', 'Dance Show Ticket'],
        'category' => 'Inbound',
    ],
    [
        'title' => 'Paris Romance',
        'price' => 1200,
        'image' => '/src/assets/paris.png',
        'gallery' => ['/src/assets/paris.png'],
        'duration' => '5 Days / 4 Nights',
        'description' => 'Experience the City of Lights with private tours of the Eiffel Tower and Louvre Museum.',
        'itinerary' => [
            ['day' => 'Day 1', 'activities' => [['text' => 'Arrival and Seine River Cruise']]],
            ['day' => 'Day 2', 'activities' => [['text' => 'Louvre Museum and Montmartre Walking Tour']]],
            ['day' => 'Day 3', 'activities' => [['text' => 'Eiffel Tower Summit and Champs-Élysées Shopping']]],
            ['day' => 'Day 4', 'activities' => [['text' => 'Palace of Versailles Day Trip']]],
            ['day' => 'Day 5', 'activities' => [['text' => 'Pastry Workshop and Departure']]],
        ],
        'inclusions' => ['4-Star Hotel', 'Daily Breakfast', 'Museum Passes', 'Airport Transfers'],
        'category' => 'Outbound',
    ],
    [
        'title' => 'Tokyo Neon Nights',
        'price' => 1500,
        'image' => '/src/assets/tokyo.png',
        'gallery' => ['/src/assets/tokyo.png'],
        'duration' => '6 Days / 5 Nights',
        'description' => 'A perfect blend of ancient tradition and futuristic technology in the heart of Japan.',
        'itinerary' => [
            ['day' => 'Day 1', 'activities' => [['text' => 'Arrival in Shinjuku']]],
            ['day' => 'Day 2', 'activities' => [['text' => 'Senso-ji Temple and Akihabara Exploration']]],
            ['day' => 'Day 3', 'activities' => [['text' => 'Shibuya Crossing and Harajuku Fashion District']]],
            ['day' => 'Day 4', 'activities' => [['text' => 'Mount Fuji and Lake Ashi Tour']]],
            ['day' => 'Day 5', 'activities' => [['text' => 'Ghibli Museum and Robot Cafe Dinner']]],
            ['day' => 'Day 6', 'activities' => [['text' => 'Last Minute Shopping and Departure']]],
        ],
        'inclusions' => ['Premium Hotel', 'Japan Rail Pass', 'Mt Fuji Day Trip', 'Local Food Guide'],
        'category' => 'Outbound',
    ],
    [
        'title' => 'Dubai Luxury Desert',
        'price' => 900,
        'image' => '/src/assets/dubai.png',
        'gallery' => ['/src/assets/dubai.png'],
        'duration' => '4 Days / 3 Nights',
        'description' => "Thrill-seeking in the desert and luxury shopping in the world's grandest malls.",
        'itinerary' => [
            'Day 1: Burj Khalifa and Fountain Show',
            'Day 2: Desert Safari and BBQ Dinner',
            'Day 3: Palm Jumeirah and Atlantis Waterpark',
            'Day 4: Souk Madinat Jumeirah and Departure',
        ],
        'inclusions' => ['Luxury Resort', 'Desert Safari', 'Burj Khalifa Entry', 'Private Driver'],
        'category' => 'Outbound',
    ],
    [
        'title' => 'Sydney Harbor Escape',
        'price' => 1100,
        'image' => '/src/assets/sydney.png',
        'gallery' => ['/src/assets/sydney.png'],
        'duration' => '5 Days / 4 Nights',
        'description' => 'Sun, surf, and icons. Explore the Opera House and the famous Bondi Beach.',
        'itinerary' => [
            'Day 1: Opera House Tour and Circular Quay',
            'Day 2: Bondi to Coogee Coastal Walk',
            'Day 3: Blue Mountains Day Trip',
            'Day 4: Harbor Bridge Climb and Darling Harbor',
            'Day 5: Wildlife Sydney Zoo and Departure',
        ],
        'inclusions' => ['Harborside Hotel', 'Bridge Climb Pass', 'Blue Mountains Tour', 'Ferry Pass'],
        'category' => 'Outbound',
    ],
];

$selectId = $pdo->prepare('SELECT id FROM packages WHERE title = ? AND category = ? LIMIT 1');
$insert = $pdo->prepare(
    'INSERT INTO packages (title, price, image, gallery, duration, description, highlights, itinerary, inclusions, exclusions, category, type, featured, localizations, route, isLimitedTime, discountPercentage, expiryDate, seoTitle, seoDescription)
     VALUES (:title, :price, :image, :gallery, :duration, :description, :highlights, :itinerary, :inclusions, :exclusions, :category, :type, :featured, :localizations, :route, :isLimitedTime, :discountPercentage, :expiryDate, :seoTitle, :seoDescription)'
);
$update = $pdo->prepare(
    'UPDATE packages SET
        price = :price,
        image = :image,
        gallery = :gallery,
        duration = :duration,
        description = :description,
        highlights = :highlights,
        itinerary = :itinerary,
        inclusions = :inclusions,
        exclusions = :exclusions,
        type = :type,
        featured = :featured,
        localizations = :localizations,
        route = :route,
        isLimitedTime = :isLimitedTime,
        discountPercentage = :discountPercentage,
        expiryDate = :expiryDate,
        seoTitle = :seoTitle,
        seoDescription = :seoDescription
     WHERE id = :id'
);

$pdo->beginTransaction();
try {
    $inserted = 0;
    $updated = 0;

    foreach ($packages as $p) {
        $type = isset($p['type']) ? (string) $p['type'] : normalizeType((string) $p['duration']);

        $params = [
            'title' => (string) $p['title'],
            'price' => (float) $p['price'],
            'image' => (string) $p['image'],
            'gallery' => toJson($p['gallery'] ?? [], '[]'),
            'duration' => (string) $p['duration'],
            'description' => (string) $p['description'],
            'highlights' => toJson($p['highlights'] ?? [], '[]'),
            'itinerary' => toJson($p['itinerary'] ?? [], '[]'),
            'inclusions' => toJson($p['inclusions'] ?? [], '[]'),
            'exclusions' => toJson($p['exclusions'] ?? [], '[]'),
            'category' => (string) $p['category'],
            'type' => $type,
            'featured' => isset($p['featured']) ? (int) (bool) $p['featured'] : 0,
            'localizations' => toJson($p['localizations'] ?? new stdClass(), '{}'),
            'route' => toJson($p['route'] ?? new stdClass(), '{}'),
            'isLimitedTime' => isset($p['isLimitedTime']) ? (int) (bool) $p['isLimitedTime'] : 0,
            'discountPercentage' => (int) ($p['discountPercentage'] ?? 0),
            'expiryDate' => $p['expiryDate'] ?? null,
            'seoTitle' => (string) ($p['seoTitle'] ?? ''),
            'seoDescription' => (string) ($p['seoDescription'] ?? ''),
        ];

        $selectId->execute([$params['title'], $params['category']]);
        $existing = $selectId->fetchColumn();

        if ($existing !== false && $existing !== null) {
            $update->execute($params + ['id' => (int) $existing]);
            $updated++;
        } else {
            $insert->execute($params);
            $inserted++;
        }
    }

    $pdo->commit();
    echo 'Seed complete: inserted=' . $inserted . ' updated=' . $updated . ' at ' . nowIso() . PHP_EOL;
} catch (Throwable $e) {
    $pdo->rollBack();
    fwrite(STDERR, 'Seed failed: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}

