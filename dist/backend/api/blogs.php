<?php
// php-backend/api/blogs.php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/auth.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];

function formatBlog($row) {
    if (isset($row['tags']) && !is_null($row['tags'])) {
        $row['tags'] = json_decode($row['tags'], true);
    } else {
        $row['tags'] = [];
    }
    $row['_id'] = $row['id'];
    return $row;
}

if ($method === 'GET') {
    if (isset($_GET['id']) || isset($_GET['slug'])) {
        $id = $_GET['id'] ?? null;
        $slug = $_GET['slug'] ?? null;
        
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM blogs WHERE id = ?');
            $stmt->execute([$id]);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM blogs WHERE slug = ?');
            $stmt->execute([$slug]);
        }
        
        $row = $stmt->fetch();
        if ($row) sendResponse(formatBlog($row));
        else sendResponse(['message' => 'Blog not found'], 404);
    } else {
        $status = $_GET['status'] ?? null;
        if ($status) {
            $stmt = $pdo->prepare('SELECT * FROM blogs WHERE status = ? ORDER BY created_at DESC');
            $stmt->execute([$status]);
        } else {
            $stmt = $pdo->query('SELECT * FROM blogs ORDER BY created_at DESC');
        }
        $rows = $stmt->fetchAll();
        sendResponse(array_map('formatBlog', $rows));
    }
}
elseif ($method === 'POST') {
    requireAdmin();
    $data = getRequestBody();
    
    // Auto-generate slug if missing
    if (empty($data['slug'])) {
        $data['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['title'])));
    }

    $publishedAt = ($data['status'] === 'published') ? date('Y-m-d H:i:s') : null;

    $sql = "INSERT INTO blogs (title, slug, excerpt, content, coverImage, tags, category, author, status, publishedAt, seoTitle, seoDescription, readTime) 
            VALUES (:title, :slug, :excerpt, :content, :coverImage, :tags, :category, :author, :status, :publishedAt, :seoTitle, :seoDescription, :readTime)";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'title' => $data['title'],
            'slug' => $data['slug'],
            'excerpt' => $data['excerpt'],
            'content' => $data['content'],
            'coverImage' => $data['coverImage'] ?? '',
            'tags' => json_encode($data['tags'] ?? []),
            'category' => $data['category'] ?? 'Travel Tips',
            'author' => $data['author'] ?? 'Serendib Travel',
            'status' => $data['status'] ?? 'draft',
            'publishedAt' => $publishedAt,
            'seoTitle' => $data['seoTitle'] ?? '',
            'seoDescription' => $data['seoDescription'] ?? '',
            'readTime' => $data['readTime'] ?? ''
        ]);
        $id = $pdo->lastInsertId();
        // Fetch and return full object
        $stmt = $pdo->prepare('SELECT * FROM blogs WHERE id = ?');
        $stmt->execute([$id]);
        $newBlog = formatBlog($stmt->fetch());
        sendResponse($newBlog, 201);
    } catch (Exception $e) {
        sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
    }
}
elseif ($method === 'PUT') {
    requireAdmin();
    $data = getRequestBody();
    $id = $_GET['id'] ?? $data['id'] ?? null;
    if (!$id) sendResponse(['message' => 'ID required'], 400);

    $sql = "UPDATE blogs SET 
            title = :title, slug = :slug, excerpt = :excerpt, content = :content, 
            coverImage = :coverImage, tags = :tags, category = :category, 
            author = :author, status = :status, seoTitle = :seoTitle, 
            seoDescription = :seoDescription, readTime = :readTime 
            WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $id,
            'title' => $data['title'],
            'slug' => $data['slug'],
            'excerpt' => $data['excerpt'],
            'content' => $data['content'],
            'coverImage' => $data['coverImage'] ?? '',
            'tags' => json_encode($data['tags'] ?? []),
            'category' => $data['category'] ?? 'Travel Tips',
            'author' => $data['author'] ?? 'Serendib Travel',
            'status' => $data['status'] ?? 'draft',
            'seoTitle' => $data['seoTitle'] ?? '',
            'seoDescription' => $data['seoDescription'] ?? '',
            'readTime' => $data['readTime'] ?? ''
        ]);
        // Fetch and return full object
        $stmt = $pdo->prepare('SELECT * FROM blogs WHERE id = ?');
        $stmt->execute([$id]);
        $updatedBlog = formatBlog($stmt->fetch());
        sendResponse($updatedBlog);
    } catch (Exception $e) {
        sendResponse(['message' => 'Error: ' . $e->getMessage()], 400);
    }
}
elseif ($method === 'DELETE') {
    requireAdmin();
    $id = $_GET['id'] ?? null;
    if (!$id) sendResponse(['message' => 'ID required'], 400);
    $stmt = $pdo->prepare('DELETE FROM blogs WHERE id = ?');
    $stmt->execute([$id]);
    sendResponse(['message' => 'Blog deleted']);
}
else {
    sendResponse(['message' => 'Method not allowed'], 405);
}
