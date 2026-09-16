<?php
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../config/auth_middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode tidak diizinkan"]);
    exit();
}

try {
    $user = authenticate_user($pdo); // returns user from DB (includes role)

    // Hapus field sensitif jika ada
    unset($user['password']);

    http_response_code(200);
    echo json_encode(["status" => "success", "user" => $user]);
} catch (Exception $e) {
    error_log("me.php error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal mengambil profil pengguna"]);
}

