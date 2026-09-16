
<?php
// File: backend/config/db_connect.php

$config = require __DIR__ . '/env.php';
$database = $config['database'];

define('DB_HOST', $database['host']);
define('DB_USER', $database['user']);
define('DB_PASS', $database['password']);
define('DB_NAME', $database['name']);

try {
    // Mengaktifkan pdo dengan konfigurasi tingkat keamanan tinggi
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Mengubah error murni sql menjadi Exception PHP
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Fetch sebagai array asosiatif
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Menggunakan prepared statement asli dari MySQL server
    ]);
} catch (PDOException $e) {
    // JANGAN PERNAH menampilkan $e->getMessage() di production karena membocorkan struktur folder/username db
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Koneksi database gagal."]);
    exit();
}
