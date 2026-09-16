<?php

// Salin file ini menjadi env.php, lalu isi nilai yang sesuai dengan komputer
// atau server Anda. File env.php sengaja tidak diunggah ke Git.
return [
    'database' => [
        'host' => 'localhost',
        'user' => 'root',
        'password' => 'ganti_dengan_password_mysql',
        'name' => 'db_posmart',
    ],
    // Gunakan string acak yang panjang dan unik untuk tiap environment.
    'jwt_secret' => 'ganti_dengan_jwt_secret_yang_acak_dan_panjang',
    'google' => [
        'client_id' => 'ganti_dengan_google_oauth_client_id',
        'client_secret' => 'ganti_dengan_google_oauth_client_secret',
    ],
];
