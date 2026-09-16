<?php
// backend/config/get_categories.php
// Mengembalikan daftar kategori unik yang sudah pernah dipakai di tabel products.
// Dipakai oleh dropdown kategori di ProductPage (create/edit produk).

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth_middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode request tidak diizinkan!"]);
    exit();
}

try {
    // Admin only, sama seperti endpoint pengelolaan produk lain
    $user = require_role($pdo, 'admin');

    $stmt = $pdo->query(
        "SELECT category, COUNT(*) AS total_products
         FROM products
         WHERE category IS NOT NULL AND category <> ''
         GROUP BY category
         ORDER BY category ASC"
    );
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $categories = array_map(function ($row) {
        return [
            "name"           => $row['category'],
            "total_products" => intval($row['total_products']),
        ];
    }, $rows);

    http_response_code(200);
    echo json_encode([
        "status"     => "success",
        "categories" => $categories,
    ]);
} catch (PDOException $e) {
    error_log("get_categories error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal memuat kategori."]);
}