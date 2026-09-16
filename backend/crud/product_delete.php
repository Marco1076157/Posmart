// backend/crud/product_create.php
<?php
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../config/auth_middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode tidak diizinkan"]);
    exit();
}

$user = require_role($pdo, 'admin');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["status"=>"error","message"=>"Payload tidak valid"]);
    exit();
}

$id = intval($data['id']);

try {
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    http_response_code(200);
    echo json_encode(["status"=>"success","message"=>"Produk dihapus"]);
} catch (PDOException $e) {
    error_log('product_delete error: '.$e->getMessage());
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Gagal menghapus produk"]);
}

