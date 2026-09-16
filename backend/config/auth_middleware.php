<?php
// File: backend/api/auth_middleware.php

require_once __DIR__ . '/jwt_helper.php';

function authenticate_user($pdo) {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return true; 
    }

    // =========================================================================
    // SECURITY: cegah browser/back-forward-cache menyimpan response halaman
    // yang butuh login. Tanpa ini, setelah logout lalu pencet tombol "Back",
    // browser bisa menampilkan data lama dari cache tanpa menembak API lagi.
    // =========================================================================
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Pragma: no-cache");

    $authHeader = '';
    
    // =========================================================================
    // JALUR 1: CEK DARI HEADER (BAWAAN)
    // =========================================================================
    $headers = array_change_key_case(getallheaders(), CASE_LOWER);
    if (!empty($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    // Ekstrak string token jika ditemukan di header
    $jwtToken = '';
    if (!empty($authHeader)) {
        $tokenParts = explode(" ", $authHeader);
        if (count($tokenParts) === 2 && strtolower($tokenParts[0]) === 'bearer') {
            $jwtToken = $tokenParts[1];
        }
    }

    // Sebagian hosting Apache/FastCGI menghapus header Authorization sebelum
    // request sampai ke PHP. Frontend juga mengirim X-Access-Token sebagai
    // jalur cadangan agar endpoint GET yang tidak memiliki body tetap dapat
    // diautentikasi.
    if (empty($jwtToken)) {
        if (!empty($headers['x-access-token'])) {
            $jwtToken = trim($headers['x-access-token']);
        } elseif (!empty($_SERVER['HTTP_X_ACCESS_TOKEN'])) {
            $jwtToken = trim($_SERVER['HTTP_X_ACCESS_TOKEN']);
        }
    }

    // =========================================================================
    // JALUR 2: CADANGAN MUTLAK - CEK DARI BODY JSON (ANTI-BLOKIR APACHE)
    // =========================================================================
    if (empty($jwtToken)) {
        // Baca isi php://input  di semua file yang perlu authentication
        $rawInput = file_get_contents("php://input");
        $jsonData = json_decode($rawInput, true);
        
        if (!empty($jsonData['access_token'])) {
            $jwtToken = $jsonData['access_token'];
        }
    }

    // Jika di header kosong DAN di body JSON juga kosong, baru kunci 401
    if (empty($jwtToken)) {
        http_response_code(401);
        echo json_encode([
            "status" => "error", 
            "message" => "Token tidak ditemukan di Header maupun Body. Silakan login kembali."
        ]);
        exit(); // send response back to api (AXIOS)
    }

    // =========================================================================
    // PROSES VERIFIKASI TOKEN (SAMA SEPERTI SEBELUMNYA)
    // =========================================================================
    $decodedPayload = verify_jwt($jwtToken);
    if (!$decodedPayload) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Token kedaluwarsa atau tidak sah. Akses ditolak."]);
        exit();
    }

    // Ambil data dari DB
    $stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$decodedPayload['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "User pemilik token ini sudah tidak terdaftar."]);
        exit();
    }

    return $user;
}

// Fungsi untuk memastikan user punya role yang dibutuhkan (mis. 'admin')
function require_role($pdo, $required_role) {
    $user = authenticate_user($pdo);

    if (!$user || !isset($user['role'])) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Role pengguna tidak ditemukan. Akses ditolak."]);
        exit();
    }

    // Izinkan multiple roles (array) atau string tunggal
    if (is_array($required_role)) {
        if (!in_array($user['role'], $required_role)) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Akses dibatasi untuk role tertentu."]);
            exit();
        }
    } else {
        if ($user['role'] !== $required_role) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Akses dibatasi untuk role {$required_role}."]);
            exit();
        }
    }

    return $user;
}
