-- Login Attempts Table for Brute Force Protection
-- Tracks failed login attempts by email and IP address
-- Implements 3 strikes rule with 15-minute cooldown

CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text NOT NULL,
  attempt_time timestamptz DEFAULT now(),
  success boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert login attempts"
  ON login_attempts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read login attempts"
  ON login_attempts
  FOR SELECT
  TO authenticated
  USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempt_time DESC);

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(
  check_email text,
  check_ip text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  failed_attempts_count int;
  lockout_time timestamptz;
BEGIN
  -- Count failed attempts in last 15 minutes
  lockout_time := now() - interval '15 minutes';
  
  SELECT COUNT(*)
  INTO failed_attempts_count
  FROM login_attempts
  WHERE (email = check_email OR ip_address = check_ip)
    AND success = false
    AND attempt_time > lockout_time;
  
  -- Lock account if 3 or more failed attempts
  RETURN failed_attempts_count >= 3;
END;
$$;

-- Function to record login attempt
CREATE OR REPLACE FUNCTION record_login_attempt(
  attempt_email text,
  attempt_ip text,
  attempt_success boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO login_attempts (email, ip_address, success, attempt_time)
  VALUES (attempt_email, attempt_ip, attempt_success, now());
  
  -- Clean up old attempts (older than 24 hours)
  DELETE FROM login_attempts
  WHERE attempt_time < now() - interval '24 hours';
END;
$$;