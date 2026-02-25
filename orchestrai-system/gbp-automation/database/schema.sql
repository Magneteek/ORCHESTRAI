-- GBP Automation System Database Schema
-- SQLite database for managing GBP posts, campaigns, and publishing

-- Posts table: Store all GBP posts
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT UNIQUE NOT NULL, -- UUID for external reference
  campaign_id INTEGER,

  -- Content fields
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK(post_type IN ('whats_new', 'event', 'offer', 'product')),
  language TEXT DEFAULT 'en',

  -- Metadata
  topic TEXT,
  category TEXT,
  tags TEXT, -- JSON array of tags
  character_count INTEGER,

  -- Quality metrics
  ai_detection_risk INTEGER, -- 0-100 percentage
  quality_gate_passed INTEGER DEFAULT 0, -- Boolean: 0 or 1

  -- Scheduling
  scheduled_date TEXT, -- ISO 8601 format: YYYY-MM-DD HH:mm:ss
  timezone TEXT DEFAULT 'UTC',

  -- Status tracking
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'approved', 'scheduled', 'published', 'failed', 'archived')),

  -- Publishing data
  ghl_post_id TEXT, -- GoHighLevel post ID after publishing
  published_at TEXT, -- ISO 8601 timestamp
  publish_error TEXT, -- Error message if publishing failed

  -- CTA and media
  cta_type TEXT, -- CALL, BOOK, LEARN_MORE, etc.
  cta_url TEXT,
  cta_phone TEXT,
  image_urls TEXT, -- JSON array of image URLs

  -- Event-specific fields
  event_title TEXT,
  event_start_date TEXT,
  event_end_date TEXT,

  -- Offer-specific fields
  offer_title TEXT,
  offer_start_date TEXT,
  offer_end_date TEXT,
  coupon_code TEXT,
  terms_conditions TEXT,

  -- Audit fields
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,

  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Campaigns table: Group related posts
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id TEXT UNIQUE NOT NULL, -- UUID

  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  business_id TEXT, -- Link to client project
  business_name TEXT,

  -- Campaign metrics
  total_posts INTEGER DEFAULT 0,
  published_posts INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'completed', 'archived')),

  -- Dates
  start_date TEXT,
  end_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Publishing log: Detailed history of all publish attempts
CREATE TABLE IF NOT EXISTS publishing_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,

  -- Attempt details
  attempt_number INTEGER DEFAULT 1,
  publish_type TEXT CHECK(publish_type IN ('immediate', 'scheduled', 'batch')),

  -- API response
  ghl_post_id TEXT,
  ghl_response TEXT, -- JSON response from GoHighLevel API
  http_status INTEGER,

  -- Result
  success INTEGER DEFAULT 0, -- Boolean: 0 or 1
  error_message TEXT,
  error_code TEXT,

  -- Timing
  attempted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  response_time_ms INTEGER,

  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- GoHighLevel credentials: Store OAuth tokens (encrypted)
CREATE TABLE IF NOT EXISTS ghl_credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id TEXT UNIQUE NOT NULL,
  business_name TEXT,

  -- OAuth tokens (should be encrypted in production)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TEXT,

  -- GHL account details
  ghl_location_id TEXT,
  ghl_account_id TEXT,

  -- Status
  is_active INTEGER DEFAULT 1,
  last_refresh_at TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_campaign_id ON posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_date ON posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_publishing_log_post_id ON publishing_log(post_id);
CREATE INDEX IF NOT EXISTS idx_publishing_log_success ON publishing_log(success);

-- Triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_posts_timestamp
  AFTER UPDATE ON posts
  FOR EACH ROW
  BEGIN
    UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_campaigns_timestamp
  AFTER UPDATE ON campaigns
  FOR EACH ROW
  BEGIN
    UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Trigger to update campaign post counts
CREATE TRIGGER IF NOT EXISTS update_campaign_total_posts
  AFTER INSERT ON posts
  FOR EACH ROW
  WHEN NEW.campaign_id IS NOT NULL
  BEGIN
    UPDATE campaigns
    SET total_posts = total_posts + 1
    WHERE id = NEW.campaign_id;
  END;

CREATE TRIGGER IF NOT EXISTS update_campaign_published_posts
  AFTER UPDATE ON posts
  FOR EACH ROW
  WHEN NEW.status = 'published' AND OLD.status != 'published' AND NEW.campaign_id IS NOT NULL
  BEGIN
    UPDATE campaigns
    SET published_posts = published_posts + 1
    WHERE id = NEW.campaign_id;
  END;
