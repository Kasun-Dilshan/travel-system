<?php
// php-backend/api/settings.php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];

function columnExists(PDO $pdo, string $table, string $column): bool {
    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS c
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = :table
          AND COLUMN_NAME = :column
    ");
    $stmt->execute(['table' => $table, 'column' => $column]);
    return (int)$stmt->fetchColumn() > 0;
}

function formatSettings($row) {
    $jsonFields = ['heroImages', 'partnerLogos', 'featuredTourIds', 'premiumServices', 'localizations'];
    foreach ($jsonFields as $field) {
        if (isset($row[$field]) && !is_null($row[$field])) {
            $decoded = json_decode($row[$field], true);
            $row[$field] = is_array($decoded) ? $decoded : [];
        } else {
            $row[$field] = [];
        }
    }
    return $row;
}

function applySettingsLocalizationToRoot(array $settings, string $lang): array {
    $lang = strtolower(trim($lang));
    if ($lang === '' || $lang === 'en') return $settings;

    $loc = (isset($settings['localizations']) && is_array($settings['localizations'])) ? $settings['localizations'] : [];
    $bucket = (isset($loc[$lang]) && is_array($loc[$lang]))
        ? $loc[$lang]
        : ((isset($loc['en']) && is_array($loc['en'])) ? $loc['en'] : null);
    if (!$bucket || !is_array($bucket)) return $settings;

    $keys = [
        'heroTitle', 'heroSubtitle',
        'aboutTitle', 'aboutText',
        'contactAddress',
        'announcementText',
        'companyName', 'companyTagline',
        'footerText',
        'seoTitle', 'seoDescription',
        'premiumServices',
    ];
    foreach ($keys as $k) {
        if (array_key_exists($k, $bucket) && $bucket[$k] !== null && $bucket[$k] !== '') {
            $settings[$k] = $bucket[$k];
        }
    }
    return $settings;
}

if ($method === 'GET') {
    $lang = $_GET['lang'] ?? null;
    $lang = is_string($lang) ? trim($lang) : null;
    $stmt = $pdo->query('SELECT * FROM site_settings WHERE id = 1');
    $row = $stmt->fetch();
    if ($row) {
        $out = formatSettings($row);
        if ($lang) $out = applySettingsLocalizationToRoot($out, $lang);
        sendResponse($out);
    }
    else sendResponse(['message' => 'Settings not found'], 404);
}
elseif ($method === 'PUT' || $method === 'POST') {
    requireAdmin();
    $data = getRequestBody();

    $hasLocalizations = columnExists($pdo, 'site_settings', 'localizations');

    $sql = "UPDATE site_settings SET 
            heroTitle = :heroTitle, heroSubtitle = :heroSubtitle, heroImages = :heroImages, 
            aboutTitle = :aboutTitle, aboutText = :aboutText, 
            contactEmail = :contactEmail, contactPhone = :contactPhone, 
            contactWhatsApp = :contactWhatsApp, contactAddress = :contactAddress, 
            socialFacebook = :socialFacebook, socialInstagram = :socialInstagram, 
            socialTwitter = :socialTwitter, socialYoutube = :socialYoutube, 
            socialTripAdvisor = :socialTripAdvisor, partnerLogos = :partnerLogos, 
            featuredTourIds = :featuredTourIds, announcementEnabled = :announcementEnabled, 
            announcementText = :announcementText, announcementLink = :announcementLink, 
            companyName = :companyName, companyTagline = :companyTagline, 
            companyLogo = :companyLogo, footerText = :footerText, 
            seoTitle = :seoTitle, seoDescription = :seoDescription,
            premiumServices = :premiumServices" .
            ($hasLocalizations ? ",
            localizations = :localizations" : "") .
            " WHERE id = 1";
    
    try {
        $stmt = $pdo->prepare($sql);
        $params = [
            'heroTitle' => $data['heroTitle'] ?? '',
            'heroSubtitle' => $data['heroSubtitle'] ?? '',
            'heroImages' => json_encode($data['heroImages'] ?? []),
            'aboutTitle' => $data['aboutTitle'] ?? '',
            'aboutText' => $data['aboutText'] ?? '',
            'contactEmail' => $data['contactEmail'] ?? '',
            'contactPhone' => $data['contactPhone'] ?? '',
            'contactWhatsApp' => $data['contactWhatsApp'] ?? '',
            'contactAddress' => $data['contactAddress'] ?? '',
            'socialFacebook' => $data['socialFacebook'] ?? '',
            'socialInstagram' => $data['socialInstagram'] ?? '',
            'socialTwitter' => $data['socialTwitter'] ?? '',
            'socialYoutube' => $data['socialYoutube'] ?? '',
            'socialTripAdvisor' => $data['socialTripAdvisor'] ?? '',
            'partnerLogos' => json_encode($data['partnerLogos'] ?? []),
            'featuredTourIds' => json_encode($data['featuredTourIds'] ?? []),
            'announcementEnabled' => isset($data['announcementEnabled']) ? (int)$data['announcementEnabled'] : 0,
            'announcementText' => $data['announcementText'] ?? '',
            'announcementLink' => $data['announcementLink'] ?? '',
            'companyName' => $data['companyName'] ?? '',
            'companyTagline' => $data['companyTagline'] ?? '',
            'companyLogo' => $data['companyLogo'] ?? '',
            'footerText' => $data['footerText'] ?? '',
            'seoTitle' => $data['seoTitle'] ?? '',
            'seoDescription' => $data['seoDescription'] ?? '',
            'premiumServices' => json_encode($data['premiumServices'] ?? []),
        ];
        if ($hasLocalizations) {
            $params['localizations'] = json_encode($data['localizations'] ?? []);
        }
        $stmt->execute($params);
        // Return updated settings
        $stmt = $pdo->query('SELECT * FROM site_settings WHERE id = 1');
        $updatedSettings = formatSettings($stmt->fetch());
        sendResponse($updatedSettings);
    } catch (Exception $e) {
        sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
    }
}
else {
    sendResponse(['message' => 'Method not allowed'], 405);
}
