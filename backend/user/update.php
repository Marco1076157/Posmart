<?php
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../config/auth_middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(["status"=>"error","message"=>"Metode tidak diizinkan"]);
    exit();
}

$admin = require_role($pdo, 'admin');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["status"=>"error","message"=>"Payload tidak valid"]);
    exit();
}

$id = intval($data['id']);
$fields = [];
$params = [];
$allowed = ['name','email','phone','address','role','password'];

foreach ($allowed as $col) {
    if (isset($data[$col])) {
        if ($col === 'password') {
            $fields[] = "password = ?";
            $params[] = password_hash($data['password'], PASSWORD_BCRYPT);
        } else {
            $fields[] = "$col = ?";
            $params[] = $data[$col];
        }
    }
}

if (count($fields) === 0) {
    http_response_code(400);
    echo json_encode(["status"=>"error","message"=>"Tidak ada field untuk diupdate"]);
    exit();
}

$params[] = $id;
$sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    http_response_code(200);
    echo json_encode(["status"=>"success","message"=>"User diperbarui"]);
} catch (PDOException $e) {
    error_log('user_update error: '.$e->getMessage());
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Gagal memperbarui user"]);
}

