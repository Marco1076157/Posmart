<?php
// File: backend/api/jwt_helper.php

if (!defined('JWT_SECRET')) {
    $config = require __DIR__ . '/env.php';
    define('JWT_SECRET', $config['jwt_secret']);
}

function generate_jwt($payload) {
    // 1. Buat Header
    $headers = ['alg' => 'HS256', 'typ' => 'JWT'];
    $headers_encoded = base64url_encode(json_encode($headers));
    
    // 2. Set Expired (+1 Hari) jika belum ditentukan
    if (!isset($payload['exp'])) {
        $payload['exp'] = time() + (60 * 60 * 24); 
    }
    $payload_encoded = base64url_encode(json_encode($payload));
    
    // 3. Buat Signature Cryptographic
    $signature = hash_hmac('sha256', "$headers_encoded.$payload_encoded", JWT_SECRET, true);
    $signature_encoded = base64url_encode($signature);
    
    // 4. Gabungkan menjadi string JWT utuh
    return "$headers_encoded.$payload_encoded.$signature_encoded";
}

function verify_jwt($token) {
    $tokenParts = explode('.', $token);
    if (count($tokenParts) !== 3) return false;

    $headers_encoded = $tokenParts[0];
    $payload_encoded = $tokenParts[1];
    $signature_provided = $tokenParts[2];

    // Bangun ulang signature untuk verifikasi keaslian data
    $signature = hash_hmac('sha256', "$headers_encoded.$payload_encoded", JWT_SECRET, true);
    $signature_actual = base64url_encode($signature);

    // Cek apakah signature COCOK
    if (!hash_equals($signature_actual, $signature_provided)) {
        return false; 
    }

    // Decode Payload
    $payload = json_decode(base64url_decode($payload_encoded), true);

    // Cek apakah token sudah kedaluwarsa
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false; 
    }

    return $payload;
}

// Fungsi pembantu pembungkus Base64 agar ramah URL (URL-Safe Base64)
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}
