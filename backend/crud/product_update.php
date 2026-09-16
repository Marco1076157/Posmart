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

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode tidak diizinkan"]);
    exit();
}

$user = require_role($pdo, 'admin');

$data = [];

if (isset($_SERVER['CONTENT_TYPE']) && str_contains($_SERVER['CONTENT_TYPE'], 'multipart/form-data')) {
    $data = $_POST;
} else {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
}

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["status"=>"error","message"=>"Payload tidak valid"]);
    exit();
}

$id = intval($data['id']);
if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = realpath(__DIR__ . '/../products');
    if ($uploadDir && is_dir($uploadDir)) {
        $tmpName = $_FILES['image_file']['tmp_name'];
        $originalName = basename($_FILES['image_file']['name']);
        $safeName = preg_replace('/[^A-Za-z0-9_.-]/', '_', $originalName);
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $safeName;
        if (move_uploaded_file($tmpName, $destination)) {
            $data['image'] = $safeName;
        }
    }
}

$fields = [];
$params = [];

$allowed = ['barcode','name','price','category','stock','is_promo','promo','image'];
foreach ($allowed as $col) {
    if (isset($data[$col])) {
        $fields[] = "$col = ?";
        $params[] = $data[$col];
    }
}

if (count($fields) === 0) {
    http_response_code(400);
    echo json_encode(["status"=>"error","message"=>"Tidak ada field untuk diupdate"]);
    exit();
}

$params[] = $id;
$sql = "UPDATE products SET " . implode(", ", $fields) . " WHERE id = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    http_response_code(200);
    echo json_encode(["status"=>"success","message"=>"Produk diperbarui"]);
} catch (PDOException $e) {
    error_log('product_update error: '.$e->getMessage());
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Gagal memperbarui produk"]);
}

