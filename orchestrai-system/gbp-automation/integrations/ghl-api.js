/**
 * GoHighLevel Social Planner API Integration
 * Complete API client for GBP post creation and scheduling
 */

const axios = require('axios');

class GoHighLevelAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'https://services.leadconnectorhq.com';
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.locationId = config.locationId; // GHL location ID
    this.version = config.version || 'v1';

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Version': '2021-07-28' // GHL API version
      },
      timeout: 30000 // 30 seconds
    });

    // Add auth interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          if (this.refreshToken) {
            try {
              await this.refreshAccessToken();
              // Retry original request with new token
              error.config.headers['Authorization'] = `Bearer ${this.accessToken}`;
              return this.client.request(error.config);
            } catch (refreshError) {
              throw new Error('Failed to refresh access token');
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Refresh OAuth access token
   */
  async refreshAccessToken() {
    try {
      const response = await axios.post(
        `${this.baseURL}/oauth/token`,
        {
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: process.env.GHL_CLIENT_ID,
          client_secret: process.env.GHL_CLIENT_SECRET
        }
      );

      this.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }

      return {
        access_token: this.accessToken,
        refresh_token: this.refreshToken,
        expires_at: new Date(Date.now() + response.data.expires_in * 1000).toISOString()
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Create a social media post
   * @param {Object} postData - Post data matching GHL API format
   */
  async createPost(postData) {
    const startTime = Date.now();

    try {
      // Map post data to GHL API format
      const ghlPost = this._mapToGHLFormat(postData);

      const response = await this.client.post(
        '/social-media-posting',
        ghlPost
      );

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        ghl_post_id: response.data.id || response.data._id,
        response: response.data,
        http_status: response.status,
        response_time_ms: responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        success: false,
        error: error.message,
        error_code: error.response?.data?.code || error.code,
        error_details: error.response?.data || null,
        http_status: error.response?.status || 500,
        response_time_ms: responseTime
      };
    }
  }

  /**
   * Get post by ID
   */
  async getPost(postId) {
    try {
      const response = await this.client.get(
        `/social-media-posting/${postId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get post: ${error.message}`);
    }
  }

  /**
   * Update post
   */
  async updatePost(postId, updates) {
    try {
      const ghlUpdates = this._mapToGHLFormat(updates);

      const response = await this.client.put(
        `/social-media-posting/${postId}`,
        ghlUpdates
      );

      return {
        success: true,
        response: response.data,
        http_status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        error_code: error.response?.data?.code || error.code,
        http_status: error.response?.status || 500
      };
    }
  }

  /**
   * Delete post
   */
  async deletePost(postId) {
    try {
      const response = await this.client.delete(
        `/social-media-posting/${postId}`
      );

      return {
        success: true,
        http_status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        http_status: error.response?.status || 500
      };
    }
  }

  /**
   * List all posts
   */
  async listPosts(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await this.client.get(
        `/social-media-posting?${params.toString()}`
      );

      return {
        success: true,
        posts: response.data.posts || response.data,
        total: response.data.total || response.data.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Batch create multiple posts
   */
  async batchCreatePosts(postsData) {
    const results = [];

    for (const postData of postsData) {
      try {
        const result = await this.createPost(postData);
        results.push({
          post_id: postData.post_id,
          ...result
        });

        // Rate limiting: wait 1 second between requests
        await this._sleep(1000);
      } catch (error) {
        results.push({
          post_id: postData.post_id,
          success: false,
          error: error.message
        });
      }
    }

    return {
      total: postsData.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * Map internal post format to GoHighLevel API format
   * Based on GHL Social Planner CSV format
   */
  _mapToGHLFormat(postData) {
    const ghlPost = {
      // Scheduling
      postAtSpecificTime: postData.scheduled_date || null,

      // Content
      content: postData.content,

      // Media
      imageUrls: Array.isArray(postData.image_urls)
        ? postData.image_urls.join(',')
        : postData.image_urls || '',

      // Platform settings
      mediaOptimization: true,
      applyWatermark: false,

      // Categorization
      tags: Array.isArray(postData.tags)
        ? postData.tags.join(',')
        : postData.tags || '',
      category: postData.category || 'Izobraževanje',

      // Platform-specific: Google Business Profile
      eventType: this._mapEventType(postData.post_type),
      actionType: postData.cta_type || 'learn_more',
      title: postData.title || '',

      // Offer details (if post_type === 'offer')
      offerTitle: postData.offer_title || '',
      startDate: postData.offer_start_date || postData.event_start_date || '',
      endDate: postData.offer_end_date || postData.event_end_date || '',
      termsConditions: postData.terms_conditions || '',
      couponCode: postData.coupon_code || '',

      // CTA URL
      actionUrl: postData.cta_url || '',

      // Location targeting (if provided)
      locationId: this.locationId
    };

    return ghlPost;
  }

  /**
   * Map internal post_type to GHL eventType
   */
  _mapEventType(postType) {
    const mapping = {
      'whats_new': 'call_to_action',
      'event': 'event',
      'offer': 'offer',
      'product': 'call_to_action'
    };

    return mapping[postType] || 'call_to_action';
  }

  /**
   * Helper: Sleep/delay
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test connection and credentials
   */
  async testConnection() {
    try {
      const response = await this.client.get('/locations/' + this.locationId);
      return {
        success: true,
        location: response.data,
        message: 'Connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Connection failed'
      };
    }
  }

  /**
   * Get account details
   */
  async getAccountDetails() {
    try {
      const response = await this.client.get('/locations/' + this.locationId);
      return {
        success: true,
        location_id: response.data.id,
        location_name: response.data.name,
        business_name: response.data.businessName || response.data.name,
        timezone: response.data.timezone || 'UTC'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GoHighLevelAPI;
