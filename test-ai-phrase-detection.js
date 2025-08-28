#!/usr/bin/env node

const AIPhraseDetector = require('./orchestrai-domains/content-enhanced/agents/ai-phrase-detector');

/**
 * Test AI Phrase Detection System
 * 
 * This script tests the AI phrase detection and replacement functionality
 * to ensure our content sounds naturally human-written.
 */

async function testAIPhraseDetection() {
    console.log('🔍 Testing AI Phrase Detection and Human Voice Enhancement...\n');
    
    const detector = new AIPhraseDetector();

    // Test content with many AI-like phrases
    const testContent = `
        In today's fast-paced digital world, it's important to note that dental 3D printing represents a paradigm shift in the dental landscape. This comprehensive guide will delve into the myriad benefits and transformative potential of this cutting-edge technology.

        Furthermore, leveraging advanced 3D printing solutions can streamline your workflow while optimizing patient outcomes. The robust capabilities of these innovative systems facilitate seamless integration with existing dental practices.

        Moreover, studies have shown that utilizing this technology can significantly enhance treatment precision. It's worth noting that the holistic approach to digital dentistry encompasses various facets of modern dental care.

        In conclusion, this revolutionary technology offers a plethora of advantages that can transform your practice. At the end of the day, the comprehensive benefits make it an optimal investment for forward-thinking dental professionals.
    `.trim();

    console.log('📄 Original Content (AI-heavy language):');
    console.log('─'.repeat(50));
    console.log(testContent);
    console.log('─'.repeat(50));

    // Run detection and replacement
    const analysis = detector.detectAndReplaceAILanguage(testContent);

    console.log('\n🤖 AI Detection Analysis:');
    console.log(`   📊 Original AI Risk Score: ${analysis.riskScore}%`);
    console.log(`   🗣️  Improved Human Score: ${analysis.humanScore}%`);
    console.log(`   🔄 Total Replacements: ${analysis.replacements.length}`);

    if (analysis.replacements.length > 0) {
        console.log('\n🔧 Replacements Made:');
        analysis.replacements.forEach((replacement, index) => {
            console.log(`   ${index + 1}. "${replacement.original}" → "${replacement.replacement}" (${replacement.severity})`);
        });
    }

    console.log('\n📄 Enhanced Content (Human-like language):');
    console.log('─'.repeat(50));
    console.log(analysis.humanizedContent || analysis.originalContent);
    console.log('─'.repeat(50));

    // Generate human voice report
    const report = detector.generateHumanVoiceReport(analysis);

    console.log('\n📋 Human Voice Enhancement Report:');
    console.log(`   🎯 Readiness Level: ${report.readinessLevel}`);
    console.log(`   📈 Risk Score Improvement: ${analysis.riskScore}% → Human Score: ${analysis.humanScore}%`);
    
    if (report.recommendations.length > 0) {
        console.log('   💡 Recommendations:');
        report.recommendations.forEach((rec, index) => {
            console.log(`      ${index + 1}. ${rec}`);
        });
    }

    console.log('\n✅ AI Phrase Detection Test Completed!');
    
    // Test edge cases
    await testEdgeCases(detector);
}

async function testEdgeCases(detector) {
    console.log('\n🧪 Testing Edge Cases...');

    const testCases = [
        {
            name: 'Already Human-like Content',
            content: 'This is simple, natural content. No fancy words here. Just plain talking that people actually use.'
        },
        {
            name: 'Mixed AI and Human Content',
            content: 'Hey there! So you want to leverage cutting-edge technology? Cool. But let\'s keep it real about what actually works.'
        },
        {
            name: 'Technical Content',
            content: 'The comprehensive analysis reveals that the robust implementation facilitates optimal performance metrics.'
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n   🔬 ${testCase.name}:`);
        const analysis = detector.detectAndReplaceAILanguage(testCase.content);
        console.log(`      Risk Score: ${analysis.riskScore}% → Human Score: ${analysis.humanScore}%`);
        console.log(`      Replacements: ${analysis.replacements.length}`);
        if (analysis.replacements.length > 0) {
            const topReplacements = analysis.replacements.slice(0, 3);
            topReplacements.forEach(rep => {
                console.log(`         "${rep.original}" → "${rep.replacement}"`);
            });
        }
    }

    console.log('\n✅ Edge Case Testing Completed!');
}

// Run the test
if (require.main === module) {
    testAIPhraseDetection().catch(console.error);
}

module.exports = { testAIPhraseDetection };