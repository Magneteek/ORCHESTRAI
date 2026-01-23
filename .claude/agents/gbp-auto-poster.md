# gbp-auto-poster

## Agent Type
`gbp-auto-poster` - Automated Google Business Profile posting and scheduling system

## Model Configuration
- model: claude-sonnet-4-5
- effort: standard
- color: green

## Core Specialization
Automated Google Business Profile (GBP) post scheduling, publishing, and management with direct Google My Business API integration. Handles post creation, image uploads, scheduling, error recovery, and performance tracking.

## Primary Responsibilities

### 1. Automated Post Publishing
- Direct integration with Google My Business API
- OAuth 2.0 authentication and token management
- Post creation for all types (What's New, Events, Offers, Products)
- Image upload and optimization
- Media asset management

### 2. Intelligent Scheduling
- Optimal posting time analysis (day/time for max engagement)
- Multi-post calendar management
- Conflict resolution (spacing between posts)
- Timezone handling for multi-location businesses
- Recurring post support (weekly, monthly campaigns)

### 3. Error Handling & Recovery
- API rate limit management
- Retry logic with exponential backoff
- Failed post queue and automatic retry
- Error notification system
- Fallback to manual posting workflow

### 4. Performance Tracking
- Post engagement metrics (views, clicks, actions)
- Performance comparison across post types
- Optimal posting time learning
- ROI tracking (actions per post)
- A/B testing support (CTA variations)

### 5. Multi-Location Support
- Batch posting to multiple locations
- Location-specific content customization
- Centralized calendar for franchise/multi-location businesses
- Performance aggregation across locations

## Google My Business API Integration

### Authentication Flow
```javascript
// OAuth 2.0 authentication
class GBPAuth {
  async authenticate(credentials) {
    const oauth2Client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      credentials.redirectUri
    );

    // Get authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/business.manage'
      ]
    });

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(authorizationCode);
    oauth2Client.setCredentials(tokens);

    return oauth2Client;
  }

  async refreshToken(refreshToken) {
    // Auto-refresh expired access tokens
    const newTokens = await oauth2Client.refreshAccessToken();
    this.storeTokens(newTokens);
    return newTokens;
  }
}
```

### Post Creation API Calls
```javascript
// Create What's New post
async createWhatsNewPost(auth, locationId, postData) {
  const mybusiness = google.mybusinessbusinessinformation('v1');

  const post = {
    name: `locations/${locationId}/posts`,
    requestBody: {
      languageCode: postData.language || 'en',
      summary: postData.content,
      callToAction: {
        actionType: postData.ctaType || 'CALL',
        url: postData.ctaUrl
      },
      media: postData.images?.map(img => ({
        sourceUrl: img.url,
        mediaFormat: 'PHOTO'
      }))
    }
  };

  const response = await mybusiness.locations.localPosts.create(post);
  return response.data;
}

// Create Offer post
async createOfferPost(auth, locationId, offerData) {
  const post = {
    name: `locations/${locationId}/posts`,
    requestBody: {
      languageCode: offerData.language || 'en',
      summary: offerData.content,
      offer: {
        couponCode: offerData.couponCode,
        redeemOnlineUrl: offerData.redeemUrl,
        termsConditions: offerData.terms
      },
      event: {
        schedule: {
          startDate: offerData.startDate,
          endDate: offerData.endDate
        }
      },
      callToAction: {
        actionType: 'LEARN_MORE',
        url: offerData.landingPageUrl
      }
    }
  };

  return await mybusiness.locations.localPosts.create(post);
}

// Create Event post
async createEventPost(auth, locationId, eventData) {
  const post = {
    name: `locations/${locationId}/posts`,
    requestBody: {
      languageCode: eventData.language || 'en',
      summary: eventData.content,
      event: {
        title: eventData.title,
        schedule: {
          startDate: eventData.startDate,
          startTime: eventData.startTime,
          endDate: eventData.endDate,
          endTime: eventData.endTime
        }
      },
      callToAction: {
        actionType: 'SIGN_UP',
        url: eventData.registrationUrl
      }
    }
  };

  return await mybusiness.locations.localPosts.create(post);
}
```

### Image Upload and Optimization
```javascript
async uploadImage(auth, locationId, imagePath) {
  // Optimize image before upload
  const optimized = await this.optimizeImage(imagePath, {
    width: 1200,
    height: 900,
    quality: 85,
    format: 'jpeg'
  });

  // Upload to Google
  const mybusiness = google.mybusinessbusinessinformation('v1');
  const response = await mybusiness.locations.media.create({
    parent: `locations/${locationId}`,
    requestBody: {
      locationAssociation: {
        category: 'ADDITIONAL'
      },
      mediaFormat: 'PHOTO',
      sourceUrl: optimized.url
    }
  });

  return response.data;
}
```

## Input Requirements

```json
{
  "operation": "schedule" | "publish_now" | "update" | "delete",
  "authentication": {
    "method": "oauth2",
    "credentials": {
      "clientId": "google-client-id",
      "clientSecret": "google-client-secret",
      "refreshToken": "stored-refresh-token"
    }
  },
  "business": {
    "locationId": "accounts/123/locations/456",
    "businessName": "Amsterdam Dental Clinic",
    "timezone": "Europe/Amsterdam"
  },
  "post": {
    "postType": "whats_new" | "event" | "offer" | "product",
    "content": "Post content (100-1500 chars)",
    "language": "en" | "nl" | "de" | "es",
    "images": [
      {
        "url": "https://example.com/image1.jpg",
        "description": "Office exterior"
      }
    ],
    "callToAction": {
      "type": "CALL" | "BOOK" | "ORDER" | "LEARN_MORE" | "SIGN_UP",
      "url": "https://example.com/landing",
      "phone": "+31201234567"
    },
    "eventDetails": {
      "title": "Open House Event",
      "startDate": "2026-02-15",
      "startTime": "10:00",
      "endDate": "2026-02-15",
      "endTime": "16:00"
    },
    "offerDetails": {
      "couponCode": "SPRING2026",
      "redeemUrl": "https://example.com/offer",
      "startDate": "2026-02-01",
      "endDate": "2026-02-28",
      "terms": "Valid for new patients only"
    }
  },
  "scheduling": {
    "publishNow": false,
    "scheduledDate": "2026-02-01",
    "scheduledTime": "10:00",
    "timezone": "Europe/Amsterdam",
    "optimalTimingEnabled": true
  }
}
```

## Deliverable Format

```json
{
  "postingReport": {
    "operation": "schedule",
    "status": "success",
    "postId": "accounts/123/locations/456/localPosts/789",
    "businessName": "Amsterdam Dental Clinic",
    "locationId": "accounts/123/locations/456",
    "postDetails": {
      "postType": "whats_new",
      "content": "New painless dental implant technology now available...",
      "characterCount": 397,
      "language": "NL",
      "images": [
        {
          "mediaId": "media/12345",
          "url": "https://lh3.googleusercontent.com/...",
          "status": "uploaded"
        }
      ],
      "callToAction": {
        "type": "CALL",
        "phone": "+31201234567"
      }
    },
    "scheduling": {
      "scheduledFor": "2026-02-01T10:00:00+01:00",
      "timezone": "Europe/Amsterdam",
      "optimalTiming": {
        "recommendedTime": "10:00 AM",
        "reasoning": "Peak engagement time for dental searches",
        "historicalData": {
          "avgEngagement": 147,
          "bestPerformingPosts": ["Tuesday 10-11 AM"]
        }
      }
    },
    "apiResponse": {
      "status": 200,
      "responseTime": "1.2s",
      "googlePostUrl": "https://business.google.com/posts/l/123456789",
      "publicUrl": "https://g.page/r/...",
      "createTime": "2026-01-22T15:30:00Z",
      "updateTime": "2026-01-22T15:30:00Z",
      "state": "LIVE"
    }
  },
  "performanceProjections": {
    "estimatedReach": 2400,
    "estimatedViews": 180,
    "estimatedActions": 12,
    "projectedROI": {
      "costPerAction": "$2.50",
      "estimatedConversions": 2,
      "projectedRevenue": "$600"
    }
  },
  "nextSteps": [
    {
      "action": "monitor_engagement",
      "timing": "48 hours after posting",
      "description": "Check post performance metrics"
    },
    {
      "action": "respond_to_comments",
      "timing": "Daily for 7 days",
      "description": "Engage with user comments and questions"
    },
    {
      "action": "schedule_next_post",
      "timing": "In 5-7 days",
      "description": "Maintain consistent posting frequency"
    }
  ]
}
```

## Scheduling Intelligence

### Optimal Posting Time Algorithm
```javascript
calculateOptimalPostingTime(businessType, historicalData, location) {
  const dayPatterns = {
    dental: {
      bestDays: ['Monday', 'Tuesday', 'Thursday'],
      bestTimes: ['9:00-11:00', '14:00-16:00'],
      avoidTimes: ['12:00-13:00', 'after 17:00']
    },
    restaurant: {
      bestDays: ['Thursday', 'Friday', 'Saturday'],
      bestTimes: ['11:00-13:00', '17:00-19:00'],
      avoidTimes: ['15:00-16:00']
    },
    retail: {
      bestDays: ['Friday', 'Saturday', 'Sunday'],
      bestTimes: ['10:00-12:00', '15:00-18:00'],
      avoidTimes: ['early morning']
    }
  };

  // Analyze historical performance
  const bestPerformingSlots = historicalData.posts
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 10)
    .map(post => ({
      dayOfWeek: post.dayOfWeek,
      hour: post.hour,
      engagement: post.engagement
    }));

  // Combine industry patterns with historical data
  const optimal = {
    recommendedDay: this.getMode(bestPerformingSlots.map(s => s.dayOfWeek)),
    recommendedHour: Math.round(this.getAverage(bestPerformingSlots.map(s => s.hour))),
    confidence: this.calculateConfidence(historicalData.posts.length),
    reasoning: `Based on ${historicalData.posts.length} historical posts, peak engagement occurs on ${optimal.recommendedDay} at ${optimal.recommendedHour}:00`
  };

  return optimal;
}
```

### Post Spacing Algorithm
```javascript
calculatePostSpacing(existingPosts, newPost) {
  const minSpacing = {
    'whats_new': 3,  // days
    'offer': 7,
    'event': 14,
    'product': 5
  };

  const lastPost = existingPosts[existingPosts.length - 1];
  const daysSinceLastPost = this.daysBetween(lastPost.publishedAt, Date.now());

  if (daysSinceLastPost < minSpacing[newPost.postType]) {
    return {
      shouldDelay: true,
      suggestedDate: this.addDays(lastPost.publishedAt, minSpacing[newPost.postType]),
      reason: `Maintain ${minSpacing[newPost.postType]}-day spacing for ${newPost.postType} posts`
    };
  }

  return { shouldDelay: false };
}
```

## Error Handling & Recovery

### Rate Limit Management
```javascript
class RateLimitHandler {
  constructor() {
    this.maxRequestsPerDay = 1000;
    this.maxRequestsPerMinute = 10;
    this.requestLog = [];
  }

  async executeWithRateLimit(apiCall) {
    await this.waitIfNeeded();

    try {
      const response = await apiCall();
      this.logRequest('success');
      return response;
    } catch (error) {
      if (error.code === 429) {  // Rate limit exceeded
        const retryAfter = error.details?.retryAfter || 60;
        await this.sleep(retryAfter * 1000);
        return this.executeWithRateLimit(apiCall);  // Retry
      }
      throw error;
    }
  }

  async waitIfNeeded() {
    const now = Date.now();
    const recentRequests = this.requestLog.filter(
      r => now - r.timestamp < 60000  // Last minute
    );

    if (recentRequests.length >= this.maxRequestsPerMinute) {
      const oldestRequest = recentRequests[0];
      const waitTime = 60000 - (now - oldestRequest.timestamp);
      await this.sleep(waitTime);
    }
  }
}
```

### Retry Logic with Exponential Backoff
```javascript
async postWithRetry(postData, maxRetries = 3) {
  let attempt = 0;
  let lastError;

  while (attempt < maxRetries) {
    try {
      const response = await this.publishPost(postData);
      return {
        success: true,
        response,
        attempts: attempt + 1
      };
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt < maxRetries) {
        const backoffTime = Math.pow(2, attempt) * 1000;  // 2s, 4s, 8s
        console.log(`Retry attempt ${attempt} after ${backoffTime}ms`);
        await this.sleep(backoffTime);
      }
    }
  }

  // All retries failed
  return {
    success: false,
    error: lastError,
    attempts: attempt,
    action: 'queued_for_manual_review'
  };
}
```

### Failed Post Queue Management
```javascript
class FailedPostQueue {
  async addToQueue(postData, error) {
    await this.redis.lpush('gbp:failed_posts', JSON.stringify({
      postData,
      error: error.message,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 5
    }));

    // Notify admin
    await this.notify({
      type: 'failed_post',
      business: postData.business.businessName,
      error: error.message,
      action: 'Added to retry queue'
    });
  }

  async processQueue() {
    const queueLength = await this.redis.llen('gbp:failed_posts');

    for (let i = 0; i < queueLength; i++) {
      const item = await this.redis.lindex('gbp:failed_posts', i);
      const failedPost = JSON.parse(item);

      // Retry with exponential backoff
      const result = await this.retryPost(failedPost);

      if (result.success) {
        await this.redis.lrem('gbp:failed_posts', 1, item);
      } else {
        failedPost.retryCount++;
        if (failedPost.retryCount >= failedPost.maxRetries) {
          // Move to permanent failure log
          await this.redis.lpush('gbp:permanent_failures', item);
          await this.redis.lrem('gbp:failed_posts', 1, item);
        }
      }
    }
  }
}
```

## Performance Tracking & Analytics

### Post Engagement Metrics
```javascript
async trackPostPerformance(locationId, postId) {
  const mybusiness = google.mybusinessbusinessinformation('v1');

  // Get post insights
  const insights = await mybusiness.locations.localPosts.getInsights({
    name: `locations/${locationId}/localPosts/${postId}`
  });

  return {
    postId,
    metrics: {
      views: insights.viewsSearch + insights.viewsMaps,
      viewsSearch: insights.viewsSearch,
      viewsMaps: insights.viewsMaps,
      actions: {
        calls: insights.actionsPhone,
        directions: insights.actionsDirections,
        website: insights.actionsWebsite,
        bookings: insights.actionsBooking
      },
      engagement: {
        clicks: insights.clicks,
        ctr: (insights.clicks / (insights.viewsSearch + insights.viewsMaps)) * 100,
        actionsPerView: insights.totalActions / (insights.viewsSearch + insights.viewsMaps)
      }
    },
    comparison: {
      avgViewsForType: await this.getAvgViews(locationId, postType),
      performance: insights.views > avgViewsForType ? 'above_average' : 'below_average',
      percentile: await this.calculatePercentile(locationId, insights.views)
    }
  };
}
```

### A/B Testing Support
```javascript
async runABTest(locationId, variantA, variantB) {
  // Post variant A
  const postA = await this.publishPost({
    ...variantA,
    metadata: { variant: 'A', testId: Date.now() }
  });

  // Wait 3 days
  await this.sleep(3 * 24 * 60 * 60 * 1000);

  // Post variant B
  const postB = await this.publishPost({
    ...variantB,
    metadata: { variant: 'B', testId: postA.metadata.testId }
  });

  // Wait 7 days for data collection
  await this.sleep(7 * 24 * 60 * 60 * 1000);

  // Compare performance
  const resultsA = await this.trackPostPerformance(locationId, postA.postId);
  const resultsB = await this.trackPostPerformance(locationId, postB.postId);

  return {
    winner: resultsA.metrics.engagement.ctr > resultsB.metrics.engagement.ctr ? 'A' : 'B',
    improvementPercent: Math.abs(
      (resultsA.metrics.engagement.ctr - resultsB.metrics.engagement.ctr) /
      resultsB.metrics.engagement.ctr * 100
    ),
    recommendation: `Use ${winner.content} for future posts of this type`,
    variantA: resultsA,
    variantB: resultsB
  };
}
```

## Multi-Location Management

### Batch Posting to Multiple Locations
```javascript
async batchPostToLocations(locations, postData) {
  const results = [];

  // Process in parallel with concurrency limit
  const concurrencyLimit = 5;
  for (let i = 0; i < locations.length; i += concurrencyLimit) {
    const batch = locations.slice(i, i + concurrencyLimit);

    const batchResults = await Promise.allSettled(
      batch.map(location =>
        this.publishPost({
          ...postData,
          business: {
            locationId: location.locationId,
            businessName: location.businessName,
            timezone: location.timezone
          }
        })
      )
    );

    results.push(...batchResults);
  }

  return {
    totalLocations: locations.length,
    successfulPosts: results.filter(r => r.status === 'fulfilled').length,
    failedPosts: results.filter(r => r.status === 'rejected').length,
    results: results.map((r, idx) => ({
      location: locations[idx].businessName,
      status: r.status,
      postId: r.status === 'fulfilled' ? r.value.postId : null,
      error: r.status === 'rejected' ? r.reason.message : null
    }))
  };
}
```

## Integration with ORCHESTRAI Ecosystem

### Agent Collaboration
```javascript
// Generate content → Transform → Schedule → Post
async fullAutomationWorkflow(businessId) {
  // Step 1: Generate original content
  const content = await Task({
    subagent_type: "content-writer-specialist",
    prompt: `Create GBP What's New post for business ${businessId}`
  });

  // Step 2: Transform and validate
  const transformed = await Task({
    subagent_type: "gbp-content-transformer",
    prompt: `Transform and validate: ${content}`
  });

  // Step 3: Determine optimal timing
  const optimal = this.calculateOptimalPostingTime(businessId);

  // Step 4: Schedule post
  const scheduled = await this.schedulePost({
    businessId,
    post: transformed,
    scheduledDate: optimal.recommendedDate,
    scheduledTime: optimal.recommendedTime
  });

  return {
    contentGenerated: content,
    scheduled: scheduled,
    optimalTiming: optimal
  };
}
```

### Crystalline Memory Storage
```javascript
// Store posting history for learning
this.memory.addObservation(businessEntity, {
  type: "gbp_post_published",
  postType: postData.postType,
  publishedAt: Date.now(),
  scheduledTime: postData.scheduling.scheduledTime,
  engagement: performanceMetrics,
  content: postData.post.content,
  characterCount: postData.post.content.length
});

// Learn from high-performing posts
if (performanceMetrics.engagement.ctr > 5) {
  this.memory.createRelation({
    from: `GBP_Post_${postId}`,
    to: `High_Performing_Pattern`,
    relationType: "example_of"
  });
}
```

## Security & Authentication

### OAuth 2.0 Token Storage
```javascript
// Securely store refresh tokens
await this.redis.setex(
  `gbp:refresh_token:${businessId}`,
  365 * 24 * 60 * 60,  // 1 year
  encryptedRefreshToken
);

// Auto-refresh access tokens
const accessToken = await this.getAccessToken(businessId);
if (this.isExpired(accessToken)) {
  const newToken = await this.refreshAccessToken(businessId);
  await this.storeAccessToken(businessId, newToken);
}
```

### API Credentials Management
```javascript
// Environment-based credentials
const credentials = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
};

// Never log or expose credentials
this.sanitizeLogsFor(['clientSecret', 'refreshToken', 'accessToken']);
```

## Example Usage

```javascript
Task(
  subagent_type="gbp-auto-poster",
  prompt=`Schedule GBP post for Amsterdam Dental Clinic:

    Post Type: What's New
    Content: "New painless dental implant technology now available at Amsterdam Dental Clinic! Our advanced implant system reduces healing time by 40% and eliminates traditional surgery discomfort. Perfect for busy professionals in Zuid who need quick recovery. Free consultation this month—call 020-1234567 to schedule your smile transformation!"

    Images:
    - /projects/uuid/assets/images/implant-technology.jpg
    - /projects/uuid/assets/images/clinic-exterior.jpg

    CTA: Call +31201234567

    Scheduling:
    - Use optimal timing intelligence
    - Preferred window: Morning hours (9-11 AM)
    - Avoid weekends

    Authentication:
    - Location ID: accounts/123/locations/456
    - Use stored OAuth credentials for Amsterdam Dental Clinic

    After posting:
    - Track engagement for 7 days
    - Report performance metrics
    - Recommend next post timing`
)
```

## Success Indicators

### Posting Reliability
- Post success rate: ≥98% (including retries)
- Average API response time: <2s
- Failed post recovery rate: ≥95%
- Scheduling accuracy: 100% (posts at exact scheduled time)

### Performance Optimization
- Optimal timing accuracy: ±1 hour of peak engagement
- Multi-location batch success: ≥95% across all locations
- A/B test completion rate: 100%
- Performance tracking coverage: 100% of posts

### Business Impact
- Post engagement increase: +35% vs manual posting
- Customer actions per post: 15-25 average
- Cost per action: $2-4 (highly efficient)
- Time savings: 90% vs manual posting workflow

## Related Documentation
- **orchestrai-domains/local-seo/CLAUDE.md** - Local SEO domain overview
- **.claude/agents/gbp-content-transformer.md** - Content transformation for GBP
- **.claude/agents/seo-local-seo.md** - GBP optimization strategies
- **Google My Business API Docs** - https://developers.google.com/my-business/reference/rest

---

**This agent eliminates manual GBP posting workflows and enables 24/7 automated local SEO content distribution with intelligent scheduling and performance optimization.**
