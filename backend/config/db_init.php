<?php
// File: api/db_init.php

header("Content-Type: application/json; charset=UTF-8");

$config = require __DIR__ . '/env.php';
$database = $config['database'];

$host = $database['host'];
$user = $database['user'];
$pass = $database['password'];
$dbname = $database['name'];

try {
    // 1. Koneksi awal ke server MySQL 
    $db = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // 2. Buat Database jika belum ada
    $db->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $db->exec("USE `$dbname`");

    // =========================================================================
    // 1. BUAT TABEL USERS 
    // =========================================================================
    $tableUsers = "CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `google_id` VARCHAR(255) DEFAULT NULL,
        `name` VARCHAR(150) NOT NULL,
        `email` VARCHAR(100) NOT NULL UNIQUE,
        `password` VARCHAR(255) DEFAULT NULL,
        `phone` VARCHAR(20) DEFAULT NULL,
        `address` TEXT DEFAULT NULL,
        `role` enum('user','admin','cashier') DEFAULT 'user',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_email` (`email`),
        INDEX `idx_google` (`google_id`)
    ) ENGINE=InnoDB;";
    $db->exec($tableUsers);

    // =========================================================================
    // 2. BUAT TABEL MASTER LAINNYA
    // =========================================================================
    $tableProducts = "CREATE TABLE IF NOT EXISTS `products` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `barcode` VARCHAR(20) UNIQUE NOT NULL,
        `name` VARCHAR(150) NOT NULL,
        `price` INT NOT NULL,
        `category` VARCHAR(50) NOT NULL,
        `rating` DECIMAL(2,1) DEFAULT 0.0,
        `stock` INT DEFAULT 0,
        `is_promo` TINYINT(1) DEFAULT 0,
        `promo` INT DEFAULT 0,
        `image` VARCHAR(255) DEFAULT 'placeholder.jpg',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_price` (`price`),
        INDEX `idx_promo` (`is_promo`),
        INDEX `idx_catalog_filter` (`category`, `price`, `is_promo`)
    ) ENGINE=InnoDB;";
    $db->exec($tableProducts);

    $tableOrders = "CREATE TABLE IF NOT EXISTS `orders` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `customer_name` VARCHAR(150) NOT NULL,
        `phone` VARCHAR(20) NOT NULL,
        `address` TEXT NOT NULL,
        `courier` VARCHAR(30) NOT NULL,
        `total_price` DECIMAL(10,2) NOT NULL,
        `status` VARCHAR(30) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_orders_user FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;";
    $db->exec($tableOrders);

    // =========================================================================
    // 3. BUAT TABEL DETAIL (YANG MEMILIKI FOREIGN KEY)
    // =========================================================================
    $tableOrderItems = "CREATE TABLE IF NOT EXISTS `order_items` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `order_id` INT NOT NULL,
        `product_id` INT NOT NULL,
        `qty` INT NOT NULL,
        `price` DECIMAL(10,2) NOT NULL,
        `total` DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;";
    $db->exec($tableOrderItems);

    // =========================================================================
    // AUTOMATIC SEEDING DATA (DENGAN MENONAKTIFKAN KUNCI RELEVAN SEMENTARA)
    // =========================================================================
    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $db->exec("TRUNCATE TABLE `products`");
    $db->exec("TRUNCATE TABLE `users`");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // --- SEEDING TABEL PRODUK ---
    $insertProductStmt = $db->prepare("INSERT INTO `products` (`barcode`, `name`, `price`, `category`, `rating`, `stock`, `is_promo`, `promo`, `image`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $seedProducts = [
        ['122320', 'Indomie Goreng Spesial 85g', 3100, 'Food', 4.9, 40, 1, 10, 'indomie.png'],
        ['122324', 'Aqua Air Mineral Botol 600ml', 3500, 'Beverage', 4.8, 120, 0, 0, 'aqua.jpg'],
        ['175003', 'Pepsodent Pasta Gigi Action 120g', 14500, 'Personal Care', 4.7, 15, 1, 15, 'pepsodent.jpg'],
        ['145747', 'Bimoli Minyak Goreng Botol 1L', 18500, 'Food', 4.6, 8, 0, 0, 'bimoli.jpg'],
        ['128259', 'Coca Cola Rasa Original 250ml', 5500, 'Beverage', 4.5, 0, 1, 10, 'coca.jpg'],
        ['122510', 'Beras Setra Ramos 5Kg', 78750, 'Food', 4.8, 22, 0, 0, 'beras.jpg']
    ];

    foreach ($seedProducts as $product) {
        $insertProductStmt->execute($product);
    }

    // --- SEEDING TABEL USER ---
    $seedUsers = [
        [
            'name'     => 'Cashier POSMart',
            'email'    => 'cashier@posmart.com',
            'password' => 'password123',
            'phone'    => '01234567890',
            'address'  => 'PS Rebo',
            'role'     => 'cashier'
        ],
        [
            'name'     => 'Admin POSMart',
            'email'    => 'admin@posmart.com',
            'password' => 'posmart2026',
            'phone'    => '01234567890',
            'address'  => 'Ciracas',
            'role'     => 'admin'
        ]
    ];

    $insertUserStmt = $db->prepare("INSERT INTO users (name, email, password, phone, address, role) 
    VALUES (:name, :email, :password, :phone, :address, :role)");
    $user_seeded_logs = [];

    foreach ($seedUsers as $user) {
        $hashed_password = password_hash($user['password'], PASSWORD_BCRYPT);
        $insertUserStmt->execute([
            ':name'     => $user['name'],
            ':email'    => $user['email'],
            ':password' => $hashed_password,
            ':phone'    => $user['phone'],
            ':address'  => $user['address'],
            ':role'     => $user['role']
        ]);
        $user_seeded_logs[] = "{$user['name']} ({$user['email']})";
    }

    // =========================================================================
    // RESPONS FINAL TUNGGAL (JSON VALID)
    // =========================================================================
    http_response_code(200);
    echo json_encode([
        "status" => "success", 
        "message" => "Skema database berhasil di-reset!",
        "details" => [
            "products_seeded" => count($seedProducts),
            "users_seeded" => $user_seeded_logs
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Sinkronisasi database gagal: " . $e->getMessage()
    ]);
}
