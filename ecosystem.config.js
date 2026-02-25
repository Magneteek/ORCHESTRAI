/**
 * PM2 Ecosystem Configuration for ORCHESTRAI
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 stop ecosystem.config.js
 *   pm2 restart ecosystem.config.js
 *   pm2 logs
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'orchestrai-triggers',
      script: './orchestrai-trigger-system/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        TRIGGER_PORT: 5502,
        MAX_CONCURRENT: 5
      },
      error_file: './logs/trigger-system-error.log',
      out_file: './logs/trigger-system-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10
    }

    // Future services will be added here:
    /*
    {
      name: 'orchestrai-infrastructure',
      script: './orchestrai-infrastructure/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        INFRA_PORT: 5501
      },
      error_file: './logs/infrastructure-error.log',
      out_file: './logs/infrastructure-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'orchestrai-dashboard',
      script: './orchestrai-dashboard/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        DASHBOARD_PORT: 5503
      },
      error_file: './logs/dashboard-error.log',
      out_file: './logs/dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
    */
  ]
};
