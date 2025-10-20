-- Disaster Information & Alert System (DIAS) Database Schema
-- PostgreSQL Database Schema

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_disasters_type ON disasters(type);
CREATE INDEX IF NOT EXISTS idx_disasters_severity ON disasters(severity);
CREATE INDEX IF NOT EXISTS idx_disasters_occurred_at ON disasters(occurred_at);
CREATE INDEX IF NOT EXISTS idx_disasters_location ON disasters(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_disasters_active ON disasters(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_alert_history_user ON alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_disaster ON alert_history(disaster_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_sent ON alert_history(sent_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for disasters table
CREATE TRIGGER update_disasters_updated_at BEFORE UPDATE ON disasters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

