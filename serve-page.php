<?php
// Serves static HTML pages with:
// 1. SEO scripts injected into <head>/<body> from DB (appear in page source)
// 2. Custom meta title/description from DB (overrides build-time defaults)
// 3. 404 logging to DB

if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0) {
  $db_host = 'localhost'; $db_name = 'ccoms_local'; $db_user = 'root'; $db_pass = '';
} else {
  $db_host = 'localhost'; $db_name = 'u520390024_ccomsdb';
  $db_user = 'u520390024_ccomsdbuser'; $db_pass = '2dIta80$WhZXkZp*';
}

$root = $_SERVER['DOCUMENT_ROOT'];
$uri  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri  = '/' . ltrim($uri, '/');

// Map URI to HTML file
$candidates = [
  $root . $uri . '.html',
  $root . rtrim($uri, '/') . '.html',
  $root . $uri . '/index.html',
  $root . rtrim($uri, '/') . '/index.html',
];
if ($uri === '/') $candidates = [$root . '/index.html'];

$html_file = null;
foreach ($candidates as $c) {
  if (file_exists($c)) { $html_file = $c; break; }
}

$is_404 = false;
if (!$html_file) {
  $html_file = $root . '/404.html';
  $is_404 = true;
  http_response_code(404);
}

$html = file_get_contents($html_file);

// DB connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if (!$conn->connect_error) {
  $conn->set_charset('utf8mb4');

  // 1. Log 404s
  if ($is_404) {
    $url_safe = $conn->real_escape_string($uri);
    $ref_safe = $conn->real_escape_string($_SERVER['HTTP_REFERER'] ?? '');
    $existing = $conn->query("SELECT id FROM error_404_log WHERE url='$url_safe'");
    if ($existing && $existing->num_rows > 0) {
      $conn->query("UPDATE error_404_log SET hit_count=hit_count+1, last_seen_at=NOW() WHERE url='$url_safe'");
    } else {
      $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0x0fff)|0x4000,mt_rand(0,0x3fff)|0x8000,mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0xffff));
      $conn->query("INSERT INTO error_404_log (id, url, referrer) VALUES ('$id','$url_safe','$ref_safe')");
    }
  }

  // 2. Inject custom meta title/description from pages or posts table
  $slug = ltrim(rtrim($uri, '/'), '/');
  $meta_title = null; $meta_desc = null;
  if ($slug === '' || $slug === 'index') {
    // homepage — skip custom meta
  } elseif (strpos($slug, 'blog/') === 0) {
    $post_slug = $conn->real_escape_string(substr($slug, 5));
    $r = $conn->query("SELECT meta_title, meta_description FROM posts WHERE slug='$post_slug' LIMIT 1");
    if ($r && $r->num_rows > 0) { $row = $r->fetch_assoc(); $meta_title = $row['meta_title']; $meta_desc = $row['meta_description']; }
  } else {
    $page_slug = $conn->real_escape_string($slug);
    $r = $conn->query("SELECT meta_title, meta_description FROM pages WHERE slug='$page_slug' LIMIT 1");
    if ($r && $r->num_rows > 0) { $row = $r->fetch_assoc(); $meta_title = $row['meta_title']; $meta_desc = $row['meta_description']; }
  }
  if ($meta_title) {
    $safe_title = htmlspecialchars($meta_title, ENT_QUOTES);
    $html = preg_replace('/<title>[^<]*<\/title>/', "<title>{$safe_title}</title>", $html);
    $html = preg_replace('/<meta\s[^>]*name=["\']og:title["\'][^>]*>/', "<meta property=\"og:title\" content=\"{$safe_title}\"/>", $html);
  }
  if ($meta_desc) {
    $safe_desc = htmlspecialchars($meta_desc, ENT_QUOTES);
    $html = preg_replace('/<meta\s[^>]*name=["\']description["\'][^>]*>/', "<meta name=\"description\" content=\"{$safe_desc}\"/>", $html);
    $html = preg_replace('/<meta\s[^>]*name=["\']og:description["\'][^>]*>/', "<meta name=\"og:description\" content=\"{$safe_desc}\"/>", $html);
  }

  // 3. Inject SEO scripts from DB into page source
  $res = $conn->query("SELECT script_content, location FROM seo_scripts WHERE is_active=1 AND environment IN ('both','production') ORDER BY location, version DESC");
  $head_scripts = ''; $body_start = ''; $footer = '';
  if ($res) while ($row = $res->fetch_assoc()) {
    $c = trim($row['script_content'] ?? '');
    if (!$c) continue;
    switch ($row['location']) {
      case 'head':       $head_scripts .= "\n" . $c; break;
      case 'body_start': $body_start   .= "\n" . $c; break;
      case 'footer':     $footer       .= "\n" . $c; break;
    }
  }
  if ($head_scripts) $html = str_replace('</head>', $head_scripts . "\n</head>", $html);
  if ($body_start)   $html = preg_replace('/<body([^>]*)>/', '<body$1>' . $body_start, $html, 1);
  if ($footer)       $html = str_replace('</body>', $footer . "\n</body>", $html);

  $conn->close();
}

header('Content-Type: text/html; charset=UTF-8');
echo $html;
?>
