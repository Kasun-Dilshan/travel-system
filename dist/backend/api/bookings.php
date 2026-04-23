<?php
// php-backend/api/bookings.php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';

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
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'tourId' => $data['tourId'],
            'tourTitle' => $data['tourTitle'],
            'clientName' => $data['clientName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'bookingDate' => $data['bookingDate'],
            'guests' => $data['guests'],
            'specialRequests' => $data['specialRequests'] ?? '',
            'totalPrice' => $data['totalPrice']
        ]);
        
        sendResponse(['message' => 'Booking submitted successfully', 'id' => $pdo->lastInsertId()], 201);
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
else {
    sendResponse(['message' => 'Method not allowed'], 405);
}
