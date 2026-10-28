<?php
// php-backend/api/reviews.php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];

function formatReview($row, $photos = null) {
    if ($photos === null && isset($row['id'])) {
        global $pdo;
        $stmt = $pdo->prepare('SELECT path FROM review_photos WHERE review_id = ? ORDER BY id ASC');
        $stmt->execute([$row['id']]);
        $photos = array_column($stmt->fetchAll(), 'path');
    }
    if (!is_array($photos)) {
        $photos = [];
    }

    return [
        'id' => (int) $row['id'],
        '_id' => (int) $row['id'],
        'name' => $row['name'] ?? '',
        'location' => $row['location'] ?? '',
        'rating' => (int) ($row['rating'] ?? 5),
        'text' => $row['review_text'] ?? '',
        'status' => $row['status'] ?? 'pending',
        'photos' => $photos,
        'created_at' => $row['created_at'] ?? null,
        'approved_at' => $row['approved_at'] ?? null,
    ];
}

function fetchReviewById($pdo, $id) {
    $stmt = $pdo->prepare('SELECT * FROM reviews WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? formatReview($row) : null;
}

function fetchReviews($pdo, $statusFilter = null) {
    if ($statusFilter) {
        $stmt = $pdo->prepare('SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC');
        $stmt->execute([$statusFilter]);
    } else {
        $stmt = $pdo->query('SELECT * FROM reviews ORDER BY created_at DESC');
    }
    $rows = $stmt->fetchAll();
    if (!$rows) {
        return [];
    }

    $ids = array_column($rows, 'id');
    $photosByReview = [];
    if ($ids) {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare("SELECT review_id, path FROM review_photos WHERE review_id IN ($placeholders) ORDER BY id ASC");
        $stmt->execute($ids);
        foreach ($stmt->fetchAll() as $photoRow) {
            $photosByReview[$photoRow['review_id']][] = $photoRow['path'];
        }
    }

    return array_map(function ($row) use ($photosByReview) {
        $photos = $photosByReview[$row['id']] ?? [];
        return formatReview($row, $photos);
    }, $rows);
}

function unlinkReviewPhotoPath($path) {
    if (!$path || !is_string($path)) {
        return;
    }
    $normalized = normalizeReviewPhotoPath($path);
    if ($normalized === '') {
        return;
    }
    $relative = ltrim($normalized, '/');
    $full = __DIR__ . '/../' . $relative;
    if (is_file($full)) {
        @unlink($full);
    }
}

function normalizeReviewPhotoPath($path) {
    if (!is_string($path)) {
        return '';
    }
    $path = trim($path);
    if ($path === '') {
        return '';
    }
    if (preg_match('#(?:^|/)(uploads/reviews/[^?#]+)#i', $path, $m)) {
        return '/' . ltrim(str_replace('\\', '/', $m[1]), '/');
    }
    return '';
}

function deleteReviewPhotosFromDisk($pdo, $reviewId) {
    $stmt = $pdo->prepare('SELECT path FROM review_photos WHERE review_id = ?');
    $stmt->execute([$reviewId]);
    foreach ($stmt->fetchAll() as $row) {
        unlinkReviewPhotoPath($row['path'] ?? '');
    }
}

function saveReviewPhotos($files) {
    $saved = [];
    if (!is_array($files) || !isset($files['name'])) {
        return $saved;
    }

    $uploadDir = __DIR__ . '/../uploads/reviews';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        sendResponse(['message' => 'Could not create upload directory'], 500);
    }

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];
    $maxBytes = 8 * 1024 * 1024;

    $names = $files['name'];
    $tmpNames = $files['tmp_name'];
    $errors = $files['error'];
    $sizes = $files['size'];
    $types = $files['type'];

    $count = is_array($names) ? count($names) : 0;
    for ($i = 0; $i < $count && count($saved) < 5; $i++) {
        if (($errors[$i] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            continue;
        }
        $tmp = $tmpNames[$i] ?? '';
        if (!$tmp || !is_uploaded_file($tmp)) {
            continue;
        }
        if ((int) ($sizes[$i] ?? 0) > $maxBytes) {
            continue;
        }

        $info = @getimagesize($tmp);
        if ($info === false) {
            continue;
        }
        $mime = $info['mime'] ?? '';
        if (!isset($allowed[$mime])) {
            continue;
        }

        $ext = $allowed[$mime];
        $basename = bin2hex(random_bytes(16)) . '.' . $ext;
        $dest = $uploadDir . DIRECTORY_SEPARATOR . $basename;
        if (!move_uploaded_file($tmp, $dest)) {
            continue;
        }
        $saved[] = '/uploads/reviews/' . $basename;
    }

    return $saved;
}

if ($method === 'GET') {
    $showAll = isset($_GET['all']) && ($_GET['all'] === 'true' || $_GET['all'] === '1');
    if ($showAll) {
        requireAdmin();
        sendResponse(fetchReviews($pdo));
    }
    sendResponse(fetchReviews($pdo, 'approved'));
}
elseif ($method === 'POST') {
    $name = trim((string) ($_POST['name'] ?? ''));
    $location = trim((string) ($_POST['location'] ?? ''));
    $rating = (int) ($_POST['rating'] ?? 5);
    $text = trim((string) ($_POST['text'] ?? ''));

    if ($name === '' || $text === '') {
        sendResponse(['message' => 'Name and review text are required'], 400);
    }
    $rating = max(1, min(5, $rating));

    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? substr((string) $_SERVER['HTTP_USER_AGENT'], 0, 255) : null;

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            'INSERT INTO reviews (name, location, rating, review_text, status, ip, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$name, $location, $rating, $text, 'pending', $ip, $userAgent]);
        $reviewId = (int) $pdo->lastInsertId();

        $photoFiles = null;
        if (isset($_FILES['photos'])) {
            $photoFiles = $_FILES['photos'];
        } elseif (isset($_FILES['photos[]'])) {
            $photoFiles = $_FILES['photos[]'];
        }

        $savedPhotos = $photoFiles ? saveReviewPhotos($photoFiles) : [];
        if ($savedPhotos) {
            $photoStmt = $pdo->prepare('INSERT INTO review_photos (review_id, path) VALUES (?, ?)');
            foreach ($savedPhotos as $path) {
                $photoStmt->execute([$reviewId, $path]);
            }
        }

        $pdo->commit();
        sendResponse([
            'message' => 'Thank you! Your review has been submitted and will appear after approval.',
            'id' => $reviewId,
        ], 201);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
    }
}
elseif ($method === 'PATCH') {
    requireAdmin();
    $data = getRequestBody();
    $id = $_GET['id'] ?? $data['id'] ?? null;
    if (!$id) {
        sendResponse(['message' => 'ID required'], 400);
    }

    $status = $data['status'] ?? 'approved';
    if ($status !== 'approved') {
        sendResponse(['message' => 'Only approval is supported'], 400);
    }

    $stmt = $pdo->prepare("UPDATE reviews SET status = 'approved', approved_at = NOW() WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        sendResponse(['message' => 'Review not found'], 404);
    }

    $review = fetchReviewById($pdo, $id);
    sendResponse($review);
}
elseif ($method === 'PUT') {
    requireAdmin();
    $data = getRequestBody();
    $id = $_GET['id'] ?? $data['id'] ?? null;
    if (!$id) {
        sendResponse(['message' => 'ID required'], 400);
    }

    $existingStmt = $pdo->prepare('SELECT * FROM reviews WHERE id = ?');
    $existingStmt->execute([$id]);
    $existing = $existingStmt->fetch();
    if (!$existing) {
        sendResponse(['message' => 'Review not found'], 404);
    }

    $name = trim((string) ($data['name'] ?? $existing['name'] ?? ''));
    $location = trim((string) ($data['location'] ?? $existing['location'] ?? ''));
    $text = trim((string) ($data['text'] ?? $existing['review_text'] ?? ''));
    $rating = (int) ($data['rating'] ?? $existing['rating'] ?? 5);
    $status = strtolower(trim((string) ($data['status'] ?? $existing['status'] ?? 'pending')));

    if ($name === '' || $text === '') {
        sendResponse(['message' => 'Name and review text are required'], 400);
    }
    $rating = max(1, min(5, $rating));
    if (!in_array($status, ['pending', 'approved'], true)) {
        sendResponse(['message' => 'Status must be pending or approved'], 400);
    }

    $approvedAt = $existing['approved_at'] ?? null;
    if ($status === 'approved' && (!$approvedAt || ($existing['status'] ?? '') !== 'approved')) {
        $approvedAtSql = 'NOW()';
        $approvedAtParam = null;
    } elseif ($status === 'pending') {
        $approvedAtSql = 'NULL';
        $approvedAtParam = null;
    } else {
        $approvedAtSql = '?';
        $approvedAtParam = $approvedAt;
    }

    $replacePhotos = array_key_exists('photos', $data);
    $normalizedPhotos = [];
    if ($replacePhotos) {
        $rawPhotos = $data['photos'];
        if (!is_array($rawPhotos)) {
            sendResponse(['message' => 'photos must be an array'], 400);
        }
        foreach ($rawPhotos as $photo) {
            $normalized = normalizeReviewPhotoPath($photo);
            if ($normalized === '') {
                continue;
            }
            if (!in_array($normalized, $normalizedPhotos, true)) {
                $normalizedPhotos[] = $normalized;
            }
            if (count($normalizedPhotos) >= 5) {
                break;
            }
        }
    }

    try {
        $pdo->beginTransaction();

        if ($approvedAtSql === '?') {
            $stmt = $pdo->prepare(
                "UPDATE reviews SET name = ?, location = ?, rating = ?, review_text = ?, status = ?, approved_at = ? WHERE id = ?"
            );
            $stmt->execute([$name, $location, $rating, $text, $status, $approvedAtParam, $id]);
        } else {
            $stmt = $pdo->prepare(
                "UPDATE reviews SET name = ?, location = ?, rating = ?, review_text = ?, status = ?, approved_at = {$approvedAtSql} WHERE id = ?"
            );
            $stmt->execute([$name, $location, $rating, $text, $status, $id]);
        }

        if ($replacePhotos) {
            $oldStmt = $pdo->prepare('SELECT path FROM review_photos WHERE review_id = ?');
            $oldStmt->execute([$id]);
            $oldPaths = array_column($oldStmt->fetchAll(), 'path');

            $delStmt = $pdo->prepare('DELETE FROM review_photos WHERE review_id = ?');
            $delStmt->execute([$id]);

            if ($normalizedPhotos) {
                $photoStmt = $pdo->prepare('INSERT INTO review_photos (review_id, path) VALUES (?, ?)');
                foreach ($normalizedPhotos as $path) {
                    $photoStmt->execute([$id, $path]);
                }
            }

            foreach ($oldPaths as $oldPath) {
                $normalizedOld = normalizeReviewPhotoPath($oldPath);
                if ($normalizedOld && !in_array($normalizedOld, $normalizedPhotos, true)) {
                    unlinkReviewPhotoPath($normalizedOld);
                }
            }
        }

        $pdo->commit();
        sendResponse(fetchReviewById($pdo, $id));
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
    }
}
elseif ($method === 'DELETE') {
    requireAdmin();
    $id = $_GET['id'] ?? null;
    if (!$id) {
        sendResponse(['message' => 'ID required'], 400);
    }

    deleteReviewPhotosFromDisk($pdo, $id);
    $stmt = $pdo->prepare('DELETE FROM reviews WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        sendResponse(['message' => 'Review not found'], 404);
    }
    sendResponse(['message' => 'Review deleted']);
}
else {
    sendResponse(['message' => 'Method not allowed'], 405);
}
