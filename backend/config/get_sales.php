<?php
// backend/config/get_sales.php
// Data untuk menu Sales & ringkasan chart di Dashboard (line chart total penjualan + pie chart kategori).

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth_middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode request tidak diizinkan."]);
    exit();
}

try {
    // require_role() sudah otomatis memanggil authenticate_user(), yang sekarang
    // juga mengirim header Cache-Control: no-store (lihat auth_middleware.php).
    $user = require_role($pdo, 'admin');

    // Berapa hari terakhir yang mau ditampilkan di line chart (default 14 hari)
    $days = isset($_GET['days']) ? max(1, min(90, intval($_GET['days']))) : 14;

    // ----- Ringkasan total -----
    $summaryStmt = $pdo->query(
        "SELECT COALESCE(SUM(total_price), 0) AS total_revenue,
                COUNT(*) AS total_orders
         FROM orders"
    );
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    $totalRevenue = floatval($summary['total_revenue']);
    $totalOrders  = intval($summary['total_orders']);
    $avgOrder     = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

    // ----- Tren penjualan harian (line chart) -----
    $dailyStmt = $pdo->prepare(
        "SELECT DATE(created_at) AS day, DATE_FORMAT(created_at, '%d %b') AS label,
                SUM(total_price) AS total, COUNT(*) AS orders
         FROM orders
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
         -- MySQL dengan ONLY_FULL_GROUP_BY mewajibkan semua ekspresi tanggal
         -- non-agregat pada SELECT ikut dikelompokkan.
         GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%d %b')
         ORDER BY DATE(created_at) ASC"
    );
    $dailyStmt->bindValue(':days', $days, PDO::PARAM_INT);
    $dailyStmt->execute();
    $dailyRows = $dailyStmt->fetchAll(PDO::FETCH_ASSOC);

    // ----- Penjualan per kategori (pie chart) -----
    $categoryStmt = $pdo->query(
        "SELECT COALESCE(p.category, 'Lainnya') AS category,
                SUM(oi.total) AS total, SUM(oi.qty) AS items
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         GROUP BY category
         ORDER BY total DESC"
    );
    $categoryRows = $categoryStmt->fetchAll(PDO::FETCH_ASSOC);

    $totalCategoryRevenue = array_reduce($categoryRows, function ($carry, $row) {
        return $carry + floatval($row['total']);
    }, 0);

    $categories = array_map(function ($row) use ($totalCategoryRevenue) {
        $total = floatval($row['total']);
        return [
            'category' => $row['category'],
            'total'    => $total,
            'items'    => intval($row['items']),
            'share'    => $totalCategoryRevenue > 0 ? round(($total / $totalCategoryRevenue) * 100, 1) : 0,
        ];
    }, $categoryRows);

    // ----- Top 5 produk terlaris (bonus, dipakai di tabel Sales) -----
    $topStmt = $pdo->query(
        "SELECT p.name, SUM(oi.qty) AS qty, SUM(oi.total) AS total
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         GROUP BY oi.product_id
         ORDER BY total DESC
         LIMIT 5"
    );
    $topRows = $topStmt->fetchAll(PDO::FETCH_ASSOC);
    $topProducts = array_map(function ($row) {
        return [
            'name'  => $row['name'] ?? 'Produk dihapus',
            'qty'   => intval($row['qty']),
            'total' => floatval($row['total']),
        ];
    }, $topRows);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data'   => [
            'totalRevenue' => $totalRevenue,
            'totalOrders'  => $totalOrders,
            'avgOrder'     => $avgOrder,
            'daily'        => array_map(function ($row) {
                return [
                    'label' => $row['label'],
                    'total' => floatval($row['total']),
                    'orders' => intval($row['orders']),
                ];
            }, $dailyRows),
            'categories'   => $categories,
            'topProducts'  => $topProducts,
        ],
    ]);
} catch (Exception $e) {
    error_log('get_sales.php error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal mengambil data sales dari database."]);
}
