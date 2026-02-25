/**
 * GBP Post Generation Pipeline
 * Orchestrates ORCHESTRAI agents to generate GBP posts
 */

const path = require('path');
const GBPDatabaseManager = require('../database/db-manager');

class GBPPostGenerator {
  constructor(dbManager = null) {
    this.db = dbManager || new GBPDatabaseManager();
  }

  /**
   * Generate GBP posts from existing content (blog posts, landing pages)
   *
   * @param {Object} options
   * @param {string} options.sourceContentPath - Path to source content file
   * @param {string} options.business - Business name
   * @param {string} options.businessId - Business ID (UUID)
   * @param {string} options.language - Target language (en, nl, sl, de, es)
   * @param {Array<string>} options.postTypes - Post types to generate ['whats_new', 'offer', 'product']
   * @param {string} options.campaignId - Optional campaign ID to link posts
   */
  async generateFromContent(options) {
    console.log('📝 Starting GBP post generation from content...');
    console.log(`   Source: ${options.sourceContentPath}`);
    console.log(`   Business: ${options.business}`);
    console.log(`   Language: ${options.language}`);
    console.log(`   Post Types: ${options.postTypes.join(', ')}`);

    try {
      // Initialize database if needed
      if (!this.db.db) {
        await this.db.initialize();
      }

      // Step 1: Read source content
      console.log('\n🔍 Step 1: Reading source content...');
      const fs = require('fs');
      const sourceContent = fs.readFileSync(options.sourceContentPath, 'utf8');

      // Step 2: Call gbp-content-transformer agent
      console.log('🤖 Step 2: Invoking gbp-content-transformer agent...');

      const agentPrompt = `
Transform this blog content into GBP posts:

**Source Content:**
File: ${options.sourceContentPath}
Language: ${options.language}
Business: ${options.business}

**Content:**
${sourceContent}

**Requirements:**
- Generate ${options.postTypes.length} posts (types: ${options.postTypes.join(', ')})
- Language: ${options.language} (100% purity)
- Character limits: 100-1500 per post
- AI detection: <30% risk
- Mobile-optimized formatting
- Include local keywords naturally
- Clear CTA in each post

**Output Format:**
Return JSON array with this structure for each post:
{
  "postType": "whats_new" | "event" | "offer" | "product",
  "title": "Post title",
  "content": "Post content (100-1500 chars)",
  "characterCount": 400,
  "language": "${options.language}",
  "qualityMetrics": {
    "aiDetectionRisk": 18,
    "characterLimitCompliance": true,
    "readingLevel": "Grade 7"
  },
  "cta": {
    "type": "learn_more",
    "url": "",
    "phone": ""
  }
}
`;

      // PLACEHOLDER: In real implementation, this would call:
      // const result = await Task(subagent_type="gbp-content-transformer", prompt=agentPrompt)
      //
      // For now, we'll simulate the agent response with a mock
      const agentResult = await this._simulateAgentResponse(options);

      console.log(`✅ Agent generated ${agentResult.posts.length} posts`);

      // Step 3: Validate quality gates
      console.log('\n✅ Step 3: Validating quality gates...');
      const validatedPosts = this._validateQualityGates(agentResult.posts);

      console.log(`   ✓ ${validatedPosts.filter(p => p.quality_gate_passed).length}/${validatedPosts.length} posts passed quality gates`);

      // Step 4: Store in database
      console.log('\n💾 Step 4: Storing posts in database...');
      const storedPosts = [];

      for (const post of validatedPosts) {
        const postData = {
          title: post.title,
          content: post.content,
          post_type: post.postType,
          language: options.language,
          topic: post.topic || null,
          category: post.category || 'Educational',
          tags: post.tags || [],
          character_count: post.characterCount,
          ai_detection_risk: post.qualityMetrics?.aiDetectionRisk || null,
          quality_gate_passed: post.quality_gate_passed,
          status: post.quality_gate_passed ? 'draft' : 'failed',
          cta_type: post.cta?.type || null,
          cta_url: post.cta?.url || null,
          cta_phone: post.cta?.phone || null,
          campaign_id: options.campaignId || null,
          created_by: 'gbp-content-transformer'
        };

        // Handle event/offer specific fields
        if (post.postType === 'event') {
          postData.event_title = post.eventDetails?.title || post.title;
          postData.event_start_date = post.eventDetails?.startDate || null;
          postData.event_end_date = post.eventDetails?.endDate || null;
        } else if (post.postType === 'offer') {
          postData.offer_title = post.offerDetails?.title || post.title;
          postData.offer_start_date = post.offerDetails?.startDate || null;
          postData.offer_end_date = post.offerDetails?.endDate || null;
          postData.coupon_code = post.offerDetails?.couponCode || null;
          postData.terms_conditions = post.offerDetails?.terms || null;
        }

        const stored = await this.db.createPost(postData);
        storedPosts.push({ ...postData, id: stored.id, post_id: stored.post_id });

        console.log(`   ✓ Stored: ${post.title} (ID: ${stored.post_id})`);
      }

      console.log(`\n🎉 Successfully generated and stored ${storedPosts.length} posts!`);

      return {
        success: true,
        posts_generated: storedPosts.length,
        posts_passed_quality: storedPosts.filter(p => p.quality_gate_passed).length,
        posts: storedPosts,
        campaign_id: options.campaignId
      };

    } catch (error) {
      console.error('❌ Error generating posts:', error.message);
      throw error;
    }
  }

  /**
   * Generate GBP posts from scratch (prompts, topics)
   *
   * @param {Object} options
   * @param {string} options.business - Business name
   * @param {string} options.businessId - Business ID
   * @param {Array<Object>} options.topics - Array of topics: [{topic, description, postType}]
   * @param {string} options.language - Target language
   * @param {string} options.audience - Target audience description
   * @param {string} options.tone - Tone (professional, casual, educational)
   */
  async generateFromTopics(options) {
    console.log('🎯 Starting GBP post generation from topics...');
    console.log(`   Business: ${options.business}`);
    console.log(`   Topics: ${options.topics.length}`);
    console.log(`   Language: ${options.language}`);

    try {
      if (!this.db.db) {
        await this.db.initialize();
      }

      const agentPrompt = `
Create original GBP posts for ${options.business}:

**Topics:**
${options.topics.map((t, i) => `${i + 1}. ${t.topic} (${t.postType}) - ${t.description}`).join('\n')}

**Requirements:**
- Target audience: ${options.audience}
- Tone: ${options.tone}
- Language: ${options.language} (100% purity)
- Character limits: 100-1500 per post
- AI detection: <30% risk
- Educational value: High
- Clear CTAs
- Mobile-optimized

Generate ${options.topics.length} posts matching the topics above.
`;

      // PLACEHOLDER: Would call gbp-content-transformer agent
      const agentResult = await this._simulateAgentResponse(options);

      const validatedPosts = this._validateQualityGates(agentResult.posts);

      const storedPosts = [];
      for (const post of validatedPosts) {
        const postData = {
          title: post.title,
          content: post.content,
          post_type: post.postType,
          language: options.language,
          topic: post.topic || null,
          category: post.category || 'Educational',
          character_count: post.characterCount,
          ai_detection_risk: post.qualityMetrics?.aiDetectionRisk || null,
          quality_gate_passed: post.quality_gate_passed,
          status: post.quality_gate_passed ? 'draft' : 'failed',
          cta_type: post.cta?.type || null,
          created_by: 'gbp-content-transformer'
        };

        const stored = await this.db.createPost(postData);
        storedPosts.push({ ...postData, id: stored.id, post_id: stored.post_id });
      }

      console.log(`\n🎉 Successfully generated ${storedPosts.length} posts from topics!`);

      return {
        success: true,
        posts_generated: storedPosts.length,
        posts_passed_quality: storedPosts.filter(p => p.quality_gate_passed).length,
        posts: storedPosts
      };

    } catch (error) {
      console.error('❌ Error generating posts:', error.message);
      throw error;
    }
  }

  /**
   * Validate quality gates for generated posts
   */
  _validateQualityGates(posts) {
    return posts.map(post => {
      const gates = {
        characterLimit: post.characterCount >= 100 && post.characterCount <= 1500,
        aiDetection: (post.qualityMetrics?.aiDetectionRisk || 100) < 30,
        hasContent: post.content && post.content.length > 0,
        hasTitle: post.title && post.title.length > 0
      };

      const passed = Object.values(gates).every(gate => gate === true);

      return {
        ...post,
        quality_gate_passed: passed,
        quality_gates: gates
      };
    });
  }

  /**
   * SIMULATION: Mock agent response (replace with real Task call)
   * This simulates what gbp-content-transformer agent would return
   */
  async _simulateAgentResponse(options) {
    // In production, this would be:
    // return await Task(subagent_type="gbp-content-transformer", prompt=agentPrompt);

    console.log('   [SIMULATION MODE] Mocking agent response...');

    return {
      posts: [
        {
          postType: 'whats_new',
          title: 'Nov pristop k implantaciji zob - brez bolečin',
          content: 'Naša nova tehnologija implantacije zob omogoča 40% hitrejše okrevanje in popolnoma brezbolečinski postopek. Idealno za zaposlene, ki potrebujejo hitro okrevanje.\n\nBrezplačna konzultacija ta mesec - pokličite 01 234 5678!',
          characterCount: 247,
          language: options.language,
          topic: 'Dental Implants',
          category: 'Educational',
          tags: ['implantati', 'zobozdravstvo', 'brezbolečinsko'],
          qualityMetrics: {
            aiDetectionRisk: 22,
            characterLimitCompliance: true,
            readingLevel: 'Grade 7',
            localSeoIntegration: true
          },
          cta: {
            type: 'learn_more',
            phone: '01 234 5678'
          }
        },
        {
          postType: 'offer',
          title: 'Posebna ponudba: Beljenje zob -30%',
          content: 'Profesionalno beljenje zob le 199€ (običajno 349€)! Hollywoodski beli zobje v samo 60 minutah z našo LED tehnologijo.\n\nVeljavno za rezervacije do 31. marca. Kličite 01 234 5678 in omenite kodo BELO2026.',
          characterCount: 245,
          language: options.language,
          topic: 'Teeth Whitening',
          category: 'Offer',
          tags: ['beljenje', 'akcija', 'popust'],
          qualityMetrics: {
            aiDetectionRisk: 18,
            characterLimitCompliance: true,
            readingLevel: 'Grade 6'
          },
          cta: {
            type: 'learn_more',
            phone: '01 234 5678'
          },
          offerDetails: {
            title: 'Beljenje zob -30%',
            startDate: '2026-02-17',
            endDate: '2026-03-31',
            couponCode: 'BELO2026',
            terms: 'Velja za nove paciente'
          }
        }
      ]
    };
  }
}

module.exports = GBPPostGenerator;
