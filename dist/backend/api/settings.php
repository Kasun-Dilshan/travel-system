<?php
// php-backend/api/settings.php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];

function formatSettings($row) {
    $jsonFields = ['heroImages', 'partnerLogos', 'featuredTourIds'];
    foreach ($jsonFields as $field) {
        if (isset($row[$field]) && !is_null($row[$field])) {
            $row[$field] = json_decode($row[$field], true);
        } else {
            $row[$field] = [];
        }
    }
    return $row;
}

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM site_settings WHERE id = 1');
    $row = $stmt->fetch();
    if ($row) sendResponse(formatSettings($row));
    else sendResponse(['message' => 'Settings not found'], 404);
}
elseif ($method === 'PUT' || $method === 'POST') {
    requireAdmin();
    $data = getRequestBody();

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
            seoTitle = :seoTitle, seoDescription = :seoDescription 
            WHERE id = 1";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
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
            'seoDescription' => $data['seoDescription'] ?? ''
        ]);
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
