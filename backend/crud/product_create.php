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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

if (!$data) {
    http_response_code(400);
    echo json_encode(["status"=>"error","message"=>"Payload tidak valid"]);
    exit();
}

$barcode = isset($data['barcode']) ? trim($data['barcode']) : '';
$name = isset($data['name']) ? trim($data['name']) : '';
$price = isset($data['price']) ? intval($data['price']) : 0;
$category = isset($data['category']) ? trim($data['category']) : '';
$stock = isset($data['stock']) ? intval($data['stock']) : 0;
$is_promo = isset($data['is_promo']) ? intval($data['is_promo']) : 0;
$promo = isset($data['promo']) ? intval($data['promo']) : 0;
$image = isset($data['image']) ? trim($data['image']) : '';

if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = realpath(__DIR__ . '/../products');
    if ($uploadDir && is_dir($uploadDir)) {
        $tmpName = $_FILES['image_file']['tmp_name'];
        $originalName = basename($_FILES['image_file']['name']);
        $safeName = preg_replace('/[^A-Za-z0-9_.-]/', '_', $originalName);
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $safeName;
        if (move_uploaded_file($tmpName, $destination)) {
            $image = $safeName;
        }
    }
}

if (empty($barcode) || empty($name) || $price <= 0) {
    http_response_code(422);
    echo json_encode(["status"=>"error","message"=>"Data produk tidak lengkap"]);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO products (barcode, name, price, category, stock, is_promo, promo, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$barcode, $name, $price, $category, $stock, $is_promo, $promo, $image]);
    $id = $pdo->lastInsertId();

    http_response_code(201);
    echo json_encode(["status"=>"success","message"=>"Produk dibuat","id"=>intval($id)]);
} catch (PDOException $e) {
    error_log('product_create error: '.$e->getMessage());
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Gagal membuat produk"]);
}

