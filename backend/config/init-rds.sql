-- DIAS Database Initialization Script for AWS RDS
-- Run this script to set up the database schema on your RDS instance

-- ============================================
-- DISASTERS SCHEMA
-- ============================================

-- Disasters table
CREATE TABLE IF NOT EXISTS disasters (
  id SERIAL PRIMARY KEY,
  disaster_id VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earthquake', 'flood', 'fire', 'cyclone')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  magnitude DECIMAL(3, 1), -- for earthquakes
  depth DECIMAL(6, 2), -- for earthquakes (km)
  affected_area INTEGER, -- square km
  source VARCHAR(50) NOT NULL, -- USGS, NASA, etc.
  external_url TEXT,
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT false
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_km INTEGER DEFAULT 50,
  disaster_types TEXT[], -- array of disaster types
  min_severity VARCHAR(20) DEFAULT 'low',
  notification_methods TEXT[], -- sms, email, push
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alert history table
CREATE TABLE IF NOT EXISTS alert_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  disaster_id INTEGER REFERENCES disasters(id),
  notification_method VARCHAR(20),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT
);

-- ============================================
-- SNS SCHEMA
-- ============================================

-- SNS Topics table (one per country)
CREATE TABLE IF NOT EXISTS sns_topics (
  id SERIAL PRIMARY KEY,
  country VARCHAR(100) UNIQUE NOT NULL,
  topic_arn VARCHAR(255) UNIQUE NOT NULL,
  disaster_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Email Subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  subscription_arn VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, unsubscribed
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  UNIQUE(email, country)
);

-- Disaster Alerts Log table (track sent alerts)
CREATE TABLE IF NOT EXISTS disaster_alerts_log (
  id SERIAL PRIMARY KEY,
  disaster_id INTEGER REFERENCES disasters(id),
  country VARCHAR(100) NOT NULL,
  topic_arn VARCHAR(255) NOT NULL,
  message_id VARCHAR(255),
  subject TEXT,
  message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'sent' -- sent, failed
);

-- ============================================
-- INDEXES
-- ============================================

-- Disasters indexes
CREATE INDEX IF NOT EXISTS idx_disasters_type ON disasters(type);
CREATE INDEX IF NOT EXISTS idx_disasters_severity ON disasters(severity);
CREATE INDEX IF NOT EXISTS idx_disasters_occurred_at ON disasters(occurred_at);
CREATE INDEX IF NOT EXISTS idx_disasters_location ON disasters(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_disasters_active ON disasters(is_active);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);

-- Alert history indexes
CREATE INDEX IF NOT EXISTS idx_alert_history_user ON alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_disaster ON alert_history(disaster_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_sent ON alert_history(sent_at);

-- SNS indexes
CREATE INDEX IF NOT EXISTS idx_sns_topics_country ON sns_topics(country);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_country ON email_subscriptions(country);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_disaster_alerts_log_disaster ON disaster_alerts_log(disaster_id);
CREATE INDEX IF NOT EXISTS idx_disaster_alerts_log_country ON disaster_alerts_log(country);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for disasters table
DROP TRIGGER IF EXISTS update_disasters_updated_at ON disasters;
CREATE TRIGGER update_disasters_updated_at BEFORE UPDATE ON disasters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for sns_topics updated_at
DROP TRIGGER IF EXISTS update_sns_topics_updated_at ON sns_topics;
CREATE TRIGGER update_sns_topics_updated_at BEFORE UPDATE ON sns_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✓ DIAS database schema initialized successfully!';
  RAISE NOTICE 'Tables created: disasters, users, subscriptions, alert_history, sns_topics, email_subscriptions, disaster_alerts_log';
END $$;
