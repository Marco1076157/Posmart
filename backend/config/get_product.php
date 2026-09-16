<?php
// backend/config/get_product.php
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); //Not Allowed
    echo json_encode([
        "status" => "error",
        "message" => "Metode request tidak diizinkan!"
    ]);
    exit();
}

try{
   $page        = isset($_GET['page']) ? intval($_GET['page']) : 1;
   $perPage     = isset($_GET['per_page']) ? intval($_GET['per_page']) : 1;
   $search      = isset($_GET['search']) ? trim($_GET['search']) : '';
   $category    = isset($_GET['category']) ? trim($_GET['category']) : '';

   if ($page < 1 ) $page = 1;

   //Pagination offset
   $offset = ($page - 1) * $perPage;

   // Setup WHERE dinamis
   $condition = [];
   $bindings  = [];

   // Based on "Search"
   if (!empty($search)) {
    $condition = "name LIKE :search";
    $bindings[':search'] = "%" . $search . "%"; // % = wildcart 
   }

   if (!empty($category) && $category !== 'All') {
        $condition = "category = :category";
        $bindings[':category'] = $category;
   }

   // final
   $whereSQL = "";
   if (count($condition) > 0) {
        $whereSQL = "WHERE " . implode(" AND ", $condition);
   }
  
   // Hitung total query
   $countQuery = "SELECT COUNT(*) FROM products $whereSQL";
   $countStmt  = $pdo->prepare($countQuery);
   foreach ($bindings as $key => $value) {
        $countStmt->bindValue($key, $value);
   }
   $countStmt->execute();
   $tableProducts = $countStmt->fetchColumn();
   $totalPage     = ceil($tableProducts / $perPage);

   //Main query
   $query = "SELECT id, barcode, name, price, category, rating, stock, is_promo, promo, image 
            FROM products
            $whereSQL
            ORDER BY id ASC
            LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($query);
    foreach ($bindings as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedProducts = [];
    foreach ($products as $product) {
        $formattedProducts[] = [
            "id"        => intval($product['id']),
            "barcode"   => $product['barcode'],
            "name"      => $product['name'],
            "price"     => intval($product['price']),
            "category"  => $product['category'],
            "rating"    => floatval($product['rating']),
            "stock"     => intval($product['stock']),
            "is_promo"  => intval($product['is_promo']),
            "promo"     => intval($product['promo']),
            "image"     => $product['image'],
        ];
    }

    http_response_code(200);
    echo json_encode([
        "status"       => "success",
        "products"     => $formattedProducts,
        "pagination"   => [
            "current_page" => $page,
            "total_page"   => max(1, $totalPage),
            "total_data"   => intval($tableProducts)
        ]
    ]);
} catch (PDOException $e){
    error_log("search & Filter error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal melakukan pencarian produk..."]);
}
