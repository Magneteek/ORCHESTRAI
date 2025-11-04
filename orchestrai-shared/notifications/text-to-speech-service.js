const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

/**
 * Text-to-Speech Notification Service for ORCHESTRAI
 * 
 * Provides voice notifications for agent task events including:
 * - Agent task start/completion
 * - System status changes
 * - Error notifications
 * - Custom announcements
 */
class TextToSpeechService extends EventEmitter {
  constructor(orchestrator, options = {}) {
    super();
    
    this.orchestrator = orchestrator;
    this.isEnabled = options.enabled !== false;
    this.voice = options.voice || 'System Voice';
    this.speed = options.speed || 1.0;
    this.volume = options.volume || 0.8;
    this.language = options.language || 'en-US';
    
    // Configuration for different notification types
    this.notificationTypes = {
      agent_start: {
        enabled: true,
        template: "Agent {agentName} is starting {taskType}",
        priority: 'normal'
      },
      agent_complete: {
        enabled: true,
        template: "Agent {agentName} has completed {taskType}",
        priority: 'normal'
      },
      agent_error: {
        enabled: true,
        template: "Agent {agentName} encountered an error in {taskType}",
        priority: 'high'
      },
      system_status: {
        enabled: true,
        template: "System status: {status}",
        priority: 'low'
      },
      task_progress: {
        enabled: false, // Disabled by default to avoid spam
        template: "{progress} percent complete",
        priority: 'low'
      }
    };
    
    // Queue system for managing multiple notifications
    this.notificationQueue = [];
    this.isPlaying = false;
    this.lastNotification = null;
    this.rateLimitMs = 2000; // Minimum time between notifications
    
    // Statistics
    this.stats = {
      totalNotifications: 0,
      notificationsByType: {},
      lastNotificationTime: null,
      queuedNotifications: 0
    };
    
    console.log('🔊 Text-to-Speech Service initialized');
  }

  /**
   * Enable TTS notifications
   */
  enable() {
    this.isEnabled = true;
    console.log('🔊 TTS Notifications enabled');
    this.emit('serviceEnabled');
  }

  /**
   * Disable TTS notifications
   */
  disable() {
    this.isEnabled = false;
    this.clearQueue();
    console.log('🔇 TTS Notifications disabled');
    this.emit('serviceDisabled');
  }

  /**
   * Configure notification type settings
   */
  configureNotificationType(type, config) {
    if (this.notificationTypes[type]) {
      this.notificationTypes[type] = { ...this.notificationTypes[type], ...config };
      console.log(`🔊 TTS notification type '${type}' configured:`, config);
      return true;
    }
    return false;
  }

  /**
   * Announce agent task start
   */
  announceAgentStart(agentName, taskType, taskDetails = {}) {
    if (!this.isEnabled || !this.notificationTypes.agent_start.enabled) return;
    
    const message = this.formatMessage(
      this.notificationTypes.agent_start.template,
      { agentName, taskType, ...taskDetails }
    );
    
    this.queueNotification({
      type: 'agent_start',
      message,
      priority: this.notificationTypes.agent_start.priority,
      metadata: { agentName, taskType, taskDetails }
    });
  }

  /**
   * Announce agent task completion
   */
  announceAgentComplete(agentName, taskType, result = {}) {
    if (!this.isEnabled || !this.notificationTypes.agent_complete.enabled) return;
    
    const message = this.formatMessage(
      this.notificationTypes.agent_complete.template,
      { agentName, taskType, ...result }
    );
    
    this.queueNotification({
      type: 'agent_complete',
      message,
      priority: this.notificationTypes.agent_complete.priority,
      metadata: { agentName, taskType, result }
    });
  }

  /**
   * Announce agent error
   */
  announceAgentError(agentName, taskType, error) {
    if (!this.isEnabled || !this.notificationTypes.agent_error.enabled) return;
    
    const message = this.formatMessage(
      this.notificationTypes.agent_error.template,
      { agentName, taskType, error: error.message || error }
    );
    
    this.queueNotification({
      type: 'agent_error',
      message,
      priority: this.notificationTypes.agent_error.priority,
      metadata: { agentName, taskType, error }
    });
  }

  /**
   * Announce system status change
   */
  announceSystemStatus(status, details = {}) {
    if (!this.isEnabled || !this.notificationTypes.system_status.enabled) return;
    
    const message = this.formatMessage(
      this.notificationTypes.system_status.template,
      { status, ...details }
    );
    
    this.queueNotification({
      type: 'system_status',
      message,
      priority: this.notificationTypes.system_status.priority,
      metadata: { status, details }
    });
  }

  /**
   * Custom announcement
   */
  announce(message, options = {}) {
    if (!this.isEnabled) return;
    
    this.queueNotification({
      type: 'custom',
      message,
      priority: options.priority || 'normal',
      metadata: options.metadata || {}
    });
  }

  /**
   * Format message template with variables
   */
  formatMessage(template, variables) {
    let formatted = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      formatted = formatted.replace(new RegExp(placeholder, 'g'), String(value));
    });
    
    return formatted;
  }

  /**
   * Queue notification for processing
   */
  queueNotification(notification) {
    // Rate limiting check
    const now = Date.now();
    if (this.lastNotification && (now - this.lastNotification) < this.rateLimitMs) {
      console.log('🔊 TTS notification rate limited, queuing:', notification.message.substring(0, 50));
    }
    
    notification.timestamp = now;
    notification.id = `tts_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert based on priority
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const insertIndex = this.notificationQueue.findIndex(
      n => priorityOrder[n.priority] > priorityOrder[notification.priority]
    );
    
    if (insertIndex === -1) {
      this.notificationQueue.push(notification);
    } else {
      this.notificationQueue.splice(insertIndex, 0, notification);
    }
    
    this.stats.queuedNotifications = this.notificationQueue.length;
    
    // Process queue if not already processing
    if (!this.isPlaying) {
      this.processQueue();
    }
  }

  /**
   * Process notification queue
   */
  async processQueue() {
    if (this.isPlaying || this.notificationQueue.length === 0) return;
    
    this.isPlaying = true;
    
    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift();
        this.stats.queuedNotifications = this.notificationQueue.length;
        
        await this.speakNotification(notification);
        
        // Update statistics
        this.stats.totalNotifications++;
        this.stats.notificationsByType[notification.type] = 
          (this.stats.notificationsByType[notification.type] || 0) + 1;
        this.stats.lastNotificationTime = Date.now();
        this.lastNotification = Date.now();
        
        // Small delay between notifications
        if (this.notificationQueue.length > 0) {
          await this.delay(1000);
        }
      }
    } catch (error) {
      console.error('🔊 TTS processing error:', error);
      this.emit('processingError', error);
    } finally {
      this.isPlaying = false;
    }
  }

  /**
   * Speak a notification using system TTS
   */
  async speakNotification(notification) {
    try {
      console.log(`🔊 TTS: ${notification.message}`);
      
      // Use macOS built-in speech synthesis
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const say = spawn('say', [
          notification.message,
          '-v', this.voice,
          '-r', Math.round(this.speed * 200).toString(), // Convert to words per minute
        ]);
        
        say.on('close', (code) => {
          if (code === 0) {
            console.log(`🔊 TTS completed: ${notification.type}`);
            this.emit('notificationSpoken', notification);
            resolve();
          } else {
            const error = new Error(`TTS process exited with code ${code}`);
            console.error('🔊 TTS error:', error);
            this.emit('speakError', error, notification);
            reject(error);
          }
        });
        
        say.on('error', (error) => {
          console.error('🔊 TTS spawn error:', error);
          this.emit('speakError', error, notification);
          reject(error);
        });
        
        // Timeout for long messages
        setTimeout(() => {
          say.kill();
          reject(new Error('TTS timeout'));
        }, 30000);
      });
      
    } catch (error) {
      console.error('🔊 TTS speak error:', error);
      this.emit('speakError', error, notification);
      throw error;
    }
  }

  /**
   * Clear notification queue
   */
  clearQueue() {
    this.notificationQueue = [];
    this.stats.queuedNotifications = 0;
    console.log('🔊 TTS notification queue cleared');
    this.emit('queueCleared');
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      isPlaying: this.isPlaying,
      queueLength: this.notificationQueue.length,
      voice: this.voice,
      speed: this.speed,
      volume: this.volume,
      language: this.language,
      notificationTypes: this.notificationTypes,
      stats: this.stats,
      rateLimitMs: this.rateLimitMs
    };
  }

  /**
   * Get available voices (macOS specific)
   */
  async getAvailableVoices() {
    try {
      const { exec } = require('child_process');
      return new Promise((resolve, reject) => {
        exec('say -v ?', (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }
          
          const voices = stdout.split('\n')
            .filter(line => line.trim())
            .map(line => {
              const match = line.match(/^(\w+)\s+(\w+)\s+#\s+(.+)/);
              if (match) {
                return {
                  name: match[1],
                  language: match[2],
                  description: match[3]
                };
              }
              return null;
            })
            .filter(Boolean);
          
          resolve(voices);
        });
      });
    } catch (error) {
      console.error('🔊 Error getting available voices:', error);
      return [];
    }
  }

  /**
   * Update TTS settings
   */
  updateSettings(settings) {
    if (settings.voice !== undefined) this.voice = settings.voice;
    if (settings.speed !== undefined) this.speed = Math.max(0.1, Math.min(3.0, settings.speed));
    if (settings.volume !== undefined) this.volume = Math.max(0.0, Math.min(1.0, settings.volume));
    if (settings.language !== undefined) this.language = settings.language;
    if (settings.rateLimitMs !== undefined) this.rateLimitMs = Math.max(500, settings.rateLimitMs);
    
    console.log('🔊 TTS settings updated:', settings);
    this.emit('settingsUpdated', settings);
  }

  /**
   * Export configuration
   */
  exportConfiguration() {
    return {
      enabled: this.isEnabled,
      voice: this.voice,
      speed: this.speed,
      volume: this.volume,
      language: this.language,
      rateLimitMs: this.rateLimitMs,
      notificationTypes: { ...this.notificationTypes }
    };
  }

  /**
   * Import configuration
   */
  importConfiguration(config) {
    if (config.enabled !== undefined) {
      config.enabled ? this.enable() : this.disable();
    }
    
    delete config.enabled;
    
    if (config.notificationTypes) {
      this.notificationTypes = { ...this.notificationTypes, ...config.notificationTypes };
      delete config.notificationTypes;
    }
    
    this.updateSettings(config);
    
    console.log('🔊 TTS configuration imported');
    this.emit('configurationImported', config);
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test TTS functionality
   */
  async testTTS() {
    if (!this.isEnabled) {
      throw new Error('TTS service is disabled');
    }
    
    const testMessage = `ORCHESTRAI Text-to-Speech service is working. Voice: ${this.voice}, Speed: ${this.speed}`;
    
    await this.announce(testMessage, { priority: 'high' });
    
    return {
      success: true,
      message: 'TTS test initiated',
      testMessage
    };
  }
}

module.exports = TextToSpeechService;