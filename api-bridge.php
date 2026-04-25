<?php
// CCOMS PHP API Bridge - Replaces Supabase for Hostinger MySQL
// Upload this to your Hostinger public_html or a dedicated api/ directory

// IMPORTANT: Before production, replace '*' with your actual domain
// header('Access-Control-Allow-Origin: https://yourdomain.com');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Database configuration
$db_host = 'localhost';
$db_name = 'u520390024_ccomsdb';
$db_user = 'u520390024_ccomsdbuser';
$db_pass = '2dIta80$WhZXkZp*';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
  exit();
}

$conn->set_charset("utf8mb4");

// Get request details
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_parts = explode('/', trim($request_uri, '/'));
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Session management
session_start();

// Routes
function route_auth() {
  global $conn, $method, $input;

  $action = $_GET['action'] ?? '';

  switch ($action) {
    case 'sign-in':
      return auth_sign_in($conn, $input);
    case 'sign-out':
      return auth_sign_out();
    case 'session':
      return auth_get_session();
    case 'sign-up':
    case 'register':
      return auth_register($conn, $input);
    case 'list-users':
      return auth_list_users($conn);
    case 'delete-user':
      return auth_delete_user($conn, $input);
    default:
      return ['error' => 'Unknown auth action'];
  }
}

function route_table() {
  global $conn, $method, $input;

  $table = $_GET['table'] ?? '';

  if (!is_valid_table($table)) {
    return ['error' => 'Invalid table'];
  }

  switch ($method) {
    case 'GET':
      return table_select($conn, $table);
    case 'POST':
      if (isset($_GET['upsert'])) {
        return table_upsert($conn, $table, $input);
      }
      return table_insert($conn, $table, $input);
    case 'PUT':
      return table_update($conn, $table, $input);
    case 'DELETE':
      return table_delete($conn, $table, $input);
    default:
      return ['error' => 'Method not allowed'];
  }
}

// Authentication functions
function auth_sign_in($conn, $input) {
  $email = $input['email'] ?? '';
  $password = $input['password'] ?? '';

  if (!$email || !$password) {
    return ['error' => 'Email and password required'];
  }

  $stmt = $conn->prepare("SELECT id, email, password FROM users WHERE email = ?");
  $stmt->bind_param("s", $email);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    return ['error' => 'Invalid credentials'];
  }

  $user = $result->fetch_assoc();
  $hashed_password = $user['password'];

  if (!password_verify($password, $hashed_password)) {
    return ['error' => 'Invalid credentials'];
  }

  $_SESSION['user_id'] = $user['id'];
  $_SESSION['user_email'] = $user['email'];

  return [
    'user' => ['id' => $user['id'], 'email' => $user['email']],
    'session' => ['user' => ['id' => $user['id'], 'email' => $user['email']]]
  ];
}

function auth_sign_out() {
  session_destroy();
  return ['success' => true];
}

function auth_get_session() {
  if (isset($_SESSION['user_id'])) {
    return [
      'user' => [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['user_email']
      ]
    ];
  }
  return ['user' => null];
}

function auth_register($conn, $input) {
  $email = $input['email'] ?? '';
  $password = $input['password'] ?? '';

  if (!$email || !$password) {
    return ['error' => 'Email and password required'];
  }

  $hashed_password = password_hash($password, PASSWORD_BCRYPT);

  $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
  $stmt->bind_param("ss", $email, $hashed_password);

  if ($stmt->execute()) {
    $_SESSION['user_id'] = $conn->insert_id;
    $_SESSION['user_email'] = $email;
    return ['success' => true, 'user' => ['id' => $conn->insert_id, 'email' => $email]];
  }

  return ['error' => 'Registration failed: ' . $conn->error];
}

function auth_list_users($conn) {
  if (!isset($_SESSION['user_id'])) {
    return ['error' => 'Unauthorized'];
  }

  $result = $conn->query("SELECT id, email, created_at FROM users ORDER BY created_at DESC");
  if (!$result) {
    return ['error' => 'Query failed'];
  }

  $users = [];
  while ($row = $result->fetch_assoc()) {
    $users[] = [
      'id' => (string)$row['id'],
      'email' => $row['email'],
      'created_at' => $row['created_at'],
      'last_sign_in_at' => null
    ];
  }
  return ['users' => $users];
}

function auth_delete_user($conn, $input) {
  if (!isset($_SESSION['user_id'])) {
    return ['error' => 'Unauthorized'];
  }

  $user_id = $input['id'] ?? ($_GET['id'] ?? '');
  if (!$user_id) {
    return ['error' => 'User ID required'];
  }

  if ((string)$_SESSION['user_id'] === (string)$user_id) {
    return ['error' => 'Cannot delete your own account'];
  }

  $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
  $stmt->bind_param("i", $user_id);
  if ($stmt->execute()) {
    return ['success' => true];
  }
  return ['error' => 'Delete failed: ' . $conn->error];
}

// Table operations
function table_upsert($conn, $table, $input) {
  if (!$input || !is_array($input)) {
    return ['error' => 'Invalid input'];
  }

  $on_conflict = $_GET['on_conflict'] ?? 'id';
  $columns = array_keys($input);
  $values = array_values($input);

  $columns_str = implode(", ", array_map(function($c) {
    return "`" . str_replace("`", "``", $c) . "`";
  }, $columns));
  $placeholders = implode(", ", array_fill(0, count($values), "?"));

  // Build ON DUPLICATE KEY UPDATE clause, skipping the conflict key
  $update_clauses = array_map(function($c) {
    $safe = str_replace("`", "``", $c);
    return "`$safe` = VALUES(`$safe`)";
  }, array_filter($columns, fn($col) => $col !== $on_conflict));

  $query = "INSERT INTO $table ($columns_str) VALUES ($placeholders)";
  if (count($update_clauses) > 0) {
    $query .= " ON DUPLICATE KEY UPDATE " . implode(", ", $update_clauses);
  }

  $stmt = $conn->prepare($query);
  if (!$stmt) {
    return ['error' => 'Prepare failed: ' . $conn->error];
  }

  $types = str_repeat("s", count($values));
  $stmt->bind_param($types, ...$values);

  if ($stmt->execute()) {
    return ['success' => true, 'id' => $conn->insert_id ?: ($input[$on_conflict] ?? null)];
  }
  return ['error' => 'Upsert failed: ' . $conn->error];
}

function is_valid_table($table) {
  $allowed_tables = [
    'blog_posts', 'posts', 'contact_submissions', 'case_studies',
    'team_members', 'seo_scripts', 'pages', 'categories', 'tags',
    'interactions', 'media', 'site_settings', 'redirects', 'error_404_log'
  ];
  return in_array($table, $allowed_tables);
}

function table_select($conn, $table) {
  $query = "SELECT * FROM " . $table;

  // Filters
  $where_clauses = [];

  if (isset($_GET['eq'])) {
    foreach ($_GET['eq'] as $column => $value) {
      $where_clauses[] = $conn->real_escape_string($column) . " = '" . $conn->real_escape_string($value) . "'";
    }
  }

  if (isset($_GET['neq']) && isset($_GET['neq_value'])) {
    $column = $conn->real_escape_string($_GET['neq']);
    $value = $conn->real_escape_string($_GET['neq_value']);
    $where_clauses[] = "$column != '$value'";
  }

  if (isset($_GET['ilike'])) {
    foreach ($_GET['ilike'] as $column => $value) {
      $escaped_value = $conn->real_escape_string($value);
      $where_clauses[] = $conn->real_escape_string($column) . " LIKE '%$escaped_value%'";
    }
  }

  if (isset($_GET['in'])) {
    foreach ($_GET['in'] as $column => $values) {
      if (is_array($values) && count($values) > 0) {
        $escaped_col = $conn->real_escape_string($column);
        $placeholders = implode(', ', array_map(function($v) use ($conn) {
          return "'" . $conn->real_escape_string($v) . "'";
        }, $values));
        $where_clauses[] = "$escaped_col IN ($placeholders)";
      }
    }
  }

  if (count($where_clauses) > 0) {
    $query .= " WHERE " . implode(" AND ", $where_clauses);
  }

  // Order
  if (isset($_GET['order'])) {
    $column = $conn->real_escape_string($_GET['order']);
    $direction = $_GET['order_dir'] ?? 'ASC';
    $query .= " ORDER BY $column " . ($direction === 'desc' ? 'DESC' : 'ASC');
  }

  // Limit
  if (isset($_GET['limit'])) {
    $limit = intval($_GET['limit']);
    $query .= " LIMIT $limit";
  }

  // Count
  if (isset($_GET['count'])) {
    $count_query = "SELECT COUNT(*) as total FROM $table";
    if (count($where_clauses) > 0) {
      $count_query .= " WHERE " . implode(" AND ", $where_clauses);
    }
    $result = $conn->query($count_query);
    $count_row = $result->fetch_assoc();
    return [
      'data' => [],
      'count' => $count_row['total']
    ];
  }

  $result = $conn->query($query);

  if (!$result) {
    return ['error' => 'Query failed: ' . $conn->error];
  }

  $data = [];
  while ($row = $result->fetch_assoc()) {
    // Auto-decode JSON columns
    foreach ($row as $col => $val) {
      if (is_string($val) && strlen($val) > 0 && ($val[0] === '{' || $val[0] === '[')) {
        $decoded = json_decode($val, true);
        if (json_last_error() === JSON_ERROR_NONE) {
          $row[$col] = $decoded;
        }
      }
    }
    $data[] = $row;
  }

  return ['data' => $data, 'count' => count($data)];
}

function table_insert($conn, $table, $input) {
  if (!$input || !is_array($input)) {
    return ['error' => 'Invalid input'];
  }

  $columns = array_keys($input);
  $values = array_values($input);

  $columns_str = implode(", ", array_map(function($c) { return "`" . str_replace("`", "``", $c) . "`"; }, $columns));
  $placeholders = implode(", ", array_fill(0, count($values), "?"));

  $query = "INSERT INTO $table ($columns_str) VALUES ($placeholders)";

  $stmt = $conn->prepare($query);
  if (!$stmt) {
    return ['error' => 'Prepare failed: ' . $conn->error];
  }

  $types = str_repeat("s", count($values));
  $stmt->bind_param($types, ...$values);

  if ($stmt->execute()) {
    return ['success' => true, 'id' => $conn->insert_id];
  }

  return ['error' => 'Insert failed: ' . $conn->error];
}

function table_update($conn, $table, $input) {
  $set_clauses = [];
  $values = [];
  $has_filter = isset($_GET['eq']) || isset($_GET['neq']) || isset($_GET['in']);

  foreach ($input as $column => $value) {
    if ($column === 'id') continue;
    $set_clauses[] = "`" . str_replace("`", "``", $column) . "` = ?";
    $values[] = $value;
  }

  if (empty($set_clauses)) {
    return ['error' => 'No fields to update'];
  }

  $where_clauses = [];

  // Legacy id-in-body support (if no GET filters)
  if (!$has_filter && isset($input['id'])) {
    $where_clauses[] = "id = '" . $conn->real_escape_string($input['id']) . "'";
  }

  // Filter-based update via GET params
  if (isset($_GET['eq'])) {
    foreach ($_GET['eq'] as $col => $val) {
      $where_clauses[] = $conn->real_escape_string($col) . " = '" . $conn->real_escape_string($val) . "'";
    }
  }
  if (isset($_GET['neq']) && isset($_GET['neq_value'])) {
    $col = $conn->real_escape_string($_GET['neq']);
    $val = $conn->real_escape_string($_GET['neq_value']);
    $where_clauses[] = "$col != '$val'";
  }
  if (isset($_GET['in'])) {
    foreach ($_GET['in'] as $col => $vals) {
      if (is_array($vals) && count($vals) > 0) {
        $esc_col = $conn->real_escape_string($col);
        $plch = implode(', ', array_map(fn($v) => "'" . $conn->real_escape_string($v) . "'", $vals));
        $where_clauses[] = "$esc_col IN ($plch)";
      }
    }
  }

  if (empty($where_clauses)) {
    return ['error' => 'Filter required for update'];
  }

  $query = "UPDATE $table SET " . implode(", ", $set_clauses) . " WHERE " . implode(" AND ", $where_clauses);
  $stmt = $conn->prepare($query);
  if (!$stmt) {
    return ['error' => 'Prepare failed: ' . $conn->error];
  }

  if (!empty($values)) {
    $types = str_repeat("s", count($values));
    $stmt->bind_param($types, ...$values);
  }

  if ($stmt->execute()) {
    return ['success' => true, 'affected' => $stmt->affected_rows];
  }

  return ['error' => 'Update failed: ' . $conn->error];
}

function table_delete($conn, $table, $input) {
  $where_clauses = [];

  if (isset($_GET['id'])) {
    $id = $conn->real_escape_string($_GET['id']);
    $where_clauses[] = "id = '$id'";
  }
  if (isset($_GET['eq'])) {
    foreach ($_GET['eq'] as $col => $val) {
      $where_clauses[] = $conn->real_escape_string($col) . " = '" . $conn->real_escape_string($val) . "'";
    }
  }
  if (isset($_GET['neq']) && isset($_GET['neq_value'])) {
    $col = $conn->real_escape_string($_GET['neq']);
    $val = $conn->real_escape_string($_GET['neq_value']);
    $where_clauses[] = "$col != '$val'";
  }
  if (isset($_GET['in'])) {
    foreach ($_GET['in'] as $col => $vals) {
      if (is_array($vals) && count($vals) > 0) {
        $esc_col = $conn->real_escape_string($col);
        $plch = implode(', ', array_map(fn($v) => "'" . $conn->real_escape_string($v) . "'", $vals));
        $where_clauses[] = "$esc_col IN ($plch)";
      }
    }
  }

  if (empty($where_clauses)) {
    return ['error' => 'Filter required for delete'];
  }

  $stmt = $conn->prepare("DELETE FROM $table WHERE " . implode(" AND ", $where_clauses));
  if (!$stmt) {
    return ['error' => 'Prepare failed: ' . $conn->error];
  }

  if ($stmt->execute()) {
    return ['success' => true, 'affected' => $stmt->affected_rows];
  }

  return ['error' => 'Delete failed: ' . $conn->error];
}

// Route requests
$path = explode('?', $request_uri);
$path = trim($path[0], '/');

if (strpos($path, 'auth') !== false) {
  echo json_encode(route_auth());
} elseif (isset($_GET['table'])) {
  echo json_encode(route_table());
} else {
  echo json_encode(['error' => 'No route found']);
}

$conn->close();
?>
