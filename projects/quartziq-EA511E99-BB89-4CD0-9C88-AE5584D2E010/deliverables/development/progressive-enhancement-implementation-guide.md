# Progressive Enhancement Implementation Guide
*QuartzIQ Intelligent Analytics Platform*
*Browser Compatibility Phase 5 - Technical Implementation*

## Executive Summary

This comprehensive guide provides detailed implementation strategies for progressive enhancement across QuartzIQ's intelligent analytics platform, ensuring optimal functionality across all browser capabilities while maintaining accessibility and performance standards.

## Progressive Enhancement Architecture

### Three-Layer Enhancement Strategy

#### Layer 1: Core Functionality (HTML + Basic CSS)
**Target:** Universal browser support including IE11 basic functionality
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QuartzIQ Analytics Dashboard</title>
  
  <!-- Critical CSS inlined for first paint -->
  <style>
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    }
    
    .metrics-grid {
      display: block;
      margin: 20px 0;
    }
    
    .metric-card {
      display: block;
      border: 1px solid #ddd;
      padding: 20px;
      margin: 10px 0;
      background: #fff;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    .data-table th,
    .data-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    .data-table th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
    
    /* Print styles for offline access */
    @media print {
      .dashboard-container {
        max-width: none;
        margin: 0;
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="dashboard-container" role="main">
    <header>
      <h1>QuartzIQ Analytics Dashboard</h1>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/analytics">Analytics</a></li>
          <li><a href="/reports">Reports</a></li>
        </ul>
      </nav>
    </header>
    
    <!-- Core Metrics - Always Available -->
    <section class="metrics-grid" aria-labelledby="metrics-title">
      <h2 id="metrics-title">Key Performance Indicators</h2>
      
      <div class="metric-card">
        <h3>Total Revenue</h3>
        <p class="metric-value">$2,847,392</p>
        <p class="metric-change positive">+12.5% vs last month</p>
      </div>
      
      <div class="metric-card">
        <h3>Active Users</h3>
        <p class="metric-value">15,623</p>
        <p class="metric-change positive">+8.3% vs last month</p>
      </div>
      
      <div class="metric-card">
        <h3>Conversion Rate</h3>
        <p class="metric-value">3.47%</p>
        <p class="metric-change negative">-2.1% vs last month</p>
      </div>
    </section>
    
    <!-- Data Table - Server Rendered -->
    <section aria-labelledby="data-title">
      <h2 id="data-title">Recent Transactions</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Transaction ID</th>
            <th scope="col">Amount</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <!-- Server-rendered data -->
          <tr>
            <td>2025-08-28</td>
            <td>TXN-2025-001234</td>
            <td>$1,247.50</td>
            <td>Completed</td>
          </tr>
          <!-- More rows... -->
        </tbody>
      </table>
    </section>
    
    <!-- Basic Query Form -->
    <section aria-labelledby="query-title">
      <h2 id="query-title">Data Query</h2>
      <form method="get" action="/analytics/query" class="query-form">
        <div>
          <label for="query-input">Search Data:</label>
          <input type="text" id="query-input" name="query" 
                 placeholder="Enter search terms..." required>
        </div>
        <div>
          <label for="date-range">Date Range:</label>
          <select id="date-range" name="range">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
        <button type="submit">Search</button>
      </form>
    </section>
  </div>
  
  <!-- No JavaScript fallback message -->
  <noscript>
    <div class="no-js-message">
      <p>You are viewing the basic version of QuartzIQ Analytics. 
         Enable JavaScript for enhanced features including real-time updates, 
         interactive charts, and advanced filtering.</p>
    </div>
  </noscript>
</body>
</html>
```

#### Layer 2: Enhanced Experience (Modern CSS + Progressive JavaScript)
```css
/* Enhanced CSS loaded after basic styles */
@supports (display: grid) {
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin: 30px 0;
  }
  
  .metric-card {
    margin: 0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
}

@supports (display: flex) {
  .dashboard-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
  }
  
  .nav-links {
    display: flex;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
}

/* Custom properties for theming */
@supports (color: var(--primary)) {
  :root {
    --primary-color: #0066cc;
    --secondary-color: #00a86b;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --text-primary: #333;
    --text-secondary: #666;
    --background: #fff;
    --border: #e0e0e0;
  }
  
  .metric-value {
    color: var(--primary-color);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 10px 0;
  }
  
  .metric-change.positive {
    color: var(--secondary-color);
  }
  
  .metric-change.negative {
    color: var(--danger-color);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1a1a1a;
    --text-primary: #fff;
    --text-secondary: #ccc;
    --border: #444;
  }
  
  body {
    background-color: var(--background);
    color: var(--text-primary);
  }
  
  .metric-card {
    background-color: #2a2a2a;
    border-color: var(--border);
  }
}

/* Reduced motion respect */
@media (prefers-reduced-motion: reduce) {
  .metric-card {
    transition: none;
  }
  
  .metric-card:hover {
    transform: none;
  }
}
```

```javascript
// Progressive JavaScript Enhancement
(function() {
  'use strict';
  
  // Feature detection
  const capabilities = {
    localStorage: (function() {
      try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch(e) {
        return false;
      }
    })(),
    
    fetch: typeof fetch !== 'undefined',
    intersectionObserver: 'IntersectionObserver' in window,
    customElements: 'customElements' in window,
    webSocket: 'WebSocket' in window
  };
  
  // Progressive enhancement initialization
  function initializeEnhancements() {
    // Enhanced form handling
    if (capabilities.fetch) {
      enhanceFormSubmissions();
    }
    
    // Real-time updates if WebSocket available
    if (capabilities.webSocket) {
      initializeRealTimeUpdates();
    }
    
    // Lazy loading with Intersection Observer
    if (capabilities.intersectionObserver) {
      initializeLazyLoading();
    }
    
    // Local storage for user preferences
    if (capabilities.localStorage) {
      initializePreferences();
    }
    
    // Add loading states and feedback
    enhanceUserFeedback();
  }
  
  // Enhanced form submissions with fetch
  function enhanceFormSubmissions() {
    const queryForm = document.querySelector('.query-form');
    if (!queryForm) return;
    
    queryForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      
      // Show loading state
      submitButton.textContent = 'Searching...';
      submitButton.disabled = true;
      
      fetch(this.action + '?' + new URLSearchParams(formData))
        .then(response => response.json())
        .then(data => {
          updateDashboardData(data);
        })
        .catch(error => {
          console.error('Query failed:', error);
          showErrorMessage('Query failed. Please try again.');
        })
        .finally(() => {
          submitButton.textContent = originalText;
          submitButton.disabled = false;
        });
    });
  }
  
  // Real-time updates via WebSocket
  function initializeRealTimeUpdates() {
    const ws = new WebSocket('wss://api.quartziq.com/ws');
    
    ws.onopen = function() {
      console.log('Real-time updates connected');
      showSuccessMessage('Real-time updates enabled');
    };
    
    ws.onmessage = function(event) {
      const data = JSON.parse(event.data);
      updateMetricsDisplay(data);
    };
    
    ws.onerror = function() {
      console.log('WebSocket failed, falling back to polling');
      initializePollingUpdates();
    };
  }
  
  // Polling fallback for real-time updates
  function initializePollingUpdates() {
    setInterval(function() {
      if (capabilities.fetch) {
        fetch('/api/metrics/latest')
          .then(response => response.json())
          .then(data => updateMetricsDisplay(data))
          .catch(error => console.error('Polling update failed:', error));
      }
    }, 30000); // Poll every 30 seconds
  }
  
  // Lazy loading implementation
  function initializeLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          loadChartData(element);
          observer.unobserve(element);
        }
      });
    });
    
    document.querySelectorAll('[data-lazy-chart]').forEach(chart => {
      observer.observe(chart);
    });
  }
  
  // User preferences with localStorage
  function initializePreferences() {
    const savedTheme = localStorage.getItem('quartziq-theme');
    if (savedTheme) {
      document.body.setAttribute('data-theme', savedTheme);
    }
    
    const savedDashboard = localStorage.getItem('quartziq-dashboard-layout');
    if (savedDashboard) {
      try {
        const layout = JSON.parse(savedDashboard);
        applyDashboardLayout(layout);
      } catch(e) {
        console.warn('Invalid saved dashboard layout');
      }
    }
  }
  
  // Enhanced user feedback
  function enhanceUserFeedback() {
    // Add loading indicators
    const style = document.createElement('style');
    style.textContent = `
      .loading {
        position: relative;
        pointer-events: none;
      }
      
      .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid var(--primary-color, #0066cc);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .success-message,
      .error-message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      }
      
      .success-message {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      
      .error-message {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Utility functions
  function updateDashboardData(data) {
    if (data.metrics) {
      updateMetricsDisplay(data.metrics);
    }
    
    if (data.table) {
      updateTableData(data.table);
    }
  }
  
  function updateMetricsDisplay(metrics) {
    Object.keys(metrics).forEach(metricKey => {
      const card = document.querySelector(`[data-metric="${metricKey}"]`);
      if (card) {
        const valueElement = card.querySelector('.metric-value');
        const changeElement = card.querySelector('.metric-change');
        
        if (valueElement) {
          animateValueChange(valueElement, metrics[metricKey].value);
        }
        
        if (changeElement && metrics[metricKey].change) {
          changeElement.textContent = metrics[metricKey].change;
          changeElement.className = `metric-change ${metrics[metricKey].trend}`;
        }
      }
    });
  }
  
  function animateValueChange(element, newValue) {
    const oldValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
    const increment = (newValue - oldValue) / 20;
    let currentValue = oldValue;
    
    const animation = setInterval(() => {
      currentValue += increment;
      if ((increment > 0 && currentValue >= newValue) || 
          (increment < 0 && currentValue <= newValue)) {
        currentValue = newValue;
        clearInterval(animation);
      }
      
      element.textContent = formatNumber(currentValue);
    }, 50);
  }
  
  function formatNumber(number) {
    if (number >= 1000000) {
      return '$' + (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return '$' + (number / 1000).toFixed(1) + 'K';
    } else {
      return '$' + number.toFixed(0);
    }
  }
  
  function showSuccessMessage(message) {
    showMessage(message, 'success');
  }
  
  function showErrorMessage(message) {
    showMessage(message, 'error');
  }
  
  function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = type + '-message';
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 5000);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancements);
  } else {
    initializeEnhancements();
  }
})();
```

#### Layer 3: Advanced Features (Modern APIs + Optimizations)
```javascript
// Advanced features for modern browsers
(function() {
  'use strict';
  
  // Advanced capability detection
  const advancedCapabilities = {
    serviceWorker: 'serviceWorker' in navigator,
    webWorkers: typeof Worker !== 'undefined',
    webSocket: 'WebSocket' in window,
    indexedDB: 'indexedDB' in window,
    speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    vibration: 'vibrate' in navigator,
    clipboard: navigator.clipboard && navigator.clipboard.writeText,
    share: navigator.share,
    wakeLock: 'wakeLock' in navigator,
    badging: 'setAppBadge' in navigator
  };
  
  class AdvancedDashboard {
    constructor() {
      this.chartWorker = null;
      this.dataCache = null;
      this.serviceWorkerRegistration = null;
      
      this.initializeAdvancedFeatures();
    }
    
    async initializeAdvancedFeatures() {
      // Service Worker for offline functionality
      if (advancedCapabilities.serviceWorker) {
        await this.registerServiceWorker();
      }
      
      // Web Workers for data processing
      if (advancedCapabilities.webWorkers) {
        this.initializeWebWorkers();
      }
      
      // IndexedDB for client-side caching
      if (advancedCapabilities.indexedDB) {
        this.initializeOfflineStorage();
      }
      
      // Speech recognition for voice queries
      if (advancedCapabilities.speechRecognition) {
        this.initializeSpeechRecognition();
      }
      
      // Advanced sharing capabilities
      if (advancedCapabilities.share) {
        this.initializeWebShare();
      }
      
      // Badge API for notifications
      if (advancedCapabilities.badging) {
        this.initializeBadging();
      }
      
      // Wake Lock for presentation mode
      if (advancedCapabilities.wakeLock) {
        this.initializeWakeLock();
      }
    }
    
    async registerServiceWorker() {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // Listen for updates
        this.serviceWorkerRegistration.addEventListener('updatefound', () => {
          this.showUpdateAvailable();
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
    
    initializeWebWorkers() {
      // Chart data processing worker
      this.chartWorker = new Worker('/workers/chart-processor.js');
      
      this.chartWorker.onmessage = (event) => {
        const { type, data, chartId } = event.data;
        
        switch (type) {
          case 'CHART_DATA_PROCESSED':
            this.renderChart(chartId, data);
            break;
          case 'AGGREGATION_COMPLETE':
            this.updateAggregationDisplay(data);
            break;
        }
      };
    }
    
    async initializeOfflineStorage() {
      this.dataCache = await this.openDatabase();
      
      // Cache frequently accessed data
      await this.cacheEssentialData();
    }
    
    openDatabase() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('QuartzIQCache', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Create object stores
          const metricsStore = db.createObjectStore('metrics', { keyPath: 'id' });
          const chartsStore = db.createObjectStore('charts', { keyPath: 'id' });
          const queriesStore = db.createObjectStore('queries', { keyPath: 'id' });
          
          // Create indexes
          metricsStore.createIndex('timestamp', 'timestamp');
          chartsStore.createIndex('type', 'type');
          queriesStore.createIndex('frequency', 'frequency');
        };
      });
    }
    
    initializeSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      // Add voice control button
      const voiceButton = document.createElement('button');
      voiceButton.innerHTML = '🎤 Voice Query';
      voiceButton.className = 'voice-control-btn';
      
      voiceButton.addEventListener('click', () => {
        recognition.start();
        voiceButton.textContent = '🎤 Listening...';
        voiceButton.disabled = true;
      });
      
      recognition.onresult = (event) => {
        const query = event.results[0][0].transcript;
        const queryInput = document.getElementById('query-input');
        if (queryInput) {
          queryInput.value = query;
          queryInput.form.dispatchEvent(new Event('submit'));
        }
      };
      
      recognition.onend = () => {
        voiceButton.textContent = '🎤 Voice Query';
        voiceButton.disabled = false;
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceButton.textContent = '🎤 Voice Query';
        voiceButton.disabled = false;
      };
      
      // Add to query form
      const queryForm = document.querySelector('.query-form');
      if (queryForm) {
        queryForm.appendChild(voiceButton);
      }
    }
    
    initializeWebShare() {
      // Add share buttons to charts and reports
      document.addEventListener('click', async (event) => {
        if (event.target.matches('.share-btn')) {
          event.preventDefault();
          
          const shareData = {
            title: 'QuartzIQ Analytics Report',
            text: 'Check out this analytics report from QuartzIQ',
            url: window.location.href
          };
          
          try {
            await navigator.share(shareData);
            console.log('Shared successfully');
          } catch (error) {
            console.error('Share failed:', error);
            // Fallback to clipboard
            if (advancedCapabilities.clipboard) {
              await navigator.clipboard.writeText(window.location.href);
              this.showMessage('Link copied to clipboard', 'success');
            }
          }
        }
      });
    }
    
    initializeBadging() {
      // Update badge when new data is available
      this.updateBadgeCount = (count) => {
        if (count > 0) {
          navigator.setAppBadge(count);
        } else {
          navigator.clearAppBadge();
        }
      };
    }
    
    async initializeWakeLock() {
      let wakeLock = null;
      
      // Presentation mode toggle
      const presentationBtn = document.createElement('button');
      presentationBtn.textContent = 'Enter Presentation Mode';
      presentationBtn.className = 'presentation-btn';
      
      presentationBtn.addEventListener('click', async () => {
        if (!wakeLock) {
          try {
            wakeLock = await navigator.wakeLock.request('screen');
            presentationBtn.textContent = 'Exit Presentation Mode';
            document.body.classList.add('presentation-mode');
            
            wakeLock.addEventListener('release', () => {
              console.log('Screen Wake Lock was released');
              presentationBtn.textContent = 'Enter Presentation Mode';
              document.body.classList.remove('presentation-mode');
              wakeLock = null;
            });
          } catch (error) {
            console.error('Wake Lock failed:', error);
          }
        } else {
          wakeLock.release();
        }
      });
      
      // Add to dashboard controls
      const dashboardHeader = document.querySelector('header');
      if (dashboardHeader) {
        dashboardHeader.appendChild(presentationBtn);
      }
    }
    
    // Advanced data processing methods
    processChartData(chartId, rawData, options = {}) {
      if (this.chartWorker) {
        this.chartWorker.postMessage({
          type: 'PROCESS_CHART_DATA',
          chartId,
          data: rawData,
          options
        });
      } else {
        // Fallback to main thread processing
        this.renderChart(chartId, this.processDataSync(rawData, options));
      }
    }
    
    processDataSync(data, options) {
      // Synchronous data processing fallback
      return data.map(item => ({
        ...item,
        processed: true,
        timestamp: new Date().toISOString()
      }));
    }
    
    renderChart(chartId, processedData) {
      const chartContainer = document.querySelector(`[data-chart-id="${chartId}"]`);
      if (!chartContainer) return;
      
      // Create chart visualization
      const chart = document.createElement('div');
      chart.className = 'dynamic-chart';
      chart.innerHTML = this.generateChartHTML(processedData);
      
      chartContainer.innerHTML = '';
      chartContainer.appendChild(chart);
    }
    
    generateChartHTML(data) {
      // Generate HTML representation of chart
      // This would integrate with your chosen chart library
      return `
        <div class="chart-visualization">
          <canvas id="chart-canvas"></canvas>
          <div class="chart-legend"></div>
        </div>
      `;
    }
    
    async cacheEssentialData() {
      try {
        const metricsResponse = await fetch('/api/metrics/essential');
        const metrics = await metricsResponse.json();
        
        const transaction = this.dataCache.transaction(['metrics'], 'readwrite');
        const store = transaction.objectStore('metrics');
        
        for (const metric of metrics) {
          await store.put({
            ...metric,
            cached: Date.now()
          });
        }
      } catch (error) {
        console.error('Failed to cache essential data:', error);
      }
    }
    
    showUpdateAvailable() {
      const updateNotification = document.createElement('div');
      updateNotification.className = 'update-notification';
      updateNotification.innerHTML = `
        <p>A new version of QuartzIQ is available!</p>
        <button onclick="location.reload()">Update Now</button>
        <button onclick="this.parentElement.remove()">Later</button>
      `;
      
      document.body.appendChild(updateNotification);
    }
    
    showMessage(message, type = 'info') {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${type}`;
      messageElement.textContent = message;
      
      // Add vibration feedback if available
      if (advancedCapabilities.vibration && type === 'success') {
        navigator.vibrate(200);
      }
      
      document.body.appendChild(messageElement);
      
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 5000);
    }
  }
  
  // Initialize advanced dashboard when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new AdvancedDashboard();
    });
  } else {
    new AdvancedDashboard();
  }
  
})();
```

## Service Worker Implementation

```javascript
// Service Worker for offline functionality
const CACHE_NAME = 'quartziq-v1.0.0';
const ESSENTIAL_CACHE = 'quartziq-essential-v1.0.0';

// Files to cache for offline functionality
const ESSENTIAL_FILES = [
  '/',
  '/dashboard',
  '/offline.html',
  '/css/critical.css',
  '/js/progressive-enhancement.js',
  '/manifest.json'
];

const CACHE_STRATEGIES = {
  // Critical resources - Cache First
  CACHE_FIRST: [
    /\.(css|js|woff2?|png|jpg|jpeg|svg|ico)$/,
    /\/api\/static\//
  ],
  
  // Dynamic content - Network First
  NETWORK_FIRST: [
    /\/api\/metrics/,
    /\/api\/analytics/,
    /\/api\/reports/
  ],
  
  // Cache with network update
  STALE_WHILE_REVALIDATE: [
    /\/dashboard/,
    /\/analytics/
  ]
};

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ESSENTIAL_CACHE)
      .then((cache) => cache.addAll(ESSENTIAL_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== ESSENTIAL_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) return;
  
  // Determine caching strategy
  const strategy = getCacheStrategy(url.pathname);
  
  switch (strategy) {
    case 'CACHE_FIRST':
      event.respondWith(cacheFirst(request));
      break;
    case 'NETWORK_FIRST':
      event.respondWith(networkFirst(request));
      break;
    case 'STALE_WHILE_REVALIDATE':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Cache strategies implementation
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return await caches.match('/offline.html');
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    return cached || await caches.match('/offline.html');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || fetchPromise;
}

function getCacheStrategy(pathname) {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (patterns.some(pattern => pattern.test(pathname))) {
      return strategy;
    }
  }
  return 'NETWORK_FIRST';
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-analytics') {
    event.waitUntil(syncOfflineAnalytics());
  }
});

async function syncOfflineAnalytics() {
  const db = await openIndexedDB();
  const offlineActions = await getOfflineActions(db);
  
  for (const action of offlineActions) {
    try {
      await fetch('/api/analytics/offline', {
        method: 'POST',
        body: JSON.stringify(action),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      await removeOfflineAction(db, action.id);
    } catch (error) {
      console.error('Failed to sync offline action:', error);
    }
  }
}
```

## Browser-Specific Polyfills

```javascript
// Polyfills for older browser support
(function() {
  'use strict';
  
  // Intersection Observer polyfill
  if (!('IntersectionObserver' in window)) {
    loadPolyfill('/polyfills/intersection-observer.js');
  }
  
  // Custom Elements polyfill
  if (!('customElements' in window)) {
    loadPolyfill('/polyfills/custom-elements-es5-adapter.js');
    loadPolyfill('/polyfills/webcomponentsjs/custom-elements-es5-adapter.js');
  }
  
  // Fetch polyfill
  if (!('fetch' in window)) {
    loadPolyfill('/polyfills/fetch.js');
  }
  
  // Promise polyfill
  if (!('Promise' in window)) {
    loadPolyfill('/polyfills/promise.js');
  }
  
  // CSS Object Model API
  if (!window.CSS || !CSS.supports) {
    window.CSS = {
      supports: function(property, value) {
        if (arguments.length === 2) {
          return supportsCSSProperty(property, value);
        }
        // Handle @supports queries
        return supportsCSSQuery(property);
      }
    };
  }
  
  // URLSearchParams polyfill
  if (!('URLSearchParams' in window)) {
    window.URLSearchParams = URLSearchParamsPolyfill;
  }
  
  // Array.from polyfill
  if (!Array.from) {
    Array.from = function(arrayLike, mapFn, thisArg) {
      var toStr = Object.prototype.toString;
      var isCallable = function(fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
      };
      var toInteger = function(value) {
        var number = Number(value);
        if (isNaN(number)) return 0;
        if (number === 0 || !isFinite(number)) return number;
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
      };
      var maxSafeInteger = Math.pow(2, 53) - 1;
      var toLength = function(value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
      };
      
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object');
      }
      
      var mapFunction = arguments.length > 1 ? mapFn : void undefined;
      var T;
      if (typeof mapFunction !== 'undefined') {
        if (!isCallable(mapFunction)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        if (arguments.length > 2) {
          T = thisArg;
        }
      }
      
      var len = toLength(items.length);
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFunction) {
          A[k] = typeof T === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }
  
  // Helper functions
  function loadPolyfill(src) {
    var script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  }
  
  function supportsCSSProperty(property, value) {
    var element = document.createElement('div');
    try {
      element.style[property] = value;
      return element.style[property] === value;
    } catch (e) {
      return false;
    }
  }
  
  function supportsCSSQuery(query) {
    var style = document.createElement('style');
    document.head.appendChild(style);
    try {
      style.sheet.insertRule('@supports ' + query + ' { }', 0);
      return true;
    } catch (e) {
      return false;
    } finally {
      document.head.removeChild(style);
    }
  }
  
  // URLSearchParams polyfill implementation
  function URLSearchParamsPolyfill(init) {
    this.params = {};
    
    if (init) {
      if (typeof init === 'string') {
        this._fromString(init);
      } else if (init instanceof URLSearchParamsPolyfill) {
        this.params = Object.assign({}, init.params);
      }
    }
  }
  
  URLSearchParamsPolyfill.prototype._fromString = function(str) {
    if (str.charAt(0) === '?') str = str.slice(1);
    var pairs = str.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      if (pair.length === 2) {
        this.params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }
  };
  
  URLSearchParamsPolyfill.prototype.append = function(name, value) {
    if (!(name in this.params)) {
      this.params[name] = [];
    } else if (!Array.isArray(this.params[name])) {
      this.params[name] = [this.params[name]];
    }
    this.params[name].push(value);
  };
  
  URLSearchParamsPolyfill.prototype.get = function(name) {
    var value = this.params[name];
    return Array.isArray(value) ? value[0] : value || null;
  };
  
  URLSearchParamsPolyfill.prototype.set = function(name, value) {
    this.params[name] = value;
  };
  
  URLSearchParamsPolyfill.prototype.toString = function() {
    var pairs = [];
    for (var name in this.params) {
      var values = Array.isArray(this.params[name]) ? this.params[name] : [this.params[name]];
      for (var i = 0; i < values.length; i++) {
        pairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(values[i]));
      }
    }
    return pairs.join('&');
  };
  
})();
```

## Testing Strategy

```javascript
// Progressive Enhancement Testing Suite
class ProgressiveEnhancementTester {
  constructor() {
    this.testResults = {
      baseLayer: {},
      enhancedLayer: {},
      advancedLayer: {}
    };
  }
  
  async runAllTests() {
    console.log('🧪 Starting Progressive Enhancement Tests');
    
    await this.testBaseLayer();
    await this.testEnhancedLayer();
    await this.testAdvancedLayer();
    
    this.generateReport();
  }
  
  async testBaseLayer() {
    console.log('📋 Testing Base Layer (HTML + CSS)');
    
    // Test core HTML structure
    this.testResults.baseLayer.htmlStructure = this.testHTMLStructure();
    
    // Test CSS-only functionality
    this.testResults.baseLayer.cssOnlyFeatures = this.testCSSOnlyFeatures();
    
    // Test form functionality without JavaScript
    this.testResults.baseLayer.formFunctionality = await this.testBasicForms();
    
    // Test accessibility
    this.testResults.baseLayer.accessibility = this.testBaseAccessibility();
  }
  
  async testEnhancedLayer() {
    console.log('⚡ Testing Enhanced Layer (Modern CSS + JS)');
    
    // Test CSS Grid/Flexbox layouts
    this.testResults.enhancedLayer.modernLayouts = this.testModernLayouts();
    
    // Test JavaScript enhancements
    this.testResults.enhancedLayer.jsEnhancements = await this.testJSEnhancements();
    
    // Test real-time features
    this.testResults.enhancedLayer.realTimeFeatures = await this.testRealTimeFeatures();
    
    // Test responsive behavior
    this.testResults.enhancedLayer.responsiveDesign = this.testResponsiveDesign();
  }
  
  async testAdvancedLayer() {
    console.log('🚀 Testing Advanced Layer (Modern APIs)');
    
    // Test Service Worker
    this.testResults.advancedLayer.serviceWorker = await this.testServiceWorker();
    
    // Test Web Workers
    this.testResults.advancedLayer.webWorkers = await this.testWebWorkers();
    
    // Test advanced APIs
    this.testResults.advancedLayer.advancedAPIs = this.testAdvancedAPIs();
    
    // Test offline functionality
    this.testResults.advancedLayer.offlineFunctionality = await this.testOfflineFunctionality();
  }
  
  testHTMLStructure() {
    const requiredElements = [
      'main[role="main"]',
      'nav[aria-label]',
      'section[aria-labelledby]',
      'table',
      'form'
    ];
    
    const results = {};
    requiredElements.forEach(selector => {
      results[selector] = document.querySelector(selector) !== null;
    });
    
    return results;
  }
  
  testCSSOnlyFeatures() {
    const tests = {
      gridSupport: CSS.supports('display', 'grid'),
      flexboxSupport: CSS.supports('display', 'flex'),
      customProperties: CSS.supports('color', 'var(--test)'),
      mediaqueries: window.matchMedia('(min-width: 768px)').matches !== undefined
    };
    
    return tests;
  }
  
  async testBasicForms() {
    const form = document.querySelector('.query-form');
    if (!form) return { error: 'Form not found' };
    
    const formData = new FormData(form);
    const hasRequiredFields = formData.has('query');
    const hasSubmitButton = form.querySelector('button[type="submit"]') !== null;
    
    return {
      hasRequiredFields,
      hasSubmitButton,
      canSubmit: hasRequiredFields && hasSubmitButton
    };
  }
  
  testBaseAccessibility() {
    const tests = {
      hasSkipLink: document.querySelector('a[href="#main"]') !== null,
      hasProperHeadings: this.checkHeadingStructure(),
      hasAltText: this.checkImages(),
      hasFormLabels: this.checkFormLabels(),
      hasLandmarks: this.checkLandmarks()
    };
    
    return tests;
  }
  
  testModernLayouts() {
    const gridContainer = document.querySelector('.metrics-grid');
    const flexContainer = document.querySelector('.nav-links');
    
    return {
      gridLayout: gridContainer ? getComputedStyle(gridContainer).display === 'grid' : false,
      flexLayout: flexContainer ? getComputedStyle(flexContainer).display === 'flex' : false
    };
  }
  
  async testJSEnhancements() {
    const tests = {
      fetchAPI: typeof fetch !== 'undefined',
      eventListeners: this.testEventListeners(),
      localStorage: this.testLocalStorage(),
      dynamicContent: this.testDynamicContent()
    };
    
    return tests;
  }
  
  async testRealTimeFeatures() {
    const tests = {
      webSocketSupport: typeof WebSocket !== 'undefined',
      connectionTest: await this.testWebSocketConnection(),
      fallbackPolling: this.testPollingFallback()
    };
    
    return tests;
  }
  
  testResponsiveDesign() {
    const breakpoints = [320, 768, 1024, 1920];
    const results = {};
    
    breakpoints.forEach(width => {
      // Simulate viewport change (in actual testing, use viewport manipulation)
      const mediaQuery = window.matchMedia(`(min-width: ${width}px)`);
      results[`${width}px`] = mediaQuery.matches;
    });
    
    return results;
  }
  
  async testServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return { supported: false };
    }
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return {
        supported: true,
        registered: registration !== undefined,
        active: registration ? registration.active !== null : false
      };
    } catch (error) {
      return { supported: true, error: error.message };
    }
  }
  
  async testWebWorkers() {
    if (typeof Worker === 'undefined') {
      return { supported: false };
    }
    
    try {
      const worker = new Worker('/workers/test-worker.js');
      return new Promise((resolve) => {
        worker.postMessage({ test: true });
        worker.onmessage = () => {
          resolve({ supported: true, functional: true });
          worker.terminate();
        };
        worker.onerror = (error) => {
          resolve({ supported: true, functional: false, error: error.message });
          worker.terminate();
        };
        
        // Timeout after 5 seconds
        setTimeout(() => {
          resolve({ supported: true, functional: false, error: 'timeout' });
          worker.terminate();
        }, 5000);
      });
    } catch (error) {
      return { supported: true, error: error.message };
    }
  }
  
  testAdvancedAPIs() {
    return {
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      mutationObserver: 'MutationObserver' in window,
      performanceObserver: 'PerformanceObserver' in window,
      speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
      webShare: navigator.share !== undefined,
      clipboard: navigator.clipboard !== undefined,
      vibration: navigator.vibrate !== undefined,
      wakeLock: 'wakeLock' in navigator,
      badging: 'setAppBadge' in navigator
    };
  }
  
  async testOfflineFunctionality() {
    if (!('serviceWorker' in navigator)) {
      return { supported: false };
    }
    
    try {
      // Simulate offline condition
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return { supported: true, serviceWorkerRequired: true };
      }
      
      // Test cached resources
      const cache = await caches.open('quartziq-essential-v1.0.0');
      const cachedRequests = await cache.keys();
      
      return {
        supported: true,
        serviceWorkerActive: registration.active !== null,
        cachedResources: cachedRequests.length,
        hasEssentialFiles: cachedRequests.length > 0
      };
    } catch (error) {
      return { supported: true, error: error.message };
    }
  }
  
  // Helper methods
  checkHeadingStructure() {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return headings.length > 0 && headings[0].tagName === 'H1';
  }
  
  checkImages() {
    const images = Array.from(document.querySelectorAll('img'));
    return images.every(img => img.hasAttribute('alt'));
  }
  
  checkFormLabels() {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    return inputs.every(input => {
      return input.hasAttribute('aria-label') || 
             input.hasAttribute('aria-labelledby') ||
             document.querySelector(`label[for="${input.id}"]`);
    });
  }
  
  checkLandmarks() {
    const landmarks = ['main', 'nav', 'header', 'footer', 'aside'];
    return landmarks.some(landmark => document.querySelector(landmark));
  }
  
  testEventListeners() {
    const form = document.querySelector('.query-form');
    if (!form) return false;
    
    // Check if enhanced form submission is active
    return form.onsubmit !== null || form.hasAttribute('data-enhanced');
  }
  
  testLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  testDynamicContent() {
    const dynamicElements = document.querySelectorAll('[data-dynamic]');
    return dynamicElements.length > 0;
  }
  
  async testWebSocketConnection() {
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket('wss://api.quartziq.com/ws/test');
        ws.onopen = () => {
          resolve(true);
          ws.close();
        };
        ws.onerror = () => {
          resolve(false);
        };
        
        setTimeout(() => {
          resolve(false);
          try { ws.close(); } catch (e) {}
        }, 5000);
      } catch (error) {
        resolve(false);
      }
    });
  }
  
  testPollingFallback() {
    return typeof setInterval !== 'undefined' && typeof fetch !== 'undefined';
  }
  
  generateReport() {
    console.log('📊 Progressive Enhancement Test Results:');
    console.table(this.testResults);
    
    const totalTests = this.countTests(this.testResults);
    const passedTests = this.countPassedTests(this.testResults);
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log(`✅ Tests Passed: ${passedTests}/${totalTests} (${successRate}%)`);
    
    return {
      results: this.testResults,
      summary: {
        total: totalTests,
        passed: passedTests,
        successRate: parseFloat(successRate)
      }
    };
  }
  
  countTests(obj) {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        count += this.countTests(obj[key]);
      } else {
        count++;
      }
    }
    return count;
  }
  
  countPassedTests(obj) {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        count += this.countPassedTests(obj[key]);
      } else if (obj[key] === true || (typeof obj[key] === 'number' && obj[key] > 0)) {
        count++;
      }
    }
    return count;
  }
}

// Initialize testing when requested
window.runProgressiveEnhancementTests = function() {
  const tester = new ProgressiveEnhancementTester();
  return tester.runAllTests();
};
```

## Implementation Checklist

### Phase 1: Core Foundation ✅
- [x] Semantic HTML structure with accessibility
- [x] Critical CSS for all browsers  
- [x] Basic form functionality without JavaScript
- [x] Print-friendly styles
- [x] Server-side rendering support

### Phase 2: Progressive Enhancement ✅
- [x] CSS Grid/Flexbox with fallbacks
- [x] JavaScript feature detection
- [x] Enhanced form interactions
- [x] Real-time updates with WebSocket/polling fallback
- [x] Local storage for preferences

### Phase 3: Advanced Features ✅
- [x] Service Worker implementation
- [x] Web Workers for data processing
- [x] IndexedDB for offline caching
- [x] Advanced API integrations
- [x] Performance optimizations

### Phase 4: Testing & Validation ✅
- [x] Automated testing suite
- [x] Cross-browser validation
- [x] Accessibility compliance testing
- [x] Performance monitoring
- [x] Progressive enhancement validation

## Conclusion

This progressive enhancement implementation ensures QuartzIQ's intelligent analytics platform provides optimal functionality across all browser capabilities while maintaining accessibility, performance, and user experience standards. The three-layer approach guarantees that core functionality remains available even in the most constrained environments, while modern browsers benefit from advanced features and optimizations.

**Key Benefits:**
- ✅ Universal browser compatibility
- ✅ Graceful degradation for older browsers  
- ✅ Enhanced experience for modern browsers
- ✅ Accessibility compliance across all layers
- ✅ Offline functionality with Service Workers
- ✅ Performance optimization per capability level
- ✅ Comprehensive testing and validation

---

*Implementation Guide Version: 1.0*  
*Last Updated: 2025-08-28*  
*Phase 5 Progressive Enhancement: Complete*