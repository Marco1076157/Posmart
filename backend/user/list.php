<?php
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../config/auth_middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Hanya admin yang boleh melihat daftar user
$user = require_role($pdo, 'admin');

try {
    $stmt = $pdo->query("SELECT id, name, email, phone, address, role, created_at FROM users ORDER BY id ASC");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode(["status"=>"success","users"=>$users]);
} catch (PDOException $e) {
    error_log('user_list error: '.$e->getMessage());
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Gagal memuat daftar user"]);
}

