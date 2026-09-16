<?php
// File: auth/google.php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../config/jwt_helper.php'; // Pastikan fungsi generate_jwt() Anda siap

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method tidak diizinkan."]);
    exit();
}

// 1. Ambil Authorization Code dari React payload
$rawInput = file_get_contents("php://input");
$requestData = json_decode($rawInput, true);
$code = $requestData['code'] ?? '';

if (empty($code)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Authorization code dari Google tidak ditemukan."]);
    exit();
}

// CONFIG OAUTH GOOGLE (dimuat dari file lokal yang tidak di-commit)
$config = require __DIR__ . '/../config/env.php';
$clientId     = $config['google']['client_id'];
$clientSecret = $config['google']['client_secret'];
$redirectUri  = "postmessage"; // 'postmessage' adalah nilai wajib jika menggunakan @react-oauth/google auth-code flow

try {
    // =========================================================================
    // TAHAP 1: Tukarkan Code dengan Access Token Google melalui cURL
    // =========================================================================
    $tokenUrl = "https://oauth2.googleapis.com/token";
    $postFields = [
        'code'          => $code,
        'client_id'     => $clientId,
        'client_secret' => $clientSecret,
        'redirect_uri'  => $redirectUri,
        'grant_type'    => 'authorization_code'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $tokenUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Matikan jika SSL lokal bermasalah
    $tokenResponse = curl_exec($ch);
    curl_close($ch);

    $tokenData = json_decode($tokenResponse, true);
    
    if (!isset($tokenData['access_token'])) {
        throw new Exception("Gagal mendapatkan Access Token dari Google.");
    }

    $googleAccessToken = $tokenData['access_token'];

    // =========================================================================
    // TAHAP 2: Ambil Data Profil Pengguna dari API Google menggunakan Access Token
    // =========================================================================
    $userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" . $googleAccessToken;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $userInfoUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $userInfoResponse = curl_exec($ch);
    curl_close($ch);

    $googleUser = json_decode($userInfoResponse, true);

    if (!isset($googleUser['email'])) {
        throw new Exception("Gagal mengambil data profil dari Google.");
    }

    $googleId = $googleUser['sub'] ?? ''; // 'sub' adalah ID unik permanen milik user dari Google
    $email = $googleUser['email'];
    $name  = $googleUser['name'] ?? 'Google User';

    // =========================================================================
    // TAHAP 3: Sinkronisasi dengan Database MySQL
    // =========================================================================
    // Cek apakah email user sudah terdaftar di database
    if (empty($googleId)) {
        throw new Exception("Gagal mendapatkan Google ID (sub) dari Google.");
    }

    // 1. Cari berdasarkan google_id terlebih dahulu
    $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE google_id = ? LIMIT 1");
    $stmt->execute([$googleId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // 2. Jika tidak ada google_id, cek apakah email-nya sudah terdaftar (User lama yang baru pertama kali klik "Login Google")
        $stmtEmail = $pdo->prepare("SELECT id, name, email, google_id FROM users WHERE email = ? LIMIT 1");
        $stmtEmail->execute([$email]);
        $userOld = $stmtEmail->fetch(PDO::FETCH_ASSOC);

        if ($userOld) {
            // Tautkan google_id ke akun lama tersebut agar ke depannya langsung sinkron
            $updateStmt = $pdo->prepare("UPDATE users SET google_id = ? WHERE id = ?");
            $updateStmt->execute([$googleId, $userOld['id']]);
            
            $user = [
                "id"    => $userOld['id'],
                "name"  => $userOld['name'],
                "email" => $userOld['email']
            ];
        } else {
            // 3. JIKA BENAR-BENAR BARU: Daftarkan otomatis (Auto-Register) sekalian pasang google_id
            $insertStmt = $pdo->prepare("INSERT INTO users (google_id, name, email, password, created_at) VALUES (?, ?, ?, ?, NOW())");
            $randomPassword = password_hash(bin2hex('123456'), PASSWORD_BCRYPT);
            $insertStmt->execute([$googleId, $name, $email, $randomPassword]);
            
            $user = [
                "id"    => $pdo->lastInsertId(),
                "name"  => $name,
                "email" => $email
            ];
        }
    }

    // =========================================================================
    // TAHAP 4: Terbitkan JWT Token 
    // =========================================================================
    // Struktur payload disamakan dengan sistem login biasa Anda
    $jwtToken = generate_jwt([
        "user_id" => $user['id'],
        "email"   => $user['email']
    ]);

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "token"  => $jwtToken,
        "user"   => [
            "name"  => $user['name'],
            "email" => $user['email']
        ]
    ]);

} catch (Exception $e) {
    error_log("Google OAuth Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Terjadi kesalahan otentikasi Google: " . $e->getMessage()
    ]);
}
