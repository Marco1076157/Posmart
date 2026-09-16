<?php
// File: /user/register.php
// ===========================================
// REGISTER ENDPOINT - User Registration
// ===========================================

// 1. Load konfigurasi dan security
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db_connect.php';

// 2. Cek method request (hanya POST)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => "error", 
        "message" => "Metode tidak diizinkan. Gunakan POST."
    ]);
    exit();
}

// 3. Ambil dan decode data JSON dari body request
$data = json_decode(file_get_contents("php://input"), true);

// 4. Validasi input (semua field wajib diisi)
$required_fields = ['name', 'email', 'password', 'repeat_password', 'phone', 'address'];
foreach ($required_fields as $field) {
    if (empty(trim($data[$field] ?? ''))) {
        http_response_code(400);
        echo json_encode([
            "status" => "error", 
            "message" => "Field '$field' wajib diisi."
        ]);
        exit();
    }
}

// 5. Sanitasi dan trim input
$name = trim($data['name']);
$email = filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL);
$password = $data['password'];
$repeat_password = $data['repeat_password'];
$phone = trim($data['phone']);
$address = trim($data['address']);

// 6. Validasi email format
if (!$email) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "Format email tidak valid."
    ]);
    exit();
}

// 7. Validasi password (minimal 6 karakter)
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "Password minimal 6 karakter."
    ]);
    exit();
}

// 8. Validasi password match
if ($password !== $repeat_password) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "Password dan Repeat Password tidak sama."
    ]);
    exit();
}

try {
    // 9. Cek koneksi database
    if (!isset($pdo)) {
        ob_clean();
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => "Koneksi database gagal."
        ]);
        exit();
    }

    // 10. Cek apakah email atau nomor telepon sudah terdaftar
    $stmt = $pdo->prepare("SELECT email, phone FROM users WHERE email = ? OR phone = ?");
    $stmt->execute([$email, $phone]);
    $existingRows = $stmt->fetchAll();

    $emailExists = false;
    $phoneExists = false;
    foreach ($existingRows as $row) {
        if ($row['email'] === $email) {
            $emailExists = true;
        }
        if ($row['phone'] === $phone) {
            $phoneExists = true;
        }
    }

    if ($emailExists || $phoneExists) {
        $message = '';
        if ($emailExists && $phoneExists) {
            $message = "Email dan nomor telepon sudah terdaftar.";
        } elseif ($emailExists) {
            $message = "Email sudah terdaftar.";
        } else {
            $message = "Nomor telepon sudah terdaftar.";
        }

        http_response_code(409);
        echo json_encode([
            "status" => "error",
            "message" => $message
        ]);
        exit();
    }

    // 12. Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 13. Insert user baru ke database
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, phone, address, role) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    // Default role = 'user' (bisa disesuaikan)
    $default_role = 'user';
    $stmt->execute([$name, $email, $hashed_password, $phone, $address, $default_role]);

    // 14. Ambil ID user yang baru dibuat
    $user_id = $pdo->lastInsertId();

    // 15. Response sukses
    http_response_code(201); // Created
    echo json_encode([
        "status" => "success",
        "message" => "Registrasi berhasil! Silakan login.",
        "user" => [
            "id" => $user_id,
            "name" => $name,
            "email" => $email,
            "phone" => $phone,
            "address" => $address,
            "role" => $default_role
        ]
    ]);

} catch (PDOException $e) {
    // Error database
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Error Database: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    // Error umum
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Error: " . $e->getMessage()
    ]);
}