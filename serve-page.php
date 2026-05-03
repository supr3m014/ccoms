<?php
// Serves static HTML pages with SEO scripts injected into <head>
// Called by .htaccess for all page requests

// DB config
if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0) {
  $db_host = 'localhost'; $db_name = 'ccoms_local'; $db_user = 'root'; $db_pass = '';
} else {
  $db_host = 'localhost'; $db_name = 'u520390024_ccomsdb';
  $db_user = 'u520390024_ccomsdbuser'; $db_pass = '2dIta80$WhZXkZp*';
}

// Find the HTML file for the requested URL
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = '/' . ltrim($uri, '/');
$root = $_SERVER['DOCUMENT_ROOT'];

// Map URI to HTML file
$candidates = [
  $root . $uri . '.html',
  $root . rtrim($uri, '/') . '.html',
  $root . $uri . '/index.html',
  $root . rtrim($uri, '/') . '/index.html',
];

$html_file = null;
foreach ($candidates as $c) {
  if (file_exists($c)) { $html_file = $c; break; }
}

if (!$html_file) {
  // Fall back to 404 page
  $html_file = $root . '/404.html';
  if (!file_exists($html_file)) { http_response_code(404); echo '404 Not Found'; exit(); }
  http_response_code(404);
}

$html = file_get_contents($html_file);

// Get active scripts from DB
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if (!$conn->connect_error) {
  $res = $conn->query("SELECT script_content, location FROM seo_scripts WHERE is_active=1 AND environment IN ('both','production') ORDER BY location, version DESC");
  $head_scripts = ''; $body_start_scripts = ''; $footer_scripts = '';
  if ($res) {
    while ($row = $res->fetch_assoc()) {
      $content = $row['script_content'] ?? '';
      if (!trim($content)) continue;
      switch ($row['location']) {
        case 'head': $head_scripts .= "\n" . $content; break;
        case 'body_start': $body_start_scripts .= "\n" . $content; break;
        case 'footer': $footer_scripts .= "\n" . $content; break;
      }
    }
  }
  $conn->close();

  // Inject into HTML
  if ($head_scripts) $html = str_replace('</head>', $head_scripts . "\n</head>", $html);
  if ($body_start_scripts) $html = str_replace('<body', $body_start_scripts . "\n<body", $html);
  if ($footer_scripts) $html = str_replace('</body>', $footer_scripts . "\n</body>", $html);
}

header('Content-Type: text/html; charset=UTF-8');
echo $html;
?>
