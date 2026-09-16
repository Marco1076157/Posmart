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
    echo json_encode(["status"=>"error","message"=>"Metode tidak diizinkan"]);
    exit();
}

$admin = require_role($pdo, 'admin');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["status"=>"error","message"=>"Payload tidak valid"]);
    exit();
}

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$phone = trim($data['phone'] ?? '');
$address = trim($data['address'] ?? '');
$role = in_array($data['role'] ?? '', ['user','admin','cashier']) ? $data['role'] : 'user';

if (empty($name) || empty($email) || empty($password)) {
    http_response_code(422);
    echo json_encode(["status"=>"error","message"=>"Data wajib belum lengkap"]);
    exit();
}

try {
    $hashed = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $hashed, $phone, $address, $role]);
    $id = $pdo->lastInsertId();
    http_response_code(201);
    echo json_encode(["status"=>"success","message"=>"User dibuat","id"=>intval($id)]);
} catch (PDOException $e) {
    error_log('user_create error: '.$e->getMessage());
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Gagal membuat user"]);
}

