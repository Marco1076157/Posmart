<?php
// File: cart/create_order.php

// =========================================================================
// SECURITY LAYER 1: CORS & HEADER PROTECTION
// =========================================================================
require_once __DIR__ . '/../config/cors.php';       // Gateway CORS
require_once __DIR__ . '/../config/db_connect.php';         // Koneksi PDO
require_once __DIR__ . '/../config/auth_middleware.php'; // Proteksi Login


// Jika user belum login, reject request dengan kode 401 dan stop eksekusi
$currentUser = authenticate_user($pdo);

// Jika lolos, ambil ID user 
$userId = $currentUser['id'];
if (!$userId) {
    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "User Tidak dikenal."]);
    exit();
}

// =========================================================================
// SECURITY LAYER 2: RAW INPUT SANITIZATION
// =========================================================================
// Mengambil payload JSON mentah dari Axios
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// Jika JSON tidak valid atau kosong
if (!$data) {
    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "Format JSON tidak valid."]);
    exit();
}

// Validasi & Sanitasi Data String (Mencegah XSS Injection)
$customerName = isset($data['customer_name']) ? htmlspecialchars(strip_tags(trim($data['customer_name'])), ENT_QUOTES, 'UTF-8') : '';
$phone = isset($data['phone']) ? htmlspecialchars(strip_tags(trim($data['phone'])), ENT_QUOTES, 'UTF-8') : '';
$address = isset($data['address']) ? htmlspecialchars(strip_tags(trim($data['address'])), ENT_QUOTES, 'UTF-8') : '';
$courier = isset($data['courier']) ? htmlspecialchars(strip_tags(trim($data['courier'])), ENT_QUOTES, 'UTF-8') : '';
$totalPrice = isset($data['total_price']) ? filter_var($data['total_price'], FILTER_VALIDATE_INT) : 0;

$cartItems = $data['items'] ?? []; // Mengambil itemReport dari React
$totalPrice = isset($data['total_price']) ? filter_var($data['total_price'], FILTER_VALIDATE_INT) : 0;

// Cek apakah data esensial kosong
if (empty($customerName) || empty($phone) || empty($address) || empty($cartItems) || $totalPrice <= 0) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap atau keranjang kosong."]);
    exit();
}

// =========================================================================
// SECURITY LAYER 3: DATABASE TRANSACTION (ANTI SQL INJECTION)
// =========================================================================
try {
    // =========================================================================
    // WAJIB: NYALAKAN FITUR TRANSAKSI MYSQL
    // =========================================================================
    $pdo->beginTransaction();

    // 1. Buat record Order Utama terlebih dahulu
    $orderStmt = $pdo->prepare("INSERT INTO orders (user_id, customer_name, phone, address, courier, total_price, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())");
    $orderStmt->execute([$userId, $customerName, $phone, $address, $courier, $totalPrice]);
    $orderId = $pdo->lastInsertId();

    // 2. Iterasi setiap barang di keranjang untuk divalidasi stoknya
    foreach ($cartItems as $item) {
        $productId = intval($item['id']);
        $qtyBuy = intval($item['qty']);

        // CRITICAL: Gunakan FOR UPDATE untuk mengunci baris produk ini dari user lain!
        $stockStmt = $pdo->prepare("SELECT name, stock FROM products WHERE id = ? FOR UPDATE");
        $stockStmt->execute([$productId]);
        $product = $stockStmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            throw new Exception("Produk dengan ID $productId tidak ditemukan.");
        }

        // Validasi: Apakah stok mencukupi?
        if ($product['stock'] < $qtyBuy) {
            // Jika stok tidak cukup, batalkan seluruh rangkaian pemesanan!
            throw new Exception("Stok untuk produk '" . $product['name'] . "' tidak mencukupi. Sisa stok: " . $product['stock']);
        }

        // 3. Jika aman, KURANGI STOK DETIK ITU JUGA
        $updateStockStmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        $updateStockStmt->execute([$qtyBuy, $productId]);

        // 4. Masukkan ke tabel detail order (order_items)
        $itemStmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, qty, price, total) VALUES (?, ?, ?, ?, ?)");
        // Asumsi harga dikirim dari database atau divalidasi lagi
        $itemStmt->execute([$orderId, $productId, $qtyBuy, $item['price'], $qtyBuy * $item['price']]);
    }

    // =========================================================================
    // JIKA SEMUA BARANG LOLOS VALIDASI: SIMPAN PERUBAHAN SECARA PERMANEN
    // =========================================================================
    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        "status" => "success",
        "message" => "Checkout berhasil! Stok telah diamankan.",
        "order_id" => $orderId,
        "customer_id" => $userId
    ]);
} catch (Exception $e) {
    // ================================   ACID   ===============================
    // JIKA ADA SATU SAJA BARANG YANG GAGAL/KURANG: BATALKAN SEMUA PROSES DI ATAS!
    // =========================================================================
    $pdo->rollBack(); // Mengembalikan stok yang terlanjur berkurang ke kondisi semula

    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal memproses checkout: " . $e->getMessage()
    ]);
}
