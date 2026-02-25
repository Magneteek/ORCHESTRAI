/**
 * Trigger Engine - Core event processing and routing
 *
 * Handles:
 * - Event registration and validation
 * - Trigger condition evaluation
 * - Agent invocation routing
 * - Error handling and retries
 */

const EventEmitter = require('events');
const path = require('path');

class TriggerEngine extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 5000,
      ...options
    };

    // Registered triggers
    this.triggers = new Map();

    // Active handlers
    this.handlers = new Map();

    // Queue manager (injected)
    this.queueManager = options.queueManager || null;

    // Session manager (injected)
    this.sessionManager = options.sessionManager || null;

    // Statistics
    this.stats = {
      eventsProcessed: 0,
      triggersActivated: 0,
      agentsInvoked: 0,
      errors: 0,
      startTime: Date.now()
    };
  }

  /**
   * Register a trigger
   */
  registerTrigger(trigger) {
    // Validate trigger
    if (!trigger.id) {
      throw new Error('Trigger must have an id');
    }

    if (!trigger.type) {
      throw new Error('Trigger must have a type (github, slack, cron, webhook, filesystem)');
    }

    if (!trigger.agent) {
      throw new Error('Trigger must specify an agent to invoke');
    }

    // Normalize trigger
    const normalized = {
      id: trigger.id,
      name: trigger.name || trigger.id,
      type: trigger.type,
      enabled: trigger.enabled !== false,

      // Event matching
      event: trigger.event,
      pattern: trigger.pattern,
      condition: trigger.condition,

      // Agent invocation
      agent: trigger.agent,
      parameters: trigger.parameters || {},
      parameterExtraction: trigger.parameterExtraction || {},

      // Execution options
      priority: trigger.priority || 'normal',
      timeout: trigger.timeout || 600000, // 10 minutes
      retries: trigger.retries !== undefined ? trigger.retries : this.config.maxRetries,

      // Filtering
      filters: trigger.filters || {},

      // Metadata
      description: trigger.description || '',
      tags: trigger.tags || [],
      createdAt: trigger.createdAt || new Date().toISOString()
    };

    this.triggers.set(trigger.id, normalized);
    this.emit('trigger:registered', normalized);

    return normalized;
  }

  /**
   * Unregister a trigger
   */
  unregisterTrigger(triggerId) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) {
      throw new Error(`Trigger not found: ${triggerId}`);
    }

    this.triggers.delete(triggerId);
    this.emit('trigger:unregistered', trigger);

    return trigger;
  }

  /**
   * Enable/disable trigger
   */
  setTriggerEnabled(triggerId, enabled) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) {
      throw new Error(`Trigger not found: ${triggerId}`);
    }

    trigger.enabled = enabled;
    this.emit(enabled ? 'trigger:enabled' : 'trigger:disabled', trigger);

    return trigger;
  }

  /**
   * Register an event handler
   */
  registerHandler(type, handler) {
    if (!handler.handleEvent || typeof handler.handleEvent !== 'function') {
      throw new Error('Handler must implement handleEvent method');
    }

    this.handlers.set(type, handler);
    this.emit('handler:registered', { type, handler });

    return handler;
  }

  /**
   * Process an incoming event
   */
  async processEvent(event) {
    this.stats.eventsProcessed++;

    try {
      // Find matching triggers
      const matchingTriggers = this.findMatchingTriggers(event);

      if (matchingTriggers.length === 0) {
        this.emit('event:no_match', event);
        return { processed: false, reason: 'no_matching_triggers' };
      }

      // Process each matching trigger
      const results = [];
      for (const trigger of matchingTriggers) {
        try {
          const result = await this.processTrigger(trigger, event);
          results.push(result);
        } catch (error) {
          this.stats.errors++;
          this.emit('trigger:error', { trigger, event, error });
          results.push({
            triggerId: trigger.id,
            success: false,
            error: error.message
          });
        }
      }

      return {
        processed: true,
        event,
        results
      };

    } catch (error) {
      this.stats.errors++;
      this.emit('event:error', { event, error });
      throw error;
    }
  }

  /**
   * Find triggers matching an event
   */
  findMatchingTriggers(event) {
    const matching = [];

    for (const [id, trigger] of this.triggers) {
      if (!trigger.enabled) {
        continue;
      }

      // Type must match
      if (trigger.type !== event.type) {
        continue;
      }

      // Check event pattern (e.g., "github.pull_request.opened")
      if (trigger.event && !this.matchPattern(trigger.event, event.event)) {
        continue;
      }

      // Check regex pattern
      if (trigger.pattern && !this.matchRegex(trigger.pattern, event)) {
        continue;
      }

      // Check condition (JavaScript expression)
      if (trigger.condition && !this.evaluateCondition(trigger.condition, event)) {
        continue;
      }

      // Check filters
      if (trigger.filters && !this.matchFilters(trigger.filters, event)) {
        continue;
      }

      matching.push(trigger);
    }

    return matching;
  }

  /**
   * Match event pattern (dot notation with wildcards)
   */
  matchPattern(pattern, eventString) {
    if (pattern === '*') return true;

    const patternParts = pattern.split('.');
    const eventParts = eventString.split('.');

    if (patternParts.length !== eventParts.length) {
      return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] !== '*' && patternParts[i] !== eventParts[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Match regex pattern
   */
  matchRegex(pattern, event) {
    const regex = new RegExp(pattern);
    const testString = JSON.stringify(event);
    return regex.test(testString);
  }

  /**
   * Evaluate condition (simple JavaScript expression)
   */
  evaluateCondition(condition, event) {
    try {
      // Create safe evaluation context
      const context = {
        event,
        data: event.data || {},
        metadata: event.metadata || {}
      };

      // Simple condition evaluation (safer than eval)
      const func = new Function('event', 'data', 'metadata', `return ${condition}`);
      return func(context.event, context.data, context.metadata);

    } catch (error) {
      console.error(`Condition evaluation error: ${error.message}`);
      return false;
    }
  }

  /**
   * Match filters
   */
  matchFilters(filters, event) {
    for (const [key, value] of Object.entries(filters)) {
      const eventValue = this.getNestedProperty(event, key);

      if (Array.isArray(value)) {
        if (!value.includes(eventValue)) {
          return false;
        }
      } else if (eventValue !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get nested property (e.g., "data.repository.name")
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Process a matched trigger
   */
  async processTrigger(trigger, event) {
    this.stats.triggersActivated++;
    this.emit('trigger:activated', { trigger, event });

    try {
      // Extract parameters from event
      const parameters = this.extractParameters(trigger, event);

      // Build agent invocation
      const invocation = {
        agent: trigger.agent,
        prompt: this.buildPrompt(trigger, event, parameters),
        parameters: {
          ...trigger.parameters,
          ...parameters
        },
        metadata: {
          triggerId: trigger.id,
          triggerType: trigger.type,
          eventType: event.type,
          event: event.event,
          timestamp: new Date().toISOString()
        },
        priority: trigger.priority,
        timeout: trigger.timeout
      };

      // Queue for execution
      if (this.queueManager) {
        const jobId = await this.queueManager.enqueue(invocation);

        return {
          triggerId: trigger.id,
          success: true,
          jobId,
          queued: true
        };
      } else {
        // Execute immediately
        const result = await this.invokeAgent(invocation);

        return {
          triggerId: trigger.id,
          success: true,
          result
        };
      }

    } catch (error) {
      throw new Error(`Trigger processing failed: ${error.message}`);
    }
  }

  /**
   * Extract parameters from event
   */
  extractParameters(trigger, event) {
    const params = {};

    if (!trigger.parameterExtraction) {
      return params;
    }

    for (const [paramName, path] of Object.entries(trigger.parameterExtraction)) {
      params[paramName] = this.getNestedProperty(event, path);
    }

    return params;
  }

  /**
   * Build agent prompt from trigger and event
   */
  buildPrompt(trigger, event, parameters) {
    if (trigger.promptTemplate) {
      return this.renderTemplate(trigger.promptTemplate, { event, parameters });
    }

    // Default prompt
    return `Event triggered: ${event.event}\n\n` +
           `Parameters: ${JSON.stringify(parameters, null, 2)}\n\n` +
           `Please process this event according to your instructions.`;
  }

  /**
   * Render template with variables
   */
  renderTemplate(template, context) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      return this.getNestedProperty(context, path.trim()) || match;
    });
  }

  /**
   * Invoke agent
   */
  async invokeAgent(invocation) {
    this.stats.agentsInvoked++;

    // Use Task tool via session manager if available
    if (this.sessionManager) {
      const session = await this.sessionManager.startSession({
        agentType: invocation.agent,
        prompt: invocation.prompt,
        parameters: invocation.parameters,
        projectContext: invocation.metadata,
        invokedBy: 'trigger-system',
        tags: ['triggered', invocation.metadata.triggerType]
      });

      return { sessionId: session.sessionId };
    }

    // Fallback: return invocation for manual processing
    return invocation;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.startTime,
      triggersRegistered: this.triggers.size,
      handlersRegistered: this.handlers.size
    };
  }

  /**
   * Get all triggers
   */
  getTriggers(filter = {}) {
    const triggers = Array.from(this.triggers.values());

    if (filter.type) {
      return triggers.filter(t => t.type === filter.type);
    }

    if (filter.agent) {
      return triggers.filter(t => t.agent === filter.agent);
    }

    if (filter.enabled !== undefined) {
      return triggers.filter(t => t.enabled === filter.enabled);
    }

    return triggers;
  }
}

module.exports = TriggerEngine;
