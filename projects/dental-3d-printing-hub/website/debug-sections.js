const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto('file:///Users/kris/CLAUDEtools/ORCHESTRAI/projects/dental-3d-printing-hub/website/index-v2.html');
    
    console.log('🔍 Debugging section visibility...');
    
    // Check all sections
    const sections = await page.$$('section');
    console.log(`📄 Total sections found: ${sections.length}`);
    
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const id = await section.getAttribute('id');
        const classes = await section.getAttribute('class');
        const boundingBox = await section.boundingBox();
        const isVisible = await section.isVisible();
        
        console.log(`\n📋 Section ${i + 1}:`);
        console.log(`   ID: ${id || 'no-id'}`);
        console.log(`   Classes: ${classes || 'no-classes'}`);
        console.log(`   Visible: ${isVisible}`);
        console.log(`   Bounding Box: ${boundingBox ? `${boundingBox.width}x${boundingBox.height}` : 'null'}`);
        
        if (boundingBox) {
            console.log(`   Position: x=${boundingBox.x}, y=${boundingBox.y}`);
        }
    }
    
    // Check specific problematic sections
    const guidesSection = await page.$('#guides');
    if (guidesSection) {
        const guidesBox = await guidesSection.boundingBox();
        const guidesContent = await guidesSection.innerHTML();
        console.log(`\n🎓 Guides section bounding box: ${guidesBox ? `${guidesBox.width}x${guidesBox.height}` : 'null'}`);
        console.log(`🎓 Guides section content length: ${guidesContent.length} chars`);
    } else {
        console.log('\n❌ Guides section not found');
    }
    
    await browser.close();
})();