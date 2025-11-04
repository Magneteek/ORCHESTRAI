/**
 * CLI Formatters
 * Utility functions for formatting numbers, dates, and values in terminal UI
 */

/**
 * Format large numbers with K/M suffixes
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
function formatNumber(num, decimals = 1) {
  if (num === 0) return '0';
  if (num < 1000) return num.toString();

  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }

  return num.toFixed(decimals);
}

/**
 * Format number with commas
 * @param {number} num - The number to format
 * @returns {string} Formatted number with commas
 */
function formatWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format cost in USD
 * @param {number} cost - Cost in dollars
 * @returns {string} Formatted cost
 */
function formatCost(cost) {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return '<$0.01';
  return '$' + cost.toFixed(2);
}

/**
 * Format duration in HH:MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
}

/**
 * Format timestamp
 * @param {Date|string|number} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp
 */
function formatTime(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format timestamp with milliseconds
 * @param {Date|string|number} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp with ms
 */
function formatTimeWithMs(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');

  return `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Create a progress bar
 * @param {number} current - Current value
 * @param {number} max - Maximum value
 * @param {number} width - Bar width
 * @returns {string} ASCII progress bar
 */
function createProgressBar(current, max, width = 10) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  const filled = Math.floor((percentage / 100) * width);
  const empty = width - filled;

  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

/**
 * Get color based on percentage
 * @param {number} percentage - Percentage value (0-100)
 * @returns {string} Color name for blessed
 */
function getPercentageColor(percentage) {
  if (percentage < 70) return 'green';
  if (percentage < 90) return 'yellow';
  return 'red';
}

/**
 * Format workflow status
 * @param {string} status - Status string
 * @returns {string} Formatted status with emoji
 */
function formatStatus(status) {
  const statusMap = {
    'completed': '✓',
    'running': '⏳',
    'failed': '✗',
    'pending': '○'
  };

  return statusMap[status] || '?';
}

/**
 * Truncate string to fit width
 * @param {string} str - String to truncate
 * @param {number} width - Max width
 * @returns {string} Truncated string
 */
function truncate(str, width) {
  if (str.length <= width) return str.padEnd(width);
  return str.substring(0, width - 3) + '...';
}

/**
 * Pad string to width
 * @param {string} str - String to pad
 * @param {number} width - Target width
 * @param {string} align - Alignment: 'left', 'right', 'center'
 * @returns {string} Padded string
 */
function pad(str, width, align = 'left') {
  const strLen = str.length;

  if (strLen >= width) return str.substring(0, width);

  const padding = width - strLen;

  switch (align) {
    case 'right':
      return ' '.repeat(padding) + str;
    case 'center':
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
    default: // left
      return str + ' '.repeat(padding);
  }
}

/**
 * Format event type for display
 * @param {string} eventType - Event type
 * @returns {string} Formatted event type
 */
function formatEventType(eventType) {
  const typeMap = {
    'user-prompt-submit': 'Prompt',
    'task-start': 'Task Start',
    'task-complete': 'Task Complete',
    'tool-call': 'Tool Call',
    'token-usage': 'Tokens'
  };

  return typeMap[eventType] || eventType;
}

module.exports = {
  formatNumber,
  formatWithCommas,
  formatCost,
  formatDuration,
  formatTime,
  formatTimeWithMs,
  createProgressBar,
  getPercentageColor,
  formatStatus,
  truncate,
  pad,
  formatEventType
};
