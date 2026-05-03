<?php
// Serves static HTML with SEO scripts injected into <head> (visible in page source)
// Receives the original URI via ?uri= query param from .htaccess

if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0) {
  $db_host = 'localhost'; $db_name = 'ccoms_local'; $db_user = 'root'; $db_pass = '';
} else {
  $db_host = 'localhost'; $db_name = 'u520390024_ccomsdb';
  $db_user = 'u520390024_ccomsdbuser'; $db_pass = '2dIta80$WhZXkZp*';
}

$root = $_SERVER['DOCUMENT_ROOT'];

// Get the original page URI from the query param set by .htaccess
$uri = '/' . ltrim($_GET['uri'] ?? '/', '/');
$uri = rtrim($uri, '/') ?: '/';

// Find the HTML file
if ($uri === '/') {
  $html_file = $root . '/index.html';
} else {
  $candidates = [
    $root . $uri . '.html',
    $root . $uri . '/index.html',
  ];
  $html_file = null;
  foreach ($candidates as $c) {
    if (file_exists($c)) { $html_file = $c; break; }
  }
}

// If file not found, serve 404
$is_404 = false;
if (!$html_file || !file_exists($html_file)) {
  $fallback = $root . '/404.html';
  if (file_exists($fallback)) {
    http_response_code(404);
    header('Content-Type: text/html; charset=UTF-8');
    echo file_get_contents($fallback);
  } else {
    http_response_code(404);
    echo '<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>';
  }
  exit();
}

$html = file_get_contents($html_file);
if ($html === false) {
  // Can't read the file — just serve 404
  http_response_code(500);
  echo '<!DOCTYPE html><html><body><h1>Page could not be read</h1></body></html>';
  exit();
}

// DB — all operations are optional; failures just skip injection
$conn = @(new mysqli($db_host, $db_user, $db_pass, $db_name));
if (!$conn->connect_error) {
  $conn->set_charset('utf8mb4');

  // 1. Log 404s
  if ($is_404) {
    $url_s = $conn->real_escape_string($uri);
    $ref_s = $conn->real_escape_string($_SERVER['HTTP_REFERER'] ?? '');
    $ex = $conn->query("SELECT id FROM error_404_log WHERE url='$url_s'");
    if ($ex && $ex->num_rows > 0) {
      $conn->query("UPDATE error_404_log SET hit_count=hit_count+1,last_seen_at=NOW() WHERE url='$url_s'");
    } else {
      $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0x0fff)|0x4000,mt_rand(0,0x3fff)|0x8000,mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0xffff));
      $conn->query("INSERT INTO error_404_log (id,url,referrer) VALUES ('$id','$url_s','$ref_s')");
    }
  }

  // 2. Custom meta title/description from DB
  $slug = ltrim($uri, '/');
  if ($slug && $slug !== 'index') {
    $meta_title = null; $meta_desc = null;
    if (strpos($slug, 'blog/') === 0) {
      $ps = $conn->real_escape_string(substr($slug, 5));
      $r = $conn->query("SELECT meta_title, meta_description FROM posts WHERE slug='$ps' LIMIT 1");
    } else {
      $ps = $conn->real_escape_string($slug);
      $r = $conn->query("SELECT meta_title, meta_description FROM pages WHERE slug='$ps' LIMIT 1");
    }
    if ($r && $r->num_rows > 0) {
      $row = $r->fetch_assoc();
      $meta_title = $row['meta_title'] ?? null;
      $meta_desc  = $row['meta_description'] ?? null;
    }
    if ($meta_title) {
      $t = htmlspecialchars($meta_title, ENT_QUOTES, 'UTF-8');
      $html = preg_replace('/<title>[^<]*<\/title>/i', "<title>$t</title>", $html) ?? $html;
    }
    if ($meta_desc) {
      $d = htmlspecialchars($meta_desc, ENT_QUOTES, 'UTF-8');
      $html = preg_replace('/<meta\b[^>]*\bname=["\']description["\'][^>]*>/i', "<meta name=\"description\" content=\"$d\"/>", $html) ?? $html;
    }
  }

  // 3. Inject SEO scripts
  $res = $conn->query("SELECT script_content, location FROM seo_scripts WHERE is_active=1 AND environment IN ('both','production') ORDER BY version ASC");
  $head_s = ''; $body_s = ''; $foot_s = '';
  if ($res) while ($row = $res->fetch_assoc()) {
    $c = trim($row['script_content'] ?? '');
    if (!$c) continue;
    if ($row['location'] === 'head')       $head_s .= "\n$c";
    elseif ($row['location'] === 'footer') $foot_s .= "\n$c";
    else                                   $body_s .= "\n$c";
  }
  if ($head_s) $html = str_replace('</head>', "$head_s\n</head>", $html);
  if ($body_s) $html = str_ireplace('<body>', "<body>$body_s", $html);
  if ($foot_s) $html = str_replace('</body>', "$foot_s\n</body>", $html);

  $conn->close();
}

header('Content-Type: text/html; charset=UTF-8');
echo $html;
?>
