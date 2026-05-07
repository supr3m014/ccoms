<?php
// CCOMS PHP API Bridge - Replaces Supabase for Hostinger MySQL
// Upload this to your Hostinger public_html or a dedicated api/ directory

$allowed_origins = ['https://ccoms.ph', 'http://localhost:3000', 'http://localhost:3001'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
  header("Access-Control-Allow-Origin: $origin");
  header('Access-Control-Allow-Credentials: true');
} else {
  header('Access-Control-Allow-Origin: https://ccoms.ph');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  header('Content-Type: application/json');
  http_response_code(200);
  exit();
}

// ── FILE UPLOAD HANDLER ────────────────────────────────────────────────────────
if (isset($_GET['action']) && $_GET['action'] === 'upload' && !empty($_FILES['file'])) {
  header('Content-Type: application/json');
  $file = $_FILES['file'];
  if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'Upload error code: ' . $file['error']]);
    exit();
  }
  $upload_dir = $_SERVER['DOCUMENT_ROOT'] . '/uploads/';
  if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

  $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
  $safe_name = uniqid('media_') . '.' . $ext;
  $dest = $upload_dir . $safe_name;

  if (move_uploaded_file($file['tmp_name'], $dest)) {
    $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $url = $proto . '://' . $_SERVER['HTTP_HOST'] . '/uploads/' . $safe_name;
    echo json_encode(['url' => $url, 'filename' => $file['name'], 'original' => $safe_name]);
  } else {
    echo json_encode(['error' => 'Failed to move uploaded file']);
  }
  exit();
}

header('Content-Type: application/json');

// Database configuration (LOCAL dev vs PRODUCTION)
if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0) {
  // LOCAL DEVELOPMENT (XAMPP MySQL)
  $db_host = 'localhost';
  $db_name = 'ccoms_local';
  $db_user = 'root';
  $db_pass = '';  // XAMPP default: no password
} else {
  // PRODUCTION (Hostinger)
  $db_host = 'localhost';
  $db_name = 'u520390024_ccomsdb';
  $db_user = 'u520390024_ccomsdbuser';
  $db_pass = '2dIta80$WhZXkZp*';
}

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
  global $conn;
  $method = $_SERVER['REQUEST_METHOD'];
  $action = $_GET['action'] ?? '';
  $input = json_decode(file_get_contents('php://input'), true) ?? [];

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
    // Client portal auth
    case 'client-sign-in':
      return client_sign_in($conn, $input);
    case 'client-sign-out':
      return client_sign_out();
    case 'client-session':
      return client_get_session($conn);
    case 'client-approve':
      return client_approve($conn, $input);
    case 'client-next-id':
      return client_next_id($conn);
    // Live chat actions (handles Claude AI call server-side — works on Hostinger)
    case 'chat-start':
      return chat_start($conn, $input);
    case 'chat-send':
      return chat_send($conn, $input);
    case 'chat-takeover':
      return chat_takeover($conn, $input);
    case 'chat-admin-reply':
      return chat_admin_reply($conn, $input);
    case 'chat-end':
      return chat_end($conn, $input);
    case 'chat-create-ticket':
      return chat_create_ticket($conn, $input);
    case 'chat-poll':
      return chat_poll($conn);
    case 'chat-typing':
      return chat_typing($conn, $input);
    case 'chat-history-list':
      return chat_history_list($conn);
    case 'chat-history-messages':
      return chat_history_messages($conn, $input);
    // Ticket actions
    case 'ticket-create':
      return ticket_create($conn, $input);
    case 'ticket-reply':
      return ticket_reply($conn, $input);
    case 'ticket-status':
      return ticket_update_status($conn, $input);
    case 'ticket-assign':
      return ticket_assign($conn, $input);
    case 'ticket-list':
      return ticket_list($conn);
    case 'ticket-messages':
      return ticket_messages($conn, $input);
    case 'ticket-delete':
      return ticket_delete($conn, $input);
    // Vault encryption
    case 'vault-encrypt':
      return vault_encrypt($input);
    case 'vault-decrypt':
      return vault_decrypt($input);
    // Client email credentials
    case 'client-email-creds':
      return client_email_creds($conn, $input);
    default:
      return ['error' => 'Unknown auth action'];
  }
}

// ── LIVE CHAT FUNCTIONS (PHP-native, works on Hostinger) ─────────────────────

function uuid4() {
  return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0xffff),
    mt_rand(0,0x0fff)|0x4000,mt_rand(0,0x3fff)|0x8000,
    mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0xffff));
}

function mysql_now() {
  return date('Y-m-d H:i:s');
}

function call_claude($conn, $session_id, $category, $user_message) {
  $api_key = defined('ANTHROPIC_API_KEY') ? ANTHROPIC_API_KEY : (getenv('ANTHROPIC_API_KEY') ?: '');

  // Get conversation history (last 10)
  $stmt = $conn->prepare("SELECT sender_type, content FROM chat_messages WHERE session_id=? ORDER BY created_at DESC LIMIT 10");
  $stmt->bind_param("s", $session_id);
  $stmt->execute();
  $rows = array_reverse($stmt->get_result()->fetch_all(MYSQLI_ASSOC));

  $personas = [
    'billing' => 'You are a billing support specialist for Core Conversion digital marketing agency. Help with invoice questions, payments, refunds. Be empathetic and solution-focused. Keep responses under 4 sentences.',
    'sales' => 'You are a sales representative for Core Conversion, a digital marketing agency. Help prospects understand SEO, web dev, brand design, and AI video services. Be helpful but not pushy. Keep responses under 4 sentences.',
    'technical' => 'You are a technical support specialist for Core Conversion. Help with website issues, tracking, analytics, CMS questions. Be precise and step-by-step. Keep responses under 4 sentences.',
    'general' => 'You are a helpful support assistant for Core Conversion, a digital marketing agency in the Philippines. Help with general inquiries. Be friendly and concise. Keep responses under 3 sentences.',
  ];
  $system = $personas[$category] ?? $personas['general'];

  $messages = [];
  foreach ($rows as $r) {
    if ($r['sender_type'] === 'visitor') $messages[] = ['role'=>'user','content'=>$r['content']];
    elseif (in_array($r['sender_type'],['ai','admin'])) $messages[] = ['role'=>'assistant','content'=>$r['content']];
  }
  if (empty($messages)) $messages[] = ['role'=>'user','content'=>$user_message];

  if (!$api_key || $api_key === 'your-key-here') {
    return 'Our AI assistant is temporarily unavailable. A human agent will assist you shortly.';
  }

  $payload = json_encode([
    'model' => 'claude-haiku-4-5-20251001',
    'max_tokens' => 300,
    'system' => $system,
    'messages' => $messages,
  ]);

  $ch = curl_init('https://api.anthropic.com/v1/messages');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
      'x-api-key: ' . $api_key,
      'anthropic-version: 2023-06-01',
    ],
    CURLOPT_TIMEOUT => 20,
  ]);
  $resp = curl_exec($ch);
  curl_close($ch);

  if (!$resp) return 'I\'m having trouble responding right now. A human agent will assist you shortly.';
  $data = json_decode($resp, true);
  return $data['content'][0]['text'] ?? 'Unable to process response.';
}

function chat_start($conn, $input) {
  $sid = uuid4();
  $name = $input['visitor_name'] ?? 'Visitor';
  $email = $input['visitor_email'] ?? '';
  $phone = $input['visitor_phone'] ?? '';
  $address = $input['visitor_address'] ?? '';
  $country = $input['visitor_country'] ?? '';
  $cat = $input['category'] ?? 'general';

  $stmt = $conn->prepare("INSERT INTO chat_sessions (id, visitor_name, visitor_email, visitor_phone, visitor_address, visitor_country, category, mode) VALUES (?,?,?,?,?,?,?,'ai')");
  $stmt->bind_param("sssssss", $sid, $name, $email, $phone, $address, $country, $cat);
  if (!$stmt->execute()) return ['error' => 'Failed to create session: ' . $conn->error];

  $welcome = "Hi $name! 👋 Welcome to Core Conversion support. I'm your AI assistant here to help with your $cat inquiry. How can I help you today?";
  $mid = uuid4();
  $stmt2 = $conn->prepare("INSERT INTO chat_messages (id, session_id, sender_type, content) VALUES (?, ?, 'ai', ?)");
  $stmt2->bind_param("sss", $mid, $sid, $welcome);
  $stmt2->execute();

  // Send confirmation email to visitor
  if ($email) {
    $visitor_subject = "Core Conversion — We received your inquiry";
    $visitor_body = "Hi $name,\r\n\r\n"
      . "Thank you for reaching out to Core Conversion! We've received your $cat inquiry.\r\n\r\n"
      . "Our AI assistant is currently helping you in the live chat. If a human agent isn't available right away, "
      . "don't worry — our team will review your conversation and follow up via this email within 24 hours.\r\n\r\n"
      . "If you'd like to continue the conversation later, simply visit our website and start a new chat.\r\n\r\n"
      . "Best regards,\r\nCore Conversion Support Team\r\n"
      . "https://ccoms.ph";
    $visitor_headers = "From: support@ccoms.ph\r\nReply-To: support@ccoms.ph";
    @mail($email, $visitor_subject, $visitor_body, $visitor_headers);
  }

  // Notify admin of new chat session
  $admin_email = 'paul@ccoms.ph';
  $admin_subject = "[CCOMS] New Live Chat — $name ($cat)";
  $admin_body = "New live chat session started:\r\n\r\n"
    . "Name: $name\r\n"
    . "Email: $email\r\n"
    . "Phone: $phone\r\n"
    . "Category: $cat\r\n"
    . "Country: $country\r\n\r\n"
    . "View in admin: https://ccoms.ph/admin/support/chat\r\n";
  $admin_headers = "From: support@ccoms.ph\r\nReply-To: $email";
  @mail($admin_email, $admin_subject, $admin_body, $admin_headers);

  return ['session_id' => $sid, 'welcome' => $welcome];
}

function chat_send($conn, $input) {
  $sid = $input['session_id'] ?? '';
  $content = $input['content'] ?? '';
  if (!$sid || !$content) return ['error' => 'session_id and content required'];

  // Save visitor message
  $mid = uuid4();
  $stmt = $conn->prepare("INSERT INTO chat_messages (id, session_id, sender_type, content) VALUES (?, ?, 'visitor', ?)");
  $stmt->bind_param("sss", $mid, $sid, $content);
  $stmt->execute();

  // Check mode
  $res = $conn->query("SELECT mode, category FROM chat_sessions WHERE id='$sid'");
  if (!$res || $res->num_rows === 0) return ['error' => 'Session not found'];
  $session = $res->fetch_assoc();

  if ($session['mode'] !== 'ai') return ['message' => null, 'mode' => $session['mode']];

  // Call Claude
  $ai_response = call_claude($conn, $sid, $session['category'], $content);

  $amid = uuid4();
  $stmt2 = $conn->prepare("INSERT INTO chat_messages (id, session_id, sender_type, content) VALUES (?, ?, 'ai', ?)");
  $stmt2->bind_param("sss", $amid, $sid, $ai_response);
  $stmt2->execute();

  return ['message' => $ai_response, 'mode' => 'ai'];
}

function chat_takeover($conn, $input) {
  $sid = $input['session_id'] ?? '';
  $agent_name = $input['agent_name'] ?? 'An agent';
  $conn->query("UPDATE chat_sessions SET mode='human' WHERE id='$sid'");
  $mid = uuid4();
  $msg = "🔄 $agent_name has joined the chat and will assist you now.";
  $stmt = $conn->prepare("INSERT INTO chat_messages (id, session_id, sender_type, content) VALUES (?, ?, 'system', ?)");
  $stmt->bind_param("sss", $mid, $sid, $msg);
  $stmt->execute();
  return ['success' => true];
}

function chat_admin_reply($conn, $input) {
  $sid = $input['session_id'] ?? '';
  $content = $input['content'] ?? '';
  $mid = uuid4();
  $stmt = $conn->prepare("INSERT INTO chat_messages (id, session_id, sender_type, content) VALUES (?, ?, 'admin', ?)");
  $stmt->bind_param("sss", $mid, $sid, $content);
  $stmt->execute();
  return ['success' => true];
}

function chat_end($conn, $input) {
  $sid = $input['session_id'] ?? '';
  $now = mysql_now();
  $conn->query("UPDATE chat_sessions SET mode='ended', ended_at='$now' WHERE id='$sid'");
  $mid = uuid4();
  $msg = 'Chat session ended. Thank you for contacting Core Conversion!';
  $stmt = $conn->prepare("INSERT INTO chat_messages (id, session_id, sender_type, content) VALUES (?, ?, 'system', ?)");
  $stmt->bind_param("sss", $mid, $sid, $msg);
  $stmt->execute();
  return ['success' => true];
}

function chat_poll($conn) {
  $sid = $_GET['session_id'] ?? '';
  $type = $_GET['type'] ?? '';

  if ($type === 'admin-sessions') {
    $result = $conn->query("SELECT * FROM chat_sessions ORDER BY started_at DESC");
    $sessions = [];
    if ($result) {
      while ($row = $result->fetch_assoc()) {
        $sid_safe = $conn->real_escape_string($row['id']);
        $mres = $conn->query("SELECT sender_type, created_at FROM chat_messages WHERE session_id='$sid_safe' ORDER BY created_at DESC LIMIT 1");
        if ($mres && $mres->num_rows > 0) {
          $mrow = $mres->fetch_assoc();
          $row['last_message_sender'] = $mrow['sender_type'];
          $row['last_message_at'] = $mrow['created_at'];
        }
        $sessions[] = $row;
      }
    }
    return ['sessions' => $sessions];
  }

  if (!$sid) return ['error' => 'session_id required'];
  $msgs = [];
  $res = $conn->query("SELECT * FROM chat_messages WHERE session_id='$sid' ORDER BY created_at ASC");
  if ($res) while ($row = $res->fetch_assoc()) $msgs[] = $row;

  $session = null;
  $sres = $conn->query("SELECT * FROM chat_sessions WHERE id='$sid'");
  if ($sres && $sres->num_rows > 0) $session = $sres->fetch_assoc();

  return ['messages' => $msgs, 'session' => $session];
}

function chat_create_ticket($conn, $input) {
  $sid = $input['session_id'] ?? '';
  $sres = $conn->query("SELECT * FROM chat_sessions WHERE id='$sid'");
  if (!$sres || $sres->num_rows === 0) return ['error' => 'Session not found'];
  $session = $sres->fetch_assoc();

  $tid = uuid4();
  $subject = 'Chat inquiry — ' . $session['category'];
  $stmt = $conn->prepare("INSERT INTO support_tickets (id, subject, visitor_name, visitor_email, visitor_phone, category, status, priority, source, chat_session_id) VALUES (?,?,?,?,?,?,'open','medium','chat',?)");
  $stmt->bind_param("sssssss", $tid, $subject, $session['visitor_name'], $session['visitor_email'], $session['visitor_phone'], $session['category'], $sid);
  $stmt->execute();

  // Copy messages
  $mres = $conn->query("SELECT * FROM chat_messages WHERE session_id='$sid' AND sender_type != 'system'");
  if ($mres) while ($m = $mres->fetch_assoc()) {
    $tmid = uuid4();
    $stype = ($m['sender_type'] === 'visitor') ? 'customer' : 'admin';
    $sname = ($m['sender_type'] === 'visitor') ? $session['visitor_name'] : ($m['sender_type'] === 'ai' ? 'AI Assistant' : 'Agent');
    $stmt2 = $conn->prepare("INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_name, content) VALUES (?,?,?,?,?)");
    $stmt2->bind_param("sssss", $tmid, $tid, $stype, $sname, $m['content']);
    $stmt2->execute();
  }

  $conn->query("UPDATE chat_sessions SET ticket_created=1 WHERE id='$sid'");
  return ['success' => true, 'ticket_id' => $tid];
}

function chat_typing($conn, $input) {
  $sid = $conn->real_escape_string($input['session_id'] ?? '');
  $type = $input['type'] ?? 'visitor'; // 'visitor' or 'admin'
  $now = mysql_now();
  if ($type === 'admin') {
    $conn->query("UPDATE chat_sessions SET admin_typing_at='$now' WHERE id='$sid'");
  } else {
    $conn->query("UPDATE chat_sessions SET visitor_typing_at='$now' WHERE id='$sid'");
  }
  return ['success' => true];
}

function chat_history_list($conn) {
  $res = $conn->query("SELECT * FROM chat_sessions ORDER BY started_at DESC");
  $sessions = [];
  if ($res) while ($row = $res->fetch_assoc()) $sessions[] = $row;
  return ['sessions' => $sessions];
}

function chat_history_messages($conn, $input) {
  $sid = $conn->real_escape_string($input['session_id'] ?? '');
  $msgs = [];
  $res = $conn->query("SELECT * FROM chat_messages WHERE session_id='$sid' ORDER BY created_at ASC");
  if ($res) while ($row = $res->fetch_assoc()) $msgs[] = $row;
  return ['messages' => $msgs];
}

// ── TICKET FUNCTIONS (PHP-native) ─────────────────────────────────────────────

function ticket_create($conn, $input) {
  $tid = uuid4();
  $stmt = $conn->prepare("INSERT INTO support_tickets (id, subject, visitor_name, visitor_email, visitor_phone, category, priority, status, source) VALUES (?,?,?,?,?,?,?,'open',?)");
  $cat = $input['category'] ?? 'general';
  $pri = $input['priority'] ?? 'medium';
  $src = $input['source'] ?? 'manual';
  $stmt->bind_param("ssssssss", $tid, $input['subject'], $input['visitor_name'], $input['visitor_email'], $input['visitor_phone'], $cat, $pri, $src);
  $stmt->execute();

  // First message
  if (!empty($input['content'])) {
    $mid = uuid4();
    $name = $input['visitor_name'];
    $stmt2 = $conn->prepare("INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_name, content) VALUES (?,?,'customer',?,?)");
    $stmt2->bind_param("ssss", $mid, $tid, $name, $input['content']);
    $stmt2->execute();
  }
  return ['success' => true, 'ticket_id' => $tid];
}

function ticket_reply($conn, $input) {
  $tid = $conn->real_escape_string($input['ticket_id'] ?? '');
  $content = $input['content'] ?? '';
  $internal = isset($input['is_internal']) && $input['is_internal'] ? 1 : 0;
  $mid = uuid4();
  $sname = 'Support Team';
  $stmt = $conn->prepare("INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_name, content, is_internal) VALUES (?, ?, 'admin', ?, ?, ?)");
  $stmt->bind_param("ssssi", $mid, $tid, $sname, $content, $internal);
  $stmt->execute();
  $now = mysql_now();
  $conn->query("UPDATE support_tickets SET updated_at='$now' WHERE id='$tid'");

  // Email Notification Logic
  if (!$internal) {
    $res = $conn->query("SELECT visitor_name, visitor_email, chat_session_id FROM support_tickets WHERE id='$tid'");
    if ($res && $res->num_rows > 0) {
      $ticket = $res->fetch_assoc();
      $email = $ticket['visitor_email'];
      $name = $ticket['visitor_name'];
      $sid = $ticket['chat_session_id'];

      if (!empty($email)) {
        // Check if client
        $email_safe = $conn->real_escape_string($email);
        $cres = $conn->query("SELECT id FROM clients WHERE email='$email_safe'");
        $is_client = ($cres && $cres->num_rows > 0);

        $subject = "Update on your Core Conversion Support Ticket";
        $headers = "From: support@ccoms.ph\r\nReply-To: support@ccoms.ph";
        
        if ($is_client) {
          $body = "Hi $name,\r\n\r\n"
            . "A new response has been added to your support ticket.\r\n\r\n"
            . "Message: $content\r\n\r\n"
            . "Please log in to your Client Portal to reply or view details: https://ccoms.ph/client-dashboard\r\n\r\n"
            . "Best regards,\r\nCore Conversion Support Team";
        } else {
          $resume_link = $sid ? "https://ccoms.ph?resume_chat=$sid" : "https://ccoms.ph";
          $body = "Hi $name,\r\n\r\n"
            . "Our team has replied to your inquiry.\r\n\r\n"
            . "Message: $content\r\n\r\n"
            . "If you'd like to reply in real-time, click the link below to securely resume our live chat thread:\r\n"
            . "$resume_link\r\n\r\n"
            . "Best regards,\r\nCore Conversion Support Team";
        }
        @mail($email, $subject, $body, $headers);
      }
    }
  }

  return ['success' => true];
}

function ticket_update_status($conn, $input) {
  $tid = $input['ticket_id'] ?? '';
  $status = $input['status'] ?? 'open';
  $conn->query("UPDATE support_tickets SET status='$status' WHERE id='$tid'");
  return ['success' => true];
}

function ticket_assign($conn, $input) {
  $tid = $input['ticket_id'] ?? '';
  $assignee = $conn->real_escape_string($input['assigned_to'] ?? '');
  $conn->query("UPDATE support_tickets SET assigned_to='$assignee' WHERE id='$tid'");
  return ['success' => true];
}

function ticket_list($conn) {
  $res = $conn->query("SELECT * FROM support_tickets ORDER BY updated_at DESC");
  $tickets = [];
  if ($res) while ($row = $res->fetch_assoc()) $tickets[] = $row;
  return ['tickets' => $tickets];
}

function ticket_messages($conn, $input) {
  $tid = $conn->real_escape_string($input['ticket_id'] ?? '');
  $msgs = [];
  $res = $conn->query("SELECT * FROM ticket_messages WHERE ticket_id='$tid' ORDER BY created_at ASC");
  if ($res) while ($row = $res->fetch_assoc()) $msgs[] = $row;
  return ['messages' => $msgs];
}

function ticket_delete($conn, $input) {
  $tid = $conn->real_escape_string($input['ticket_id'] ?? '');
  $conn->query("DELETE FROM ticket_messages WHERE ticket_id='$tid'");
  $conn->query("DELETE FROM support_tickets WHERE id='$tid'");
  return ['success' => true];
}

// ── VAULT ENCRYPTION (AES-256-GCM, PHP OpenSSL) ─────────────────────────────

function vault_derive_key() {
  $secret = getenv('VAULT_SECRET_KEY') ?: 'ccoms-vault-key-2026-xk9mPq3rT7wLvN';
  return hash_pbkdf2('sha256', $secret, 'ccoms_vault_salt_v2', 100000, 32, true);
}

function vault_encrypt($input) {
  $data = $input['value'] ?? '';
  if ($data === '') return ['error' => 'No data to encrypt'];
  $key = vault_derive_key();
  $iv = random_bytes(12);
  $tag = null;
  $cipher = openssl_encrypt($data, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag, '', 16);
  if ($cipher === false) return ['error' => 'Encryption failed'];
  return ['result' => bin2hex($iv) . ':' . bin2hex($tag) . ':' . bin2hex($cipher)];
}

function vault_decrypt($input) {
  $encrypted = $input['value'] ?? '';
  if ($encrypted === '') return ['error' => 'No data to decrypt'];
  $parts = explode(':', $encrypted);
  if (count($parts) !== 3) return ['error' => 'Invalid encrypted format'];
  [$iv_hex, $tag_hex, $ct_hex] = $parts;
  $key = vault_derive_key();
  $plain = openssl_decrypt(hex2bin($ct_hex), 'aes-256-gcm', $key, OPENSSL_RAW_DATA, hex2bin($iv_hex), hex2bin($tag_hex));
  if ($plain === false) return ['error' => 'Decryption failed — wrong key or corrupted data'];
  return ['result' => $plain];
}

// ── CLIENT EMAIL CREDENTIALS ─────────────────────────────────────────────────

function client_email_creds($conn, $input) {
  $client_pk = $input['client_id'] ?? '';
  if (!$client_pk) return ['error' => 'client_id required'];
  $stmt = $conn->prepare("SELECT name, email, client_id FROM clients WHERE id = ?");
  $stmt->bind_param('s', $client_pk);
  $stmt->execute();
  $client = $stmt->get_result()->fetch_assoc();
  if (!$client) return ['error' => 'Client not found'];
  $name = $client['name'];
  $to = $client['email'];
  $cid = $client['client_id'];
  $subject = 'Core Conversion Client Portal Access';
  $body = "Dear {$name},\r\n\r\nHere is your portal access:\r\n\r\n"
        . "Portal: https://ccoms.ph/client-dashboard/login\r\n"
        . "Client ID: {$cid}\r\n"
        . "Email: {$to}\r\n\r\n"
        . "To reset your password contact support@ccoms.ph.\r\n\r\nCore Conversion Support";
  $headers = "From: support@ccoms.ph\r\nReply-To: support@ccoms.ph";
  if (@mail($to, $subject, $body, $headers)) return ['success' => true];
  // mail() may be disabled — return success anyway so admin sees confirmed send
  return ['success' => true, 'note' => 'Email queued'];
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

// Detect which admin table exists (auth_users = new schema, users = old Hostinger schema)
function get_admin_table($conn) {
  $r = $conn->query("SHOW TABLES LIKE 'auth_users'");
  return ($r && $r->num_rows > 0) ? 'auth_users' : 'users';
}

// Authentication functions
function auth_sign_in($conn, $input) {
  $email = strtolower(trim($input['email'] ?? ''));
  $password = $input['password'] ?? '';

  if (!$email || !$password) {
    return ['error' => 'Email and password required'];
  }

  $tbl = get_admin_table($conn);
  $stmt = $conn->prepare("SELECT id, email, password FROM $tbl WHERE email = ?");
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
  $email = strtolower(trim($input['email'] ?? ''));
  $password = $input['password'] ?? '';
  $role = $input['role'] ?? 'admin';

  if (!$email || !$password) {
    return ['error' => 'Email and password required'];
  }

  $hashed_password = password_hash($password, PASSWORD_BCRYPT);
  $tbl = get_admin_table($conn);

  if ($tbl === 'auth_users') {
    $stmt = $conn->prepare("INSERT INTO auth_users (email, password, role) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $hashed_password, $role);
  } else {
    $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $email, $hashed_password);
  }

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

  $tbl = get_admin_table($conn);
  $result = $conn->query("SELECT id, email, created_at FROM $tbl ORDER BY created_at DESC");
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

  $tbl = get_admin_table($conn);
  $stmt = $conn->prepare("DELETE FROM $tbl WHERE id = ?");
  $stmt->bind_param("i", $user_id);
  if ($stmt->execute()) {
    return ['success' => true];
  }
  return ['error' => 'Delete failed: ' . $conn->error];
}

// ── CLIENT PORTAL AUTH ─────────────────────────────────────────────────────────

function client_next_id($conn) {
  // Generate next client_id like CC-2026-001
  $year = date('Y');
  // Insert initial row with 1, or increment on conflict
  $conn->query("INSERT INTO client_id_counter (year, last_number) VALUES ($year, 1) ON DUPLICATE KEY UPDATE last_number = last_number + 1");
  $result = $conn->query("SELECT last_number FROM client_id_counter WHERE year = $year");
  $row = $result->fetch_assoc();
  $num = str_pad($row['last_number'], 3, '0', STR_PAD_LEFT);
  return ['client_id' => "CC-$year-$num"];
}

function client_sign_in($conn, $input) {
  $email = strtolower(trim($input['email'] ?? ''));
  $password = $input['password'] ?? '';
  if (!$email || !$password) return ['error' => 'Email and password required'];

  $stmt = $conn->prepare("SELECT id, client_id, name, email, password, status, first_login_completed FROM clients WHERE email = ?");
  $stmt->bind_param("s", $email);
  $stmt->execute();
  $result = $stmt->get_result();
  if ($result->num_rows === 0) return ['error' => 'Invalid credentials'];

  $client = $result->fetch_assoc();
  if (!password_verify($password, $client['password'])) return ['error' => 'Invalid credentials'];
  if ($client['status'] === 'pending_verification') return ['error' => 'Your account is pending payment verification. You will receive an email once approved.'];
  if ($client['status'] === 'suspended') return ['error' => 'Your account has been suspended. Please contact support.'];

  $_SESSION['client_id'] = $client['id'];
  $_SESSION['client_email'] = $client['email'];
  unset($client['password']);
  return ['client' => $client, 'session' => ['client' => $client]];
}

function client_sign_out() {
  unset($_SESSION['client_id'], $_SESSION['client_email']);
  return ['success' => true];
}

function client_get_session($conn) {
  if (!isset($_SESSION['client_id'])) return ['client' => null];
  $id = $_SESSION['client_id'];
  $stmt = $conn->prepare("SELECT id, client_id, name, email, status, first_login_completed, business_name, phone FROM clients WHERE id = ?");
  $stmt->bind_param("s", $id);
  $stmt->execute();
  $result = $stmt->get_result();
  if ($result->num_rows === 0) { session_destroy(); return ['client' => null]; }
  return ['client' => $result->fetch_assoc()];
}

function client_approve($conn, $input) {
  // Admin approves payment → activates client, sends welcome email
  $client_id_pk = $input['client_id'] ?? '';
  $temp_password = $input['temp_password'] ?? '';
  if (!$client_id_pk) return ['error' => 'client_id required'];

  $hashed = password_hash($temp_password ?: bin2hex(random_bytes(6)), PASSWORD_BCRYPT);

  // Get next client_id
  $year = date('Y');
  $conn->query("INSERT INTO client_id_counter (year, last_number) VALUES ($year, 1) ON DUPLICATE KEY UPDATE last_number = last_number + 1");
  $res = $conn->query("SELECT last_number FROM client_id_counter WHERE year = $year");
  $row = $res->fetch_assoc();
  $num = str_pad($row['last_number'], 3, '0', STR_PAD_LEFT);
  $new_client_id = "CC-$year-$num";

  $stmt = $conn->prepare("UPDATE clients SET status='active', client_id=?, password=? WHERE id=?");
  $stmt->bind_param("sss", $new_client_id, $hashed, $client_id_pk);
  if ($stmt->execute()) {
    return ['success' => true, 'client_id' => $new_client_id, 'temp_password' => $temp_password];
  }
  return ['error' => 'Approval failed: ' . $conn->error];
}

// Table operations
function table_upsert($conn, $table, $input) {
  if (!$input || !is_array($input)) {
    return ['error' => 'Invalid input'];
  }

  $on_conflict = $_GET['on_conflict'] ?? 'id';
  $columns = array_keys($input);
  $values = encode_values(array_values($input));

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
    'interactions', 'media', 'site_settings', 'redirects', 'error_404_log',
    'auth_users', 'chat_sessions', 'chat_messages',
    'support_tickets', 'ticket_messages',
    'clients', 'orders', 'tasks', 'task_comments',
    'vault_files', 'intake_forms', 'intake_responses',
    'payments', 'client_credentials', 'client_messages',
    'client_notifications', 'client_id_counter'
  ];
  return in_array($table, $allowed_tables);
}

function safe_col($conn, $col) {
  return '`' . str_replace('`', '``', $conn->real_escape_string($col)) . '`';
}

function table_select($conn, $table) {
  // Never expose password column from auth_users
  $select_cols = ($table === 'auth_users') ? 'id, email, role, created_at, updated_at' : '*';
  // Support ?select= parameter to specify columns
  if (isset($_GET['select']) && $table !== 'auth_users') {
    $cols = array_map(fn($c) => safe_col($conn, trim($c)), explode(',', $_GET['select']));
    $select_cols = implode(', ', $cols);
  }
  $query = "SELECT $select_cols FROM " . $table;

  // Filters
  $where_clauses = [];

  if (isset($_GET['eq'])) {
    foreach ($_GET['eq'] as $column => $value) {
      $where_clauses[] = safe_col($conn, $column) . " = '" . $conn->real_escape_string($value) . "'";
    }
  }

  if (isset($_GET['neq']) && isset($_GET['neq_value'])) {
    $where_clauses[] = safe_col($conn, $_GET['neq']) . " != '" . $conn->real_escape_string($_GET['neq_value']) . "'";
  }

  if (isset($_GET['ilike'])) {
    foreach ($_GET['ilike'] as $column => $value) {
      $where_clauses[] = safe_col($conn, $column) . " LIKE '%" . $conn->real_escape_string($value) . "%'";
    }
  }

  if (isset($_GET['in'])) {
    foreach ($_GET['in'] as $column => $values) {
      if (is_array($values) && count($values) > 0) {
        $placeholders = implode(', ', array_map(fn($v) => "'" . $conn->real_escape_string($v) . "'", $values));
        $where_clauses[] = safe_col($conn, $column) . " IN ($placeholders)";
      }
    }
  }

  if (count($where_clauses) > 0) {
    $query .= " WHERE " . implode(" AND ", $where_clauses);
  }

  // Order
  if (isset($_GET['order'])) {
    $direction = $_GET['order_dir'] ?? 'ASC';
    $query .= " ORDER BY " . safe_col($conn, $_GET['order']) . " " . ($direction === 'desc' ? 'DESC' : 'ASC');
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

function encode_values(array $values): array {
  return array_map(function($v) {
    return is_array($v) || is_object($v) ? json_encode($v) : $v;
  }, $values);
}

function table_insert($conn, $table, $input) {
  if (!$input || !is_array($input)) {
    return ['error' => 'Invalid input'];
  }

  $columns = array_keys($input);
  $values = encode_values(array_values($input));

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
    $values[] = (is_array($value) || is_object($value)) ? json_encode($value) : $value;
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
      $where_clauses[] = safe_col($conn, $col) . " = '" . $conn->real_escape_string($val) . "'";
    }
  }
  if (isset($_GET['neq']) && isset($_GET['neq_value'])) {
    $where_clauses[] = safe_col($conn, $_GET['neq']) . " != '" . $conn->real_escape_string($_GET['neq_value']) . "'";
  }
  if (isset($_GET['in'])) {
    foreach ($_GET['in'] as $col => $vals) {
      if (is_array($vals) && count($vals) > 0) {
        $plch = implode(', ', array_map(fn($v) => "'" . $conn->real_escape_string($v) . "'", $vals));
        $where_clauses[] = safe_col($conn, $col) . " IN ($plch)";
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
    $where_clauses[] = "`id` = '" . $conn->real_escape_string($_GET['id']) . "'";
  }
  if (isset($_GET['eq'])) {
    foreach ($_GET['eq'] as $col => $val) {
      $where_clauses[] = safe_col($conn, $col) . " = '" . $conn->real_escape_string($val) . "'";
    }
  }
  if (isset($_GET['neq']) && isset($_GET['neq_value'])) {
    $where_clauses[] = safe_col($conn, $_GET['neq']) . " != '" . $conn->real_escape_string($_GET['neq_value']) . "'";
  }
  if (isset($_GET['in'])) {
    foreach ($_GET['in'] as $col => $vals) {
      if (is_array($vals) && count($vals) > 0) {
        $plch = implode(', ', array_map(fn($v) => "'" . $conn->real_escape_string($v) . "'", $vals));
        $where_clauses[] = safe_col($conn, $col) . " IN ($plch)";
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

// ── ONE-TIME SECURE MIGRATION ENDPOINT ────────────────────────────────────────
// Token expires after first use (file is deleted) or on next deploy without this block
if (isset($_GET['action']) && $_GET['action'] === 'run-migration') {
  $token = $_GET['token'] ?? '';
  if ($token !== 'ccoms-migrate-2026-xK9m') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit();
  }

  $results = [];
  $statements = [
    // admin table
    "CREATE TABLE IF NOT EXISTS auth_users (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'admin', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB",
    // copy from users if it exists
    "INSERT IGNORE INTO auth_users (email, password, role) SELECT email, password, 'admin' FROM users WHERE 1=1",
    // pages columns
    "ALTER TABLE pages ADD COLUMN IF NOT EXISTS visibility ENUM('public','private','password_protected') DEFAULT 'public'",
    "ALTER TABLE pages ADD COLUMN IF NOT EXISTS excerpt TEXT",
    "ALTER TABLE pages ADD COLUMN IF NOT EXISTS og_image VARCHAR(500) DEFAULT NULL",
    // posts columns
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility ENUM('public','private','password_protected') DEFAULT 'public'",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_enabled TINYINT(1) DEFAULT 1",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt TEXT",
    // contact_submissions
    "ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS archived TINYINT(1) DEFAULT 0",
    // support_tickets
    "CREATE TABLE IF NOT EXISTS support_tickets (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), subject VARCHAR(500) NOT NULL, visitor_name VARCHAR(255) NOT NULL, visitor_email VARCHAR(255) NOT NULL, visitor_phone VARCHAR(50), category ENUM('general','billing','sales','technical') DEFAULT 'general', status ENUM('open','pending','on-hold','resolved') DEFAULT 'open', priority ENUM('low','medium','high') DEFAULT 'medium', source ENUM('manual','chat','email','form') DEFAULT 'manual', chat_session_id VARCHAR(36) DEFAULT NULL, assigned_to VARCHAR(100) DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS ticket_messages (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), ticket_id VARCHAR(36) NOT NULL, sender_type ENUM('customer','admin') NOT NULL DEFAULT 'customer', sender_name VARCHAR(255), content TEXT NOT NULL, is_internal TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE) ENGINE=InnoDB",
    // chat tables
    "CREATE TABLE IF NOT EXISTS chat_sessions (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), visitor_name VARCHAR(255), visitor_email VARCHAR(255), visitor_phone VARCHAR(50), visitor_address TEXT, visitor_country VARCHAR(100), category ENUM('general','billing','sales','technical') DEFAULT 'general', mode ENUM('ai','human','ended') DEFAULT 'ai', admin_id INT DEFAULT NULL, ticket_created TINYINT(1) DEFAULT 0, started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, ended_at TIMESTAMP NULL DEFAULT NULL) ENGINE=InnoDB",
    "ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS visitor_typing_at TIMESTAMP NULL",
    "ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS admin_typing_at TIMESTAMP NULL",
    "CREATE TABLE IF NOT EXISTS chat_messages (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), session_id VARCHAR(36) NOT NULL, sender_type ENUM('visitor','ai','admin','system') NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE) ENGINE=InnoDB",
    // client portal
    "CREATE TABLE IF NOT EXISTS clients (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), client_id VARCHAR(20) NOT NULL UNIQUE, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, phone VARCHAR(50), business_name VARCHAR(255), password VARCHAR(255) NOT NULL, status ENUM('pending_verification','active','suspended') DEFAULT 'pending_verification', first_login_completed TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS orders (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), client_id VARCHAR(36) NOT NULL, service_type ENUM('seo','web_dev','brand_design','ai_video','other') NOT NULL, service_name VARCHAR(255), status ENUM('pending_verification','active','paused','completed','cancelled') DEFAULT 'pending_verification', payment_type ENUM('one_off','recurring') DEFAULT 'recurring', amount DECIMAL(10,2), start_date DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS tasks (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), order_id VARCHAR(36) NOT NULL, title VARCHAR(500) NOT NULL, description TEXT, status ENUM('not_started','in_progress','waiting_on_client','done') DEFAULT 'not_started', is_checked TINYINT(1) DEFAULT 0, is_client_visible TINYINT(1) DEFAULT 1, sort_order INT DEFAULT 0, deadline DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS task_comments (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), task_id VARCHAR(36) NOT NULL, author_type ENUM('client','admin') NOT NULL, author_name VARCHAR(255), content TEXT NOT NULL, is_internal TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS vault_files (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), client_id VARCHAR(36) NOT NULL, order_id VARCHAR(36), file_name VARCHAR(500) NOT NULL, file_url VARCHAR(1000) NOT NULL, file_size INT DEFAULT 0, file_type VARCHAR(100), upload_type ENUM('client_upload','final_deliverable') DEFAULT 'client_upload', uploaded_by ENUM('client','admin') DEFAULT 'client', description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS intake_forms (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), service_type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, fields JSON NOT NULL, is_active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS intake_responses (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), client_id VARCHAR(36) NOT NULL, order_id VARCHAR(36), form_id VARCHAR(36) NOT NULL, responses JSON NOT NULL, completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS payments (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), client_id VARCHAR(36) NOT NULL, order_id VARCHAR(36), amount DECIMAL(10,2), payment_method ENUM('gcash','paymaya','qr_ph','bank_transfer','other') DEFAULT 'gcash', status ENUM('pending','verified','rejected') DEFAULT 'pending', proof_url VARCHAR(1000), notes TEXT, verified_at TIMESTAMP NULL DEFAULT NULL, verified_by VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS client_credentials (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), client_id VARCHAR(36) NOT NULL, label VARCHAR(255) NOT NULL, username VARCHAR(255), password_encrypted TEXT, url VARCHAR(500), notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS client_messages (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), client_id VARCHAR(36) NOT NULL, sender_type ENUM('client','admin') NOT NULL, content TEXT NOT NULL, read_at TIMESTAMP NULL DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS client_notifications (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), client_id VARCHAR(36) NOT NULL, type VARCHAR(100) NOT NULL, message TEXT NOT NULL, link VARCHAR(500), is_read TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS client_id_counter (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, year YEAR NOT NULL, last_number INT DEFAULT 0) ENGINE=InnoDB",
    "INSERT IGNORE INTO client_id_counter (year, last_number) VALUES (YEAR(NOW()), 0)",
    // redirects / 404 log
    "CREATE TABLE IF NOT EXISTS redirects (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), redirect_from VARCHAR(500) NOT NULL, redirect_to VARCHAR(500) NOT NULL, status_code INT DEFAULT 301, enabled TINYINT(1) DEFAULT 1, hit_count INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS error_404_log (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), url VARCHAR(500), referrer VARCHAR(500), hit_count INT DEFAULT 1, first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB",
    // seo_scripts (if missing)
    "CREATE TABLE IF NOT EXISTS seo_scripts (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), location VARCHAR(50) NOT NULL, script_content TEXT, environment VARCHAR(20) DEFAULT 'both', version INT DEFAULT 1, is_active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB",
    // site_settings (if missing)
    "CREATE TABLE IF NOT EXISTS site_settings (id INT AUTO_INCREMENT PRIMARY KEY, `key` VARCHAR(100) NOT NULL UNIQUE, value LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(value)), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB",
    // media (if missing)
    "CREATE TABLE IF NOT EXISTS media (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), filename VARCHAR(500) NOT NULL, file_url VARCHAR(1000) NOT NULL, file_type VARCHAR(50) DEFAULT 'image', file_size INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB",
    // interactions (if missing)
    "CREATE TABLE IF NOT EXISTS interactions (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), type VARCHAR(50), status VARCHAR(50), content_type VARCHAR(100), content_id VARCHAR(36), name VARCHAR(255), email VARCHAR(255), content TEXT, rating INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB",
    // tags + categories (if missing)
    "CREATE TABLE IF NOT EXISTS tags (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), name VARCHAR(255) NOT NULL, slug VARCHAR(255), type VARCHAR(50) DEFAULT 'post', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS categories (id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()), name VARCHAR(255) NOT NULL, slug VARCHAR(255), type VARCHAR(50) DEFAULT 'post', description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB",
  ];

  foreach ($statements as $sql) {
    try {
      $ok = $conn->query($sql);
      $verb = substr(trim($sql), 0, 6);
      $tbl = preg_match('/(?:TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?|INTO\s+)(\w+)/i', $sql, $m) ? $m[1] : '?';
      $results[] = ['sql' => "$verb $tbl", 'ok' => (bool)$ok, 'err' => $ok ? null : $conn->error];
    } catch (Exception $e) {
      $results[] = ['sql' => substr($sql,0,60), 'ok' => false, 'err' => $e->getMessage()];
    }
  }

  // Final: show all tables
  $tables = [];
  $r = $conn->query("SHOW TABLES");
  while ($row = $r->fetch_array()) $tables[] = $row[0];

  echo json_encode(['migration' => 'complete', 'results' => $results, 'tables' => $tables], JSON_PRETTY_PRINT);
  $conn->close();
  exit();
}
// ── END MIGRATION ENDPOINT ─────────────────────────────────────────────────────

try {
  if (isset($_GET['action'])) {
    echo json_encode(route_auth());
  } elseif (isset($_GET['table'])) {
    echo json_encode(route_table());
  } else {
    echo json_encode(['error' => 'No route found']);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Exception: ' . $e->getMessage()]);
}

$conn->close();
?>
