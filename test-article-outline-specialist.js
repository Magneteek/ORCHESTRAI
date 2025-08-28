const ArticleOutlineSpecialist = require('./orchestrai-domains/content-enhanced/agents/article-outline-specialist');

// Mock crystalline memory for testing
class MockCrystallineMemory {
    constructor() {
        this.data = new Map();
    }
    
    storeIntelligence(key, data) {
        this.data.set(key, data);
    }
    
    retrieveIntelligence(key) {
        return this.data.get(key);
    }
}

// Test the Article Outline Specialist
async function testArticleOutlineSpecialist() {
    console.log('🚀 Testing Article Outline Specialist Agent');
    console.log('=' .repeat(50));
    
    const crystallineMemory = new MockCrystallineMemory();
    const outlineSpecialist = new ArticleOutlineSpecialist(crystallineMemory);
    
    // Sample task data for dental 3D printer pillar content
    const task = {
        taskId: 'test-outline-001',
        contentType: 'comprehensive_guide',
        targetKeyword: 'dental 3d printing',
        searchVolume: 1300,
        keywordDifficulty: 36,
        targetAudience: 'dental professionals',
        contentObjectives: [
            'Establish technical authority',
            'Create comprehensive resource',
            'Support long-tail keywords',
            'Drive qualified traffic'
        ]
    };
    
    const data = {
        title: 'Complete Guide to Dental 3D Printing: From Basics to Advanced Applications',
        targetWordCount: 8000,
        readabilityLevel: 'grade-10-12',
        contentType: 'comprehensive_guide',
        targetAudience: 'dental professionals',
        secondaryKeywords: [
            'dental 3d printer',
            'dental 3d printing applications', 
            'SLA dental printing',
            'dental 3d printing materials',
            'biocompatible dental resin'
        ],
        competitorAnalysis: {
            topCompetitors: ['formlabs.com', '3dsystems.com', 'asiga.com'],
            contentGaps: ['implementation costs', 'ROI analysis', 'workflow integration'],
            averageContentLength: 3500
        },
        targetMarket: 'US dental professionals',
        businessGoals: [
            'Lead generation',
            'Brand authority',
            'Educational resource'
        ]
    };
    
    try {
        console.log('\n📝 Creating detailed article outline...');
        const outline = await outlineSpecialist.createDetailedArticleOutline(task, data);
        
        console.log('\n✅ Article Outline Generated Successfully!');
        console.log('\n📊 Outline Summary:');
        console.log(`- Total Sections: ${outline.sections ? outline.sections.length : 'N/A'}`);
        console.log(`- Estimated Word Count: ${outline.estimatedWordCount || 'N/A'}`);
        console.log(`- SEO Score: ${outline.seoOptimizationScore || 'N/A'}`);
        
        // Display detailed outline structure
        if (outline.sections) {
            console.log('\n📋 Detailed Section Breakdown:');
            outline.sections.forEach((section, index) => {
                console.log(`\n${index + 1}. ${section.heading} (${section.wordCount} words)`);
                console.log(`   Content Focus: ${section.contentInstructions}`);
                
                if (section.subsections) {
                    section.subsections.forEach((subsection, subIndex) => {
                        console.log(`   ${index + 1}.${subIndex + 1} ${subsection.heading} (${subsection.wordCount} words)`);
                        if (subsection.subSubsections) {
                            subsection.subSubsections.forEach((subSub, subSubIndex) => {
                                console.log(`       ${index + 1}.${subIndex + 1}.${subSubIndex + 1} ${subSub.heading} (${subSub.wordCount} words)`);
                            });
                        }
                    });
                }
            });
        }
        
        // Save the outline to a file
        const fs = require('fs');
        const outputPath = '/Users/kris/CLAUDEtools/ORCHESTRAI/projects/dental-3d-printer-consolidated-analysis/deliverables/content/detailed-article-outline-example.json';
        fs.writeFileSync(outputPath, JSON.stringify(outline, null, 2));
        
        console.log(`\n💾 Detailed outline saved to: ${outputPath}`);
        
        return outline;
        
    } catch (error) {
        console.error('\n❌ Error testing Article Outline Specialist:', error.message);
        throw error;
    }
}

// Run the test
if (require.main === module) {
    testArticleOutlineSpecialist()
        .then(() => {
            console.log('\n🎉 Article Outline Specialist test completed successfully!');
        })
        .catch(error => {
            console.error('\n💥 Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testArticleOutlineSpecialist };