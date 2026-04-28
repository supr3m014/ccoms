-- ============================================================
-- CCOMS Hostinger Production Database Migration
-- Run this in Hostinger phpMyAdmin on database: u520390024_ccomsdb
-- ============================================================

-- 1. Create auth_users (admin accounts) from old 'users' table if exists
CREATE TABLE IF NOT EXISTS auth_users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Copy existing admins from 'users' table if it exists (run separately if needed)
-- INSERT IGNORE INTO auth_users (email, password, role)
-- SELECT email, password, 'admin' FROM users;

-- 2. Add missing columns to pages
ALTER TABLE pages ADD COLUMN IF NOT EXISTS visibility ENUM('public','private','password_protected') DEFAULT 'public';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS og_image VARCHAR(500) DEFAULT NULL;

-- 3. Add missing columns to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility ENUM('public','private','password_protected') DEFAULT 'public';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_enabled TINYINT(1) DEFAULT 1;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- 4. Add archived column to contact_submissions
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS archived TINYINT(1) DEFAULT 0;

-- 5. New Support tables
CREATE TABLE IF NOT EXISTS support_tickets (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  subject VARCHAR(500) NOT NULL,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(50),
  category ENUM('general','billing','sales','technical') DEFAULT 'general',
  status ENUM('open','pending','on-hold','resolved') DEFAULT 'open',
  priority ENUM('low','medium','high') DEFAULT 'medium',
  source ENUM('manual','chat','email','form') DEFAULT 'manual',
  chat_session_id VARCHAR(36) DEFAULT NULL,
  assigned_to VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ticket_messages (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  ticket_id VARCHAR(36) NOT NULL,
  sender_type ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  sender_name VARCHAR(255),
  content TEXT NOT NULL,
  is_internal TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_sessions (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  visitor_name VARCHAR(255),
  visitor_email VARCHAR(255),
  visitor_phone VARCHAR(50),
  visitor_address TEXT,
  visitor_country VARCHAR(100),
  category ENUM('general','billing','sales','technical') DEFAULT 'general',
  mode ENUM('ai','human','ended') DEFAULT 'ai',
  admin_id INT DEFAULT NULL,
  ticket_created TINYINT(1) DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  session_id VARCHAR(36) NOT NULL,
  sender_type ENUM('visitor','ai','admin','system') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Client Portal tables
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  business_name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  status ENUM('pending_verification','active','suspended') DEFAULT 'pending_verification',
  first_login_completed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) NOT NULL,
  service_type ENUM('seo','web_dev','brand_design','ai_video','other') NOT NULL,
  service_name VARCHAR(255),
  status ENUM('pending_verification','active','paused','completed','cancelled') DEFAULT 'pending_verification',
  payment_type ENUM('one_off','recurring') DEFAULT 'recurring',
  amount DECIMAL(10,2),
  start_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  order_id VARCHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status ENUM('not_started','in_progress','waiting_on_client','done') DEFAULT 'not_started',
  is_checked TINYINT(1) DEFAULT 0,
  is_client_visible TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS task_comments (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  task_id VARCHAR(36) NOT NULL,
  author_type ENUM('client','admin') NOT NULL,
  author_name VARCHAR(255),
  content TEXT NOT NULL,
  is_internal TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vault_files (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36),
  file_name VARCHAR(500) NOT NULL,
  file_url VARCHAR(1000) NOT NULL,
  file_size INT DEFAULT 0,
  file_type VARCHAR(100),
  upload_type ENUM('client_upload','final_deliverable') DEFAULT 'client_upload',
  uploaded_by ENUM('client','admin') DEFAULT 'client',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS intake_forms (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  service_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  fields JSON NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS intake_responses (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36),
  form_id VARCHAR(36) NOT NULL,
  responses JSON NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36),
  amount DECIMAL(10,2),
  payment_method ENUM('gcash','paymaya','qr_ph','bank_transfer','other') DEFAULT 'gcash',
  status ENUM('pending','verified','rejected') DEFAULT 'pending',
  proof_url VARCHAR(1000),
  notes TEXT,
  verified_at TIMESTAMP NULL DEFAULT NULL,
  verified_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS client_credentials (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) NOT NULL,
  label VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  password_encrypted TEXT,
  url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS client_messages (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) NOT NULL,
  sender_type ENUM('client','admin') NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS client_notifications (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) NOT NULL,
  type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS client_id_counter (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  year YEAR NOT NULL,
  last_number INT DEFAULT 0
) ENGINE=InnoDB;
INSERT IGNORE INTO client_id_counter (year, last_number) VALUES (YEAR(NOW()), 0);

-- 7. Redirects and error logs (if not exist)
CREATE TABLE IF NOT EXISTS redirects (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  redirect_from VARCHAR(500) NOT NULL,
  redirect_to VARCHAR(500) NOT NULL,
  status_code INT DEFAULT 301,
  enabled TINYINT(1) DEFAULT 1,
  hit_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS error_404_log (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  url VARCHAR(500),
  referrer VARCHAR(500),
  hit_count INT DEFAULT 1,
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Create uploads directory placeholder (do in File Manager, not SQL)
-- mkdir public_html/uploads && chmod 777 public_html/uploads

-- ============================================================
-- VERIFY: Run after migration
-- ============================================================
SHOW TABLES;
