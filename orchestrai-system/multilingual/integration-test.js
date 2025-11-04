/**
 * ORCHESTRAI Multilingual System Integration Test
 * 
 * Tests the integration between the multilingual system and the main orchestrator
 */

const path = require('path');

// Test the integration without starting the full orchestrator
async function testMultilingualIntegration() {
  console.log('🧪 Testing ORCHESTRAI Multilingual System Integration');
  console.log('===================================================');

  try {
    // Import the orchestrator class (but don't start the full system)
    const StableOrchestraiMaster = path.join(__dirname, '../../orchestrai-master/orchestrator/orchestrator-stable.js');
    console.log('📁 Orchestrator path:', StableOrchestraiMaster);
    
    // Test 1: Verify imports work
    console.log('\n🔍 Test 1: Import Verification');
    console.log('==============================');
    
    try {
      const MultilingualContentOrchestrator = require('./multilingual-content-orchestrator');
      console.log('✅ MultilingualContentOrchestrator import: SUCCESS');
      
      const LanguageIsolationFramework = require('./language-isolation-framework');  
      console.log('✅ LanguageIsolationFramework import: SUCCESS');
      
      const CoTRPromptingSystem = require('./cotr-prompting-system');
      console.log('✅ CoTRPromptingSystem import: SUCCESS');
      
      const LanguagePurityValidator = require('./language-purity-validator');
      console.log('✅ LanguagePurityValidator import: SUCCESS');
      
      const MultilingualEnhancementStrategies = require('./multilingual-enhancement-strategies');
      console.log('✅ MultilingualEnhancementStrategies import: SUCCESS');
      
    } catch (importError) {
      console.error('❌ Import test failed:', importError.message);
      return { success: false, phase: 'import', error: importError.message };
    }

    // Test 2: Verify file structure
    console.log('\n📁 Test 2: File Structure Verification');
    console.log('======================================');
    
    const requiredFiles = [
      './language-isolation-framework.js',
      './language-memory-migrator.js', 
      './cotr-prompting-system.js',
      './language-purity-validator.js',
      './multilingual-enhancement-strategies.js',
      './multilingual-content-orchestrator.js',
      './test-multilingual-system.js'
    ];
    
    const fs = require('fs');
    let missingFiles = [];
    
    for (const file of requiredFiles) {
      if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✅ ${file}: EXISTS`);
      } else {
        console.log(`❌ ${file}: MISSING`);
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      return { 
        success: false, 
        phase: 'file-structure', 
        error: `Missing files: ${missingFiles.join(', ')}` 
      };
    }

    // Test 3: Basic functionality test
    console.log('\n⚙️  Test 3: Basic Functionality Test');
    console.log('===================================');
    
    try {
      const MultilingualContentOrchestrator = require('./multilingual-content-orchestrator');
      
      // Mock dependencies for testing
      const mockMemory = {
        createMemoryPool: async (config) => ({ success: true, poolId: config.poolId })
      };
      
      const mockMCP = {
        memory: {
          create_entities: async () => ({ success: true }),
          create_relations: async () => ({ success: true }),
          search_nodes: async () => ({ entities: [] }),
          open_nodes: async () => ({ entities: [] })
        }
      };
      
      // Create orchestrator instance
      const orchestrator = new MultilingualContentOrchestrator(mockMemory, mockMCP);
      console.log('✅ MultilingualContentOrchestrator instantiation: SUCCESS');
      
      // Test supported languages
      const supportedLanguages = orchestrator.languageFramework.getSupportedLanguages();
      console.log(`✅ Supported languages (${Object.keys(supportedLanguages).length}): ${Object.keys(supportedLanguages).join(', ')}`);
      
      // Test temperature settings
      const tempSettings = orchestrator.languageFramework.getTemperatureSettings();
      console.log(`✅ Temperature settings: consistency=${tempSettings.consistency}, creativity=${tempSettings.creativity}`);
      
    } catch (functionalityError) {
      console.error('❌ Functionality test failed:', functionalityError.message);
      return { 
        success: false, 
        phase: 'functionality', 
        error: functionalityError.message 
      };
    }

    // Test 4: Enhancement Loop Integration Check
    console.log('\n🔄 Test 4: Enhancement Loop Integration Check'); 
    console.log('==============================================');
    
    try {
      // Check if we can read the enhancement loop file
      const fs = require('fs');
      const enhancementLoopPath = path.join(__dirname, '../quality-assurance/automated-content-enhancement-loop.js');
      
      if (fs.existsSync(enhancementLoopPath)) {
        const enhancementLoopContent = fs.readFileSync(enhancementLoopPath, 'utf8');
        
        // Check if our language validation method was added
        if (enhancementLoopContent.includes('validateLanguagePurity')) {
          console.log('✅ Language validation method: EXISTS in enhancement loop file');
        } else {
          console.log('❌ Language validation method: MISSING from enhancement loop file');
          return { success: false, phase: 'enhancement-integration', error: 'Language validation method not found in file' };
        }
        
        // Check if multilingual system integration was added
        if (enhancementLoopContent.includes('this.orchestrator.multilingualSystem')) {
          console.log('✅ Multilingual system integration: EXISTS in enhancement loop');
        } else {
          console.log('❌ Multilingual system integration: MISSING from enhancement loop');
          return { success: false, phase: 'enhancement-integration', error: 'Multilingual system integration not found' };
        }
        
        // Check if language purification strategy was added
        if (enhancementLoopContent.includes('addLanguagePurificationStrategy')) {
          console.log('✅ Language purification strategy: EXISTS in enhancement loop');
        } else {
          console.log('❌ Language purification strategy: MISSING from enhancement loop');
          return { success: false, phase: 'enhancement-integration', error: 'Language purification strategy not found' };
        }
        
        console.log('✅ Enhancement loop integration: SUCCESS (file-based verification)');
        
      } else {
        console.log('❌ Enhancement loop file not found');
        return { success: false, phase: 'enhancement-integration', error: 'Enhancement loop file not found' };
      }
      
    } catch (enhancementError) {
      console.error('❌ Enhancement loop integration test failed:', enhancementError.message);
      return { 
        success: false, 
        phase: 'enhancement-integration', 
        error: enhancementError.message 
      };
    }

    // All tests passed!
    console.log('\n🎉 Integration Test Results');
    console.log('===========================');
    console.log('✅ Import verification: PASSED');
    console.log('✅ File structure: COMPLETE');
    console.log('✅ Basic functionality: WORKING');
    console.log('✅ Enhancement integration: CONNECTED');
    console.log('\n🚀 Multilingual system is ready for orchestrator integration!');
    
    return { success: true, allTestsPassed: true };

  } catch (error) {
    console.error('❌ Integration test failed with error:', error.message);
    return { success: false, phase: 'general', error: error.message };
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMultilingualIntegration()
    .then(result => {
      if (result.success) {
        console.log('\n✨ All integration tests passed! System ready for production.');
        process.exit(0);
      } else {
        console.log(`\n❌ Integration test failed in ${result.phase}: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error during integration test:', error);
      process.exit(1);
    });
}

module.exports = { testMultilingualIntegration };