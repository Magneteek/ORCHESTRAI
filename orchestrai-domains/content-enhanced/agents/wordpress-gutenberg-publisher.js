const axios = require('axios');

/**
 * WordPress Gutenberg Publisher Agent
 * Converts ORCHESTRAI content into Gutenberg blocks and publishes to WordPress
 */
class WordPressGutenbergPublisher {
  constructor(orchestrator, crystallineMemory) {
    this.name = 'WordPress Gutenberg Publisher';
    this.description = 'Converts content to Gutenberg blocks and publishes to WordPress';
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    this.capabilities = [
      'gutenberg-block-generation',
      'wordpress-rest-api',
      'content-formatting',
      'image-optimization',
      'seo-meta-injection',
      'custom-block-creation'
    ];
    this.status = 'active';
    this.metrics = {
      postsPublished: 0,
      blocksGenerated: 0,
      successRate: 0,
      lastPublish: null
    };
  }

  /**
   * Main content publishing method
   */
  async publishContent(contentData, wordpressConfig, options = {}) {
    try {
      console.log('🔤 WordPress Gutenberg Publisher: Converting content to blocks...');
      
      // Validate WordPress configuration
      if (!this.validateWordPressConfig(wordpressConfig)) {
        throw new Error('Invalid WordPress configuration');
      }

      // Convert content to Gutenberg blocks
      const gutenbergBlocks = await this.convertToGutenbergBlocks(contentData, options);
      
      // Generate WordPress post data
      const postData = await this.generateWordPressPost(contentData, gutenbergBlocks, options);
      
      // Publish to WordPress
      const publishResult = await this.publishToWordPress(postData, wordpressConfig);
      
      // Store publishing data in crystalline memory
      await this.storePublishingRecord(contentData, publishResult, wordpressConfig);
      
      // Update metrics
      this.updateMetrics(publishResult.success);
      
      console.log(`✅ WordPress content published: ${publishResult.url}`);
      
      return {
        success: true,
        postId: publishResult.id,
        url: publishResult.url,
        blocksGenerated: gutenbergBlocks.length,
        publishedAt: new Date().toISOString(),
        gutenbergContent: gutenbergBlocks
      };

    } catch (error) {
      console.error('❌ WordPress publishing error:', error);
      this.updateMetrics(false);
      
      return {
        success: false,
        error: error.message,
        details: error.details || 'Publishing failed'
      };
    }
  }

  /**
   * Convert ORCHESTRAI content to Gutenberg blocks
   */
  async convertToGutenbergBlocks(contentData, options = {}) {
    const blocks = [];
    
    try {
      // Add title block
      if (contentData.title) {
        blocks.push(this.createHeadingBlock(contentData.title, 1));
      }

      // Add featured image block
      if (contentData.featuredImage) {
        blocks.push(this.createImageBlock(contentData.featuredImage));
      }

      // Add introduction/excerpt
      if (contentData.excerpt || contentData.introduction) {
        blocks.push(this.createParagraphBlock(contentData.excerpt || contentData.introduction, {
          className: 'introduction-paragraph',
          style: { fontSize: '1.1em', fontWeight: '500' }
        }));
      }

      // Process main content sections
      if (contentData.sections && Array.isArray(contentData.sections)) {
        for (const section of contentData.sections) {
          blocks.push(...await this.processSectionToBlocks(section, options));
        }
      }

      // Process flat content (if no sections)
      if (contentData.content && !contentData.sections) {
        blocks.push(...await this.processContentToBlocks(contentData.content, options));
      }

      // Add SEO-optimized elements
      if (contentData.seoData) {
        blocks.push(...this.createSEOBlocks(contentData.seoData));
      }

      // Add call-to-action blocks
      if (contentData.callToAction) {
        blocks.push(this.createCTABlock(contentData.callToAction));
      }

      // Add custom blocks for specific content types
      if (options.contentType) {
        blocks.push(...await this.createCustomBlocks(contentData, options.contentType));
      }

      console.log(`🔤 Generated ${blocks.length} Gutenberg blocks`);
      this.metrics.blocksGenerated += blocks.length;
      
      return blocks;

    } catch (error) {
      console.error('Error converting to Gutenberg blocks:', error);
      throw error;
    }
  }

  /**
   * Process content section into blocks
   */
  async processSectionToBlocks(section, options) {
    const blocks = [];

    // Section heading
    if (section.title || section.heading) {
      const level = section.level || 2;
      blocks.push(this.createHeadingBlock(section.title || section.heading, level));
    }

    // Section content
    if (section.content) {
      if (typeof section.content === 'string') {
        blocks.push(...this.parseTextToBlocks(section.content));
      } else if (Array.isArray(section.content)) {
        for (const item of section.content) {
          blocks.push(...await this.processContentItem(item, options));
        }
      }
    }

    // Section image
    if (section.image) {
      blocks.push(this.createImageBlock(section.image));
    }

    // Section list items
    if (section.items || section.list) {
      blocks.push(this.createListBlock(section.items || section.list, section.listType || 'unordered'));
    }

    // Section quote
    if (section.quote) {
      blocks.push(this.createQuoteBlock(section.quote, section.author));
    }

    return blocks;
  }

  /**
   * Create specific Gutenberg blocks
   */
  createHeadingBlock(content, level = 2) {
    return {
      blockName: 'core/heading',
      attrs: {
        level: level,
        className: `orchestrai-heading-${level}`
      },
      innerBlocks: [],
      innerHTML: `<h${level} class="orchestrai-heading-${level}">${this.escapeHtml(content)}</h${level}>`
    };
  }

  createParagraphBlock(content, options = {}) {
    const className = options.className || 'orchestrai-paragraph';
    const style = options.style ? ` style="${this.objectToStyleString(options.style)}"` : '';
    
    return {
      blockName: 'core/paragraph',
      attrs: {
        className: className
      },
      innerBlocks: [],
      innerHTML: `<p class="${className}"${style}>${this.escapeHtml(content)}</p>`
    };
  }

  createImageBlock(imageData) {
    const { url, alt, caption, width, height } = typeof imageData === 'string' 
      ? { url: imageData, alt: '', caption: '', width: null, height: null }
      : imageData;

    return {
      blockName: 'core/image',
      attrs: {
        url: url,
        alt: alt || '',
        caption: caption || '',
        width: width,
        height: height,
        className: 'orchestrai-image'
      },
      innerBlocks: [],
      innerHTML: `<figure class="wp-block-image orchestrai-image">
        <img src="${url}" alt="${this.escapeHtml(alt || '')}" ${width ? `width="${width}"` : ''} ${height ? `height="${height}"` : ''}/>
        ${caption ? `<figcaption>${this.escapeHtml(caption)}</figcaption>` : ''}
      </figure>`
    };
  }

  createListBlock(items, type = 'unordered') {
    const tag = type === 'ordered' ? 'ol' : 'ul';
    const className = `orchestrai-list orchestrai-list-${type}`;
    
    const listItems = Array.isArray(items) 
      ? items.map(item => `<li>${this.escapeHtml(typeof item === 'string' ? item : item.content || item.text)}</li>`).join('')
      : items;

    return {
      blockName: `core/${type === 'ordered' ? 'list' : 'list'}`,
      attrs: {
        ordered: type === 'ordered',
        className: className
      },
      innerBlocks: [],
      innerHTML: `<${tag} class="${className}">${listItems}</${tag}>`
    };
  }

  createQuoteBlock(quote, author = null) {
    return {
      blockName: 'core/quote',
      attrs: {
        className: 'orchestrai-quote'
      },
      innerBlocks: [],
      innerHTML: `<blockquote class="wp-block-quote orchestrai-quote">
        <p>${this.escapeHtml(quote)}</p>
        ${author ? `<cite>${this.escapeHtml(author)}</cite>` : ''}
      </blockquote>`
    };
  }

  createCTABlock(ctaData) {
    const { text, url, style, className } = ctaData;
    const buttonClass = `wp-block-button orchestrai-cta ${className || ''}`;
    const buttonStyle = style === 'outline' ? 'is-style-outline' : '';
    
    return {
      blockName: 'core/button',
      attrs: {
        url: url,
        text: text,
        className: buttonClass
      },
      innerBlocks: [],
      innerHTML: `<div class="${buttonClass} ${buttonStyle}">
        <a class="wp-block-button__link" href="${url}">${this.escapeHtml(text)}</a>
      </div>`
    };
  }

  createCodeBlock(code, language = '') {
    return {
      blockName: 'core/code',
      attrs: {
        className: 'orchestrai-code',
        language: language
      },
      innerBlocks: [],
      innerHTML: `<pre class="wp-block-code orchestrai-code"><code class="language-${language}">${this.escapeHtml(code)}</code></pre>`
    };
  }

  createTableBlock(tableData) {
    const { headers, rows } = tableData;
    
    let tableHTML = '<table class="orchestrai-table">';
    
    if (headers && headers.length > 0) {
      tableHTML += '<thead><tr>';
      headers.forEach(header => {
        tableHTML += `<th>${this.escapeHtml(header)}</th>`;
      });
      tableHTML += '</tr></thead>';
    }
    
    if (rows && rows.length > 0) {
      tableHTML += '<tbody>';
      rows.forEach(row => {
        tableHTML += '<tr>';
        row.forEach(cell => {
          tableHTML += `<td>${this.escapeHtml(cell)}</td>`;
        });
        tableHTML += '</tr>';
      });
      tableHTML += '</tbody>';
    }
    
    tableHTML += '</table>';

    return {
      blockName: 'core/table',
      attrs: {
        className: 'orchestrai-table'
      },
      innerBlocks: [],
      innerHTML: tableHTML
    };
  }

  /**
   * Create SEO-optimized blocks
   */
  createSEOBlocks(seoData) {
    const blocks = [];
    
    // Schema markup block (custom HTML)
    if (seoData.schema) {
      blocks.push({
        blockName: 'core/html',
        attrs: {
          className: 'orchestrai-schema'
        },
        innerBlocks: [],
        innerHTML: `<script type="application/ld+json">${JSON.stringify(seoData.schema, null, 2)}</script>`
      });
    }

    // FAQ blocks
    if (seoData.faqs && seoData.faqs.length > 0) {
      seoData.faqs.forEach(faq => {
        blocks.push(this.createHeadingBlock(faq.question, 3));
        blocks.push(this.createParagraphBlock(faq.answer));
      });
    }

    return blocks;
  }

  /**
   * Generate complete WordPress post data
   */
  async generateWordPressPost(contentData, gutenbergBlocks, options = {}) {
    // Convert blocks to WordPress format
    const content = gutenbergBlocks.map(block => {
      return `<!-- wp:${block.blockName} ${JSON.stringify(block.attrs)} -->
${block.innerHTML}
<!-- /wp:${block.blockName} -->`;
    }).join('\n\n');

    const postData = {
      title: contentData.title || 'Untitled Post',
      content: content,
      status: options.status || 'draft',
      type: options.postType || 'post',
      excerpt: contentData.excerpt || '',
      meta: {
        _yoast_wpseo_title: contentData.seoTitle || contentData.title,
        _yoast_wpseo_metadesc: contentData.metaDescription || contentData.excerpt,
        _yoast_wpseo_focuskw: contentData.focusKeyword || '',
        orchestrai_generated: true,
        orchestrai_version: '1.0.0',
        orchestrai_blocks_count: gutenbergBlocks.length
      }
    };

    // Add categories
    if (contentData.categories && contentData.categories.length > 0) {
      postData.categories = contentData.categories;
    }

    // Add tags
    if (contentData.tags && contentData.tags.length > 0) {
      postData.tags = contentData.tags;
    }

    // Add featured image
    if (contentData.featuredImageId) {
      postData.featured_media = contentData.featuredImageId;
    }

    // Add custom fields
    if (contentData.customFields) {
      postData.meta = { ...postData.meta, ...contentData.customFields };
    }

    return postData;
  }

  /**
   * Publish to WordPress via REST API
   */
  async publishToWordPress(postData, wordpressConfig) {
    try {
      const { siteUrl, username, applicationPassword } = wordpressConfig;
      
      const response = await axios.post(
        `${siteUrl}/wp-json/wp/v2/posts`,
        postData,
        {
          auth: {
            username: username,
            password: applicationPassword
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        id: response.data.id,
        url: response.data.link,
        status: response.data.status,
        data: response.data
      };

    } catch (error) {
      throw new Error(`WordPress API error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Parse text content into blocks
   */
  parseTextToBlocks(text) {
    const blocks = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        // Heading
        const level = (line.match(/^#+/) || [''])[0].length;
        const content = line.replace(/^#+\s*/, '');
        blocks.push(this.createHeadingBlock(content, Math.min(level, 6)));
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // List item - collect consecutive items
        const listItems = [line.substring(2)];
        blocks.push(this.createListBlock(listItems));
      } else if (line.trim().length > 0) {
        // Regular paragraph
        blocks.push(this.createParagraphBlock(line));
      }
    }
    
    return blocks;
  }

  /**
   * Utility methods
   */
  validateWordPressConfig(config) {
    return config && 
           config.siteUrl && 
           config.username && 
           config.applicationPassword &&
           config.siteUrl.startsWith('http');
  }

  escapeHtml(text) {
    if (!text) return '';
    return text.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  objectToStyleString(styleObj) {
    return Object.entries(styleObj)
      .map(([key, value]) => `${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${value}`)
      .join('; ');
  }

  updateMetrics(success) {
    if (success) {
      this.metrics.postsPublished++;
      this.metrics.lastPublish = new Date().toISOString();
    }
    
    // Calculate success rate
    const totalAttempts = this.metrics.postsPublished + (this.metrics.failures || 0);
    if (!success) {
      this.metrics.failures = (this.metrics.failures || 0) + 1;
    }
    
    this.metrics.successRate = totalAttempts > 0 ? (this.metrics.postsPublished / totalAttempts) * 100 : 0;
  }

  async storePublishingRecord(contentData, publishResult, wordpressConfig) {
    if (this.crystallineMemory) {
      const record = {
        contentTitle: contentData.title,
        wordpressSite: wordpressConfig.siteUrl,
        publishResult: publishResult,
        timestamp: new Date().toISOString(),
        agent: this.name
      };

      await this.crystallineMemory.storeMemory(
        'wordpress-publishing',
        `Published "${contentData.title}" to WordPress`,
        { 
          type: 'publishing_record',
          ...record,
          importance: 0.8 
        }
      );
    }
  }

  getStatus() {
    return {
      name: this.name,
      status: this.status,
      capabilities: this.capabilities,
      metrics: this.metrics
    };
  }
}

module.exports = WordPressGutenbergPublisher;