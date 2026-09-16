<?php
//File: /user/login.php

require_once  __DIR__.'/../config/cors.php';
require_once  __DIR__.'/../config/db_connect.php';
require_once  __DIR__.'/../config/jwt_helper.php';

if($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode tidak diizinkan."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$email = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = $data['password'] ?? '';

if (!$email || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "e-Mail dan Password wajib diisi."]);
    exit();
}

try {
    if (!isset($pdo)){
        ob_clean();//reset output buffer
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Koneksi database gagal."]);
        exit();
    };

    $stmt = $pdo->prepare("SELECT id, name, password, phone, address, role
     FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "e-Mail tidak terdaftar."]);
        exit();
    }

    if (password_verify($password, $user['password'])) {
        $tokenPayload = [
            "user_id" => $user['id'],
            "name"    => $user['name'],
            "email"   => $email
        ];

        $jwtToken = generate_jwt($tokenPayload);


        http_response_code(200);
        echo json_encode([
            "status" => "success", 
            "token" => $jwtToken,
            "user"  => [
                "name" => $user['name'],
                "email" => $email,
                "phone" => $user['phone'],
                "address" => $user['address'],
                "role" => $user['role']
            ]
        ]);
        exit();

    } else {
        ob_clean();//reset output buffer
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Password tidak sesuai."]);
        exit();
    }



}catch (PDOException $e){
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error Database: " .$e->getMessage()]);
    exit();
}
catch (Exception $e){
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error: " .$e->getMessage()]);
    exit();
}

