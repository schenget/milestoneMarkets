CREATE TABLE countries (
  code CHAR(2) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  language VARCHAR(12) NOT NULL,
  disclaimer TEXT NOT NULL,
  pricing_plan_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone VARCHAR(30) UNIQUE,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(120),
  password_hash VARCHAR(255),
  password_salt VARCHAR(64),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','analyst','operator','subscriber')),
  country_code CHAR(2) REFERENCES countries(code),
  language VARCHAR(12) NOT NULL DEFAULT 'en',
  experience_level VARCHAR(20) CHECK (experience_level IN ('beginner','intermediate')),
  account_type VARCHAR(10) NOT NULL DEFAULT 'free' CHECK (account_type IN ('free','premium')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT users_identity CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  country_code CHAR(2) NOT NULL REFERENCES countries(code),
  plan VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE strategy_configs (
  id UUID PRIMARY KEY,
  strategy_name VARCHAR(64) NOT NULL,
  country_code CHAR(2) NOT NULL REFERENCES countries(code),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  parameters JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(strategy_name, country_code)
);

CREATE TABLE feed_sources (
  id UUID PRIMARY KEY,
  source_type VARCHAR(20) NOT NULL,
  name VARCHAR(120) NOT NULL,
  endpoint TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  country_code CHAR(2) REFERENCES countries(code),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE feed_items (
  id UUID PRIMARY KEY,
  source_id UUID REFERENCES feed_sources(id),
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  country_code CHAR(2) REFERENCES countries(code),
  sector VARCHAR(80),
  symbol VARCHAR(20),
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  sentiment NUMERIC(4,2) NOT NULL,
  published_at TIMESTAMP NOT NULL,
  dedupe_key VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE signals (
  id UUID PRIMARY KEY,
  strategy_name VARCHAR(64) NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  country_code CHAR(2) NOT NULL REFERENCES countries(code),
  action VARCHAR(8) NOT NULL,
  confidence NUMERIC(5,2) NOT NULL,
  risk_level VARCHAR(10) NOT NULL,
  explanation TEXT NOT NULL,
  payload JSONB NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE simulations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  strategy_name VARCHAR(64) NOT NULL,
  country_code CHAR(2) NOT NULL REFERENCES countries(code),
  starting_capital NUMERIC(14,2) NOT NULL,
  period_days INTEGER NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE channel_messages (
  id UUID PRIMARY KEY,
  channel VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  recipient VARCHAR(64),
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE regulatory_texts (
  id UUID PRIMARY KEY,
  country_code CHAR(2) NOT NULL REFERENCES countries(code),
  language VARCHAR(12) NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(country_code, language)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_id UUID REFERENCES users(id),
  actor_role VARCHAR(20),
  action VARCHAR(120) NOT NULL,
  entity VARCHAR(80) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Education module
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
  reading_time_min INTEGER NOT NULL DEFAULT 5,
  language VARCHAR(12) NOT NULL DEFAULT 'en',
  content TEXT NOT NULL,
  free BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_slug VARCHAR(120) NOT NULL REFERENCES lessons(slug) ON DELETE CASCADE,
  completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_slug)
);

-- Simulated trading
CREATE TABLE portfolio_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  simulated_balance NUMERIC(14,2) NOT NULL DEFAULT 10000.00,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  avg_price NUMERIC(14,4) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE TABLE simulated_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  symbol VARCHAR(20) NOT NULL,
  action VARCHAR(4) NOT NULL CHECK (action IN ('BUY','SELL')),
  quantity INTEGER NOT NULL,
  price NUMERIC(14,4) NOT NULL,
  pnl NUMERIC(14,2),
  traded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feed_items_country_published ON feed_items(country_code, published_at DESC);
CREATE INDEX idx_signals_country_symbol ON signals(country_code, symbol);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_simulated_trades_user ON simulated_trades(user_id, traded_at DESC);

