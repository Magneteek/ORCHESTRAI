/**
 * Automated Publishing Workflow to GoHighLevel
 * Publishes approved GBP posts to GHL Social Planner
 */

const GBPDatabaseManager = require('../database/db-manager');
const GoHighLevelAPI = require('../integrations/ghl-api');

class PublishToGHLWorkflow {
  constructor(dbManager = null, ghlAPI = null) {
    this.db = dbManager || new GBPDatabaseManager();
    this.ghl = ghlAPI; // Will be initialized with credentials
  }

  /**
   * Initialize workflow with GHL credentials from database
   */
  async initialize(businessId) {
    try {
      if (!this.db.db) {
        await this.db.initialize();
      }

      // Get GHL credentials from database
      const credentials = await this.db.getGHLCredentials(businessId);

      if (!credentials) {
        throw new Error(`No GHL credentials found for business: ${businessId}`);
      }

      // Initialize GHL API client
      this.ghl = new GoHighLevelAPI({
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token,
        locationId: credentials.ghl_location_id
      });

      console.log(`✅ Initialized GHL API for ${credentials.business_name}`);

      return {
        success: true,
        business_name: credentials.business_name,
        location_id: credentials.ghl_location_id
      };

    } catch (error) {
      console.error('❌ Failed to initialize workflow:', error.message);
      throw error;
    }
  }

  /**
   * Publish all approved posts that are ready
   * Posts are ready if:
   * - status = 'approved'
   * - scheduled_date is NULL (publish now) OR <= current time
   */
  async publishReadyPosts() {
    console.log('🚀 Starting automated publishing workflow...\n');

    try {
      // Get posts ready for publishing
      const readyPosts = await this.db.getPostsReadyToPublish();

      if (readyPosts.length === 0) {
        console.log('ℹ️  No posts ready for publishing');
        return {
          success: true,
          processed: 0,
          results: []
        };
      }

      console.log(`📋 Found ${readyPosts.length} posts ready for publishing\n`);

      const results = [];

      for (const post of readyPosts) {
        console.log(`📤 Publishing: "${post.title}" (${post.post_id})`);
        console.log(`   Type: ${post.post_type}`);
        console.log(`   Language: ${post.language}`);
        console.log(`   Characters: ${post.character_count}`);

        try {
          // Publish to GoHighLevel
          const publishResult = await this.publishSinglePost(post);

          results.push({
            post_id: post.post_id,
            title: post.title,
            ...publishResult
          });

          if (publishResult.success) {
            console.log(`   ✅ Published successfully (GHL ID: ${publishResult.ghl_post_id})\n`);
          } else {
            console.log(`   ❌ Failed: ${publishResult.error}\n`);
          }

          // Rate limiting: Wait 1 second between posts
          await this._sleep(1000);

        } catch (error) {
          console.log(`   ❌ Error: ${error.message}\n`);
          results.push({
            post_id: post.post_id,
            title: post.title,
            success: false,
            error: error.message
          });
        }
      }

      // Summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log('═══════════════════════════════════════');
      console.log('📊 PUBLISHING SUMMARY');
      console.log('═══════════════════════════════════════');
      console.log(`   Total processed: ${results.length}`);
      console.log(`   ✅ Successful: ${successful}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log('═══════════════════════════════════════\n');

      return {
        success: true,
        processed: results.length,
        successful,
        failed,
        results
      };

    } catch (error) {
      console.error('❌ Workflow error:', error.message);
      throw error;
    }
  }

  /**
   * Publish a single post to GoHighLevel
   */
  async publishSinglePost(post) {
    const startTime = Date.now();

    try {
      // Call GHL API
      const apiResult = await this.ghl.createPost(post);

      const responseTime = Date.now() - startTime;

      // Log publishing attempt
      await this.db.logPublishAttempt({
        post_id: post.id,
        publish_type: post.scheduled_date ? 'scheduled' : 'immediate',
        ghl_post_id: apiResult.ghl_post_id || null,
        ghl_response: apiResult.response || null,
        http_status: apiResult.http_status,
        success: apiResult.success,
        error_message: apiResult.error || null,
        error_code: apiResult.error_code || null,
        response_time_ms: responseTime
      });

      if (apiResult.success) {
        // Update post status to published
        await this.db.updatePost(post.post_id, {
          status: 'published',
          ghl_post_id: apiResult.ghl_post_id,
          published_at: new Date().toISOString(),
          publish_error: null
        });

        return {
          success: true,
          ghl_post_id: apiResult.ghl_post_id,
          http_status: apiResult.http_status,
          response_time_ms: responseTime
        };
      } else {
        // Update post status to failed
        await this.db.updatePost(post.post_id, {
          status: 'failed',
          publish_error: apiResult.error
        });

        return {
          success: false,
          error: apiResult.error,
          error_code: apiResult.error_code,
          http_status: apiResult.http_status,
          response_time_ms: responseTime
        };
      }

    } catch (error) {
      // Log failed attempt
      await this.db.logPublishAttempt({
        post_id: post.id,
        publish_type: 'immediate',
        success: false,
        error_message: error.message,
        response_time_ms: Date.now() - startTime
      });

      // Update post status
      await this.db.updatePost(post.post_id, {
        status: 'failed',
        publish_error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Publish specific posts by IDs
   */
  async publishPostsByIds(postIds) {
    console.log(`🚀 Publishing ${postIds.length} specific posts...\n`);

    const results = [];

    for (const postId of postIds) {
      try {
        const post = await this.db.getPost(postId);

        if (!post) {
          console.log(`   ⚠️  Post not found: ${postId}\n`);
          results.push({ post_id: postId, success: false, error: 'Post not found' });
          continue;
        }

        console.log(`📤 Publishing: "${post.title}" (${post.post_id})`);

        const publishResult = await this.publishSinglePost(post);

        results.push({
          post_id: post.post_id,
          title: post.title,
          ...publishResult
        });

        if (publishResult.success) {
          console.log(`   ✅ Published successfully\n`);
        } else {
          console.log(`   ❌ Failed: ${publishResult.error}\n`);
        }

        await this._sleep(1000);

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        results.push({ post_id: postId, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;

    console.log(`\n✅ Published ${successful}/${results.length} posts`);

    return {
      success: true,
      processed: results.length,
      successful,
      results
    };
  }

  /**
   * Retry failed posts
   */
  async retryFailedPosts() {
    console.log('🔄 Retrying failed posts...\n');

    const failedPosts = await this.db.getPosts({ status: 'failed' });

    if (failedPosts.length === 0) {
      console.log('ℹ️  No failed posts to retry');
      return { success: true, processed: 0, results: [] };
    }

    console.log(`📋 Found ${failedPosts.length} failed posts\n`);

    // Reset status to approved for retry
    for (const post of failedPosts) {
      await this.db.updatePost(post.post_id, {
        status: 'approved',
        publish_error: null
      });
    }

    // Publish them
    return await this.publishReadyPosts();
  }

  /**
   * Get publishing statistics
   */
  async getPublishingStats() {
    const stats = await this.db.getStats();

    const publishingLog = await this.db.db.all(
      `SELECT
         COUNT(*) as total_attempts,
         COUNT(CASE WHEN success = 1 THEN 1 END) as successful_attempts,
         COUNT(CASE WHEN success = 0 THEN 1 END) as failed_attempts,
         AVG(response_time_ms) as avg_response_time
       FROM publishing_log`,
      []
    );

    return {
      ...stats,
      publishing: publishingLog[0] || {},
      success_rate: publishingLog[0]
        ? ((publishingLog[0].successful_attempts / publishingLog[0].total_attempts) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Helper: Sleep
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = PublishToGHLWorkflow;
