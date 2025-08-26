#!/usr/bin/env node

// MCP Auto-Sync Testing Server
// Standalone server for managing automated MCP testing

const TestingAPI = require('../api/testing-endpoints');

async function startTestingServer() {
  console.log('🧪 Starting MCP Auto-Sync Testing Server...');
  
  try {
    const testingAPI = new TestingAPI(3002);
    await testingAPI.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down Testing Server...');
      
      if (testingAPI.tester) {
        await testingAPI.tester.stopAutoSync();
      }
      
      console.log('✅ Testing Server shut down gracefully');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down Testing Server...');
      
      if (testingAPI.tester) {
        await testingAPI.tester.stopAutoSync();
      }
      
      console.log('✅ Testing Server shut down gracefully');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start Testing Server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startTestingServer();
}

module.exports = { startTestingServer };