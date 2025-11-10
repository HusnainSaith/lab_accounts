-- Create blacklisted_tokens table
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_jti varchar(255) NOT NULL,
  user_id uuid NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);