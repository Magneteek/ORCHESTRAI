const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Set a larger viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    await page.goto('file:///Users/kris/CLAUDEtools/ORCHESTRAI/projects/dental-3d-printing-hub/website/index-v2.html');
    
    console.log('📸 Taking full page screenshot...');
    
    // Get the full page height
    const fullHeight = await page.evaluate(() => {
        return Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
    });
    
    console.log(`📏 Full page height: ${fullHeight}px`);
    
    // Take a full page screenshot
    await page.screenshot({ 
        path: 'v2-complete-debug.png', 
        fullPage: true
    });
    
    console.log('✅ Full page screenshot saved as v2-complete-debug.png');
    
    // Also take screenshots of individual sections
    const sections = await page.$$('section');
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const id = await section.getAttribute('id') || `section-${i + 1}`;
        const boundingBox = await section.boundingBox();
        
        if (boundingBox && boundingBox.height > 0) {
            await section.screenshot({ path: `section-${i + 1}-${id}.png` });
            console.log(`📸 Screenshot saved for section ${i + 1} (${id}): ${boundingBox.width}x${boundingBox.height}`);
        }
    }
    
    await browser.close();
})();