CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  bedtime TIME,
  smoker BOOLEAN,
  hormonal_bc BOOLEAN,
  tolerance_min INT DEFAULT 10,
  is_simulated BOOLEAN DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS drinks (
  time TIMESTAMPTZ NOT NULL,
  user_id INT REFERENCES users(id),
  drink_key TEXT,
  mg REAL,
  mg_low REAL,
  mg_high REAL,
  source TEXT
);
SELECT create_hypertable('drinks', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS drinks_user_time ON drinks (user_id, time);

CREATE TABLE IF NOT EXISTS auth_accounts (
  email TEXT PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_sessions_expiry ON auth_sessions (expires_at);
CREATE TABLE IF NOT EXISTS auth_resets (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS alcohol (
  time TIMESTAMPTZ NOT NULL,
  user_id INT REFERENCES users(id),
  units REAL
);
SELECT create_hypertable('alcohol', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS alcohol_user_time ON alcohol (user_id, time);

CREATE TABLE IF NOT EXISTS sleep_nights (
  night DATE,
  user_id INT REFERENCES users(id),
  bedtime TIMESTAMPTZ,
  latency_min REAL,
  rested_1to5 INT,
  PRIMARY KEY (user_id, night)
);
CREATE TABLE IF NOT EXISTS hr_checks (
  time TIMESTAMPTZ NOT NULL,
  user_id INT REFERENCES users(id),
  drink_time TIMESTAMPTZ,
  hr_bpm REAL,
  br_bpm REAL
);
SELECT create_hypertable('hr_checks', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS hr_checks_user_time ON hr_checks (user_id, time);

CREATE MATERIALIZED VIEW IF NOT EXISTS daily_caffeine
WITH (timescaledb.continuous) AS
SELECT user_id, time_bucket('1 day', time) AS day, SUM(mg) AS total_mg
FROM drinks GROUP BY user_id, day
WITH NO DATA;
ALTER MATERIALIZED VIEW daily_caffeine SET (timescaledb.materialized_only = false);
SELECT add_continuous_aggregate_policy('daily_caffeine',
  start_offset => NULL,
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 hour',
  if_not_exists => TRUE);
