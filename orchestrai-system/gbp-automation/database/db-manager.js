/**
 * GBP Automation Database Manager
 * SQLite database operations for GBP posts, campaigns, and publishing logs
 */

import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class GBPDatabaseManager {
  constructor(dbPath = null) {
    // Default to orchestrai-system/gbp-automation/database/gbp-posts.db
    this.dbPath = dbPath || path.join(__dirname, 'gbp-posts.db');
    this.db = null;
  }

  /**
   * Initialize database connection and create tables
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(new Error(`Failed to connect to database: ${err.message}`));
          return;
        }

        console.log(`✅ Connected to SQLite database: ${this.dbPath}`);

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        this.db.exec(schema, (err) => {
          if (err) {
            reject(new Error(`Failed to initialize schema: ${err.message}`));
            return;
          }

          console.log('✅ Database schema initialized');
          resolve();
        });
      });
    });
  }

  /**
   * Close database connection
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) reject(err);
        else {
          console.log('✅ Database connection closed');
          resolve();
        }
      });
    });
  }

  // ==================== POSTS OPERATIONS ====================

  /**
   * Create a new GBP post
   */
  async createPost(postData) {
    const postId = postData.post_id || uuidv4();

    const sql = `
      INSERT INTO posts (
        post_id, campaign_id, title, content, post_type, language,
        topic, category, tags, character_count,
        ai_detection_risk, quality_gate_passed,
        scheduled_date, timezone, status,
        cta_type, cta_url, cta_phone, image_urls,
        event_title, event_start_date, event_end_date,
        offer_title, offer_start_date, offer_end_date, coupon_code, terms_conditions,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      postId,
      postData.campaign_id || null,
      postData.title,
      postData.content,
      postData.post_type,
      postData.language || 'en',
      postData.topic || null,
      postData.category || null,
      postData.tags ? JSON.stringify(postData.tags) : null,
      postData.character_count || postData.content.length,
      postData.ai_detection_risk || null,
      postData.quality_gate_passed ? 1 : 0,
      postData.scheduled_date || null,
      postData.timezone || 'UTC',
      postData.status || 'draft',
      postData.cta_type || null,
      postData.cta_url || null,
      postData.cta_phone || null,
      postData.image_urls ? JSON.stringify(postData.image_urls) : null,
      postData.event_title || null,
      postData.event_start_date || null,
      postData.event_end_date || null,
      postData.offer_title || null,
      postData.offer_start_date || null,
      postData.offer_end_date || null,
      postData.coupon_code || null,
      postData.terms_conditions || null,
      postData.created_by || 'system'
    ];

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, post_id: postId });
      });
    });
  }

  /**
   * Get post by ID (supports both numeric id and post_id string)
   */
  async getPost(postId) {
    // Check if it's a numeric ID or string post_id
    const isNumeric = !isNaN(postId) && !postId.toString().includes('_')
    const sql = isNumeric
      ? 'SELECT * FROM posts WHERE id = ?'
      : 'SELECT * FROM posts WHERE post_id = ?';

    return new Promise((resolve, reject) => {
      this.db.get(sql, [postId], (err, row) => {
        if (err) reject(err);
        else resolve(this._parsePostRow(row));
      });
    });
  }

  /**
   * Get all posts with optional filters
   */
  async getPosts(filters = {}) {
    let sql = 'SELECT * FROM posts WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.campaign_id) {
      sql += ' AND campaign_id = ?';
      params.push(filters.campaign_id);
    }

    if (filters.post_type) {
      sql += ' AND post_type = ?';
      params.push(filters.post_type);
    }

    if (filters.language) {
      sql += ' AND language = ?';
      params.push(filters.language);
    }

    // Search filter - search in title and content
    if (filters.search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam);
    }

    // Date range filter
    if (filters.start_date) {
      sql += ' AND created_at >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      sql += ' AND created_at <= ?';
      params.push(filters.end_date);
    }

    // Ordering
    sql += ' ORDER BY created_at DESC';

    // Limit
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => this._parsePostRow(row)));
      });
    });
  }

  /**
   * Update post
   */
  async updatePost(postId, updates) {
    const allowedFields = [
      'title', 'content', 'post_type', 'language', 'topic', 'category', 'tags',
      'character_count', 'ai_detection_risk', 'quality_gate_passed',
      'scheduled_date', 'timezone', 'status',
      'cta_type', 'cta_url', 'cta_phone', 'image_urls',
      'event_title', 'event_start_date', 'event_end_date',
      'offer_title', 'offer_start_date', 'offer_end_date', 'coupon_code', 'terms_conditions',
      'ghl_post_id', 'published_at', 'publish_error'
    ];

    const fields = [];
    const params = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        // Handle JSON fields
        if (['tags', 'image_urls'].includes(key) && Array.isArray(updates[key])) {
          params.push(JSON.stringify(updates[key]));
        } else if (key === 'quality_gate_passed') {
          params.push(updates[key] ? 1 : 0);
        } else {
          params.push(updates[key]);
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Check if it's a numeric ID or string post_id
    const isNumeric = !isNaN(postId) && !postId.toString().includes('_')
    const whereClause = isNumeric ? 'WHERE id = ?' : 'WHERE post_id = ?'

    params.push(postId);
    const sql = `UPDATE posts SET ${fields.join(', ')} ${whereClause}`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  /**
   * Delete post
   */
  async deletePost(postId) {
    const sql = 'DELETE FROM posts WHERE post_id = ?';

    return new Promise((resolve, reject) => {
      this.db.run(sql, [postId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  /**
   * Get posts ready for publishing (status = approved, scheduled_date <= now)
   */
  async getPostsReadyToPublish() {
    const sql = `
      SELECT * FROM posts
      WHERE status = 'approved'
      AND (scheduled_date IS NULL OR scheduled_date <= datetime('now'))
      ORDER BY scheduled_date ASC
    `;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => this._parsePostRow(row)));
      });
    });
  }

  // ==================== CAMPAIGNS OPERATIONS ====================

  /**
   * Create a new campaign
   */
  async createCampaign(campaignData) {
    const campaignId = campaignData.campaign_id || uuidv4();

    const sql = `
      INSERT INTO campaigns (
        campaign_id, name, description, business_id, business_name,
        status, start_date, end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      campaignId,
      campaignData.name,
      campaignData.description || null,
      campaignData.business_id || null,
      campaignData.business_name || null,
      campaignData.status || 'active',
      campaignData.start_date || null,
      campaignData.end_date || null
    ];

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, campaign_id: campaignId });
      });
    });
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId) {
    const sql = 'SELECT * FROM campaigns WHERE campaign_id = ?';

    return new Promise((resolve, reject) => {
      this.db.get(sql, [campaignId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(filters = {}) {
    let sql = 'SELECT * FROM campaigns WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.business_id) {
      sql += ' AND business_id = ?';
      params.push(filters.business_id);
    }

    sql += ' ORDER BY created_at DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ==================== PUBLISHING LOG OPERATIONS ====================

  /**
   * Log a publishing attempt
   */
  async logPublishAttempt(logData) {
    const sql = `
      INSERT INTO publishing_log (
        post_id, attempt_number, publish_type,
        ghl_post_id, ghl_response, http_status,
        success, error_message, error_code, response_time_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      logData.post_id,
      logData.attempt_number || 1,
      logData.publish_type || 'immediate',
      logData.ghl_post_id || null,
      logData.ghl_response ? JSON.stringify(logData.ghl_response) : null,
      logData.http_status || null,
      logData.success ? 1 : 0,
      logData.error_message || null,
      logData.error_code || null,
      logData.response_time_ms || null
    ];

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  /**
   * Get publishing history for a post
   */
  async getPublishingHistory(postId) {
    const sql = 'SELECT * FROM publishing_log WHERE post_id = ? ORDER BY attempted_at DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, [postId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => this._parseLogRow(row)));
      });
    });
  }

  // ==================== GHL CREDENTIALS OPERATIONS ====================

  /**
   * Store GHL credentials
   */
  async storeGHLCredentials(credentialsData) {
    const sql = `
      INSERT OR REPLACE INTO ghl_credentials (
        business_id, business_name, access_token, refresh_token,
        token_expires_at, ghl_location_id, ghl_account_id, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      credentialsData.business_id,
      credentialsData.business_name || null,
      credentialsData.access_token,
      credentialsData.refresh_token,
      credentialsData.token_expires_at,
      credentialsData.ghl_location_id || null,
      credentialsData.ghl_account_id || null,
      credentialsData.is_active !== undefined ? (credentialsData.is_active ? 1 : 0) : 1
    ];

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  /**
   * Get GHL credentials for a business
   */
  async getGHLCredentials(businessId) {
    const sql = 'SELECT * FROM ghl_credentials WHERE business_id = ? AND is_active = 1';

    return new Promise((resolve, reject) => {
      this.db.get(sql, [businessId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // ==================== HELPER METHODS ====================

  /**
   * Parse post row (handle JSON fields)
   */
  _parsePostRow(row) {
    if (!row) return null;

    return {
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : null,
      image_urls: row.image_urls ? JSON.parse(row.image_urls) : null,
      quality_gate_passed: Boolean(row.quality_gate_passed)
    };
  }

  /**
   * Parse log row (handle JSON fields)
   */
  _parseLogRow(row) {
    if (!row) return null;

    return {
      ...row,
      ghl_response: row.ghl_response ? JSON.parse(row.ghl_response) : null,
      success: Boolean(row.success)
    };
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM posts) as total_posts,
        (SELECT COUNT(*) FROM posts WHERE status = 'draft') as draft_posts,
        (SELECT COUNT(*) FROM posts WHERE status = 'approved') as approved_posts,
        (SELECT COUNT(*) FROM posts WHERE status = 'published') as published_posts,
        (SELECT COUNT(*) FROM campaigns) as total_campaigns,
        (SELECT COUNT(*) FROM publishing_log WHERE success = 1) as successful_publishes,
        (SELECT COUNT(*) FROM publishing_log WHERE success = 0) as failed_publishes
    `;

    return new Promise((resolve, reject) => {
      this.db.get(sql, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

export default GBPDatabaseManager;
