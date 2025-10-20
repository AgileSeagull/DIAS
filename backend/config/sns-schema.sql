-- AWS SNS Topics and Subscriptions Schema

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sns_topics_country ON sns_topics(country);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_country ON email_subscriptions(country);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_disaster_alerts_log_disaster ON disaster_alerts_log(disaster_id);
CREATE INDEX IF NOT EXISTS idx_disaster_alerts_log_country ON disaster_alerts_log(country);

-- Trigger for sns_topics updated_at
CREATE TRIGGER update_sns_topics_updated_at BEFORE UPDATE ON sns_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

