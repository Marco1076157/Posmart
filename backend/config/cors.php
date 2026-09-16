<?php
// File: cors.php

// =========================================================================
// SECURITY LAYER: CORS & REQ METHOD CONFIGURATION
// =========================================================================

// Definisikan origin yang diizinkan (Sesuaikan port dengan Vite Anda)
// 1. Ambil origin browser yang menembak API
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// 2. Daftar domain frontend yang diizinkan
$allowed_origins = [
    "http://localhost:5173",
    "https://posmart.com"
];

// 3. Set Access-Control-Allow-Origin secara dinamis
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    // Fallback aman untuk produksi
    header("Access-Control-Allow-Origin: https://posmart.com");
}

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Access-Token, X-Requested-With");

// Handler untuk pre-flight request dari Axios (Metode OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}

/**
 * Fungsi Pembantu untuk Sanitasi Input String (Anti XSS)
 */
function sanitize_string($data) {
    if (empty($data)) return '';
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}
