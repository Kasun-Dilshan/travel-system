<?php
// php-backend/api/bookings.php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/mail.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    requireAdmin();
    $stmt = $pdo->query('SELECT * FROM bookings ORDER BY submittedAt DESC');
    $rows = $stmt->fetchAll();
    // Mongoose compatibility
    foreach($rows as &$row) {
        $row['_id'] = $row['id'];
    }
    sendResponse($rows);
} 
elseif ($method === 'POST') {
    $data = getRequestBody();
    
    $sql = "INSERT INTO bookings (tourId, tourTitle, clientName, email, phone, bookingDate, guests, specialRequests, totalPrice) 
            VALUES (:tourId, :tourTitle, :clientName, :email, :phone, :bookingDate, :guests, :specialRequests, :totalPrice)";
    
    try {
        $bookingPayload = [
            'tourId' => $data['tourId'],
            'tourTitle' => $data['tourTitle'],
            'clientName' => $data['clientName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'bookingDate' => $data['bookingDate'],
            'guests' => $data['guests'],
            'specialRequests' => $data['specialRequests'] ?? '',
            'totalPrice' => $data['totalPrice']
        ];

        $stmt = $pdo->prepare($sql);
        $stmt->execute($bookingPayload);

        $bookingId = $pdo->lastInsertId();
        notifyBookingSubmitted($bookingPayload, $bookingId);
        
        sendResponse(['message' => 'Booking submitted successfully', 'id' => $bookingId], 201);
    } catch (Exception $e) {
        sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
    }
}
elseif ($method === 'PATCH') {
    requireAdmin();
    $data = getRequestBody();
    $id = $_GET['id'] ?? $data['id'] ?? null;
    if (!$id) sendResponse(['message' => 'ID required'], 400);

    $stmt = $pdo->prepare('UPDATE bookings SET status = ? WHERE id = ?');
    $stmt->execute([$data['status'], $id]);
    sendResponse(['message' => 'Booking status updated']);
}
elseif ($method === 'DELETE') {
    requireAdmin();
    $id = $_GET['id'] ?? null;
    if (!$id) sendResponse(['message' => 'ID required'], 400);
    $stmt = $pdo->prepare('DELETE FROM bookings WHERE id = ?');
    $stmt->execute([$id]);
    sendResponse(['message' => 'Booking deleted']);
}
else {
    sendResponse(['message' => 'Method not allowed'], 405);
}
