const { chromium } = require('playwright');
const path = require('path');

async function testWebsite() {
    console.log('🎯 Starting visual test with Playwright...');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to the local site
        await page.goto('http://localhost:8083/index-professional.html');
        console.log('📄 Page loaded');
        
        // Wait for content to load
        await page.waitForTimeout(2000);
        
        // Take screenshot of the hero section
        const heroSection = await page.locator('#home');
        await heroSection.screenshot({ path: 'hero-section-test.png' });
        console.log('📸 Screenshot taken: hero-section-test.png');
        
        // Check if WebGL canvas exists
        const canvas = await page.locator('#dental-hero-canvas');
        const canvasExists = await canvas.count() > 0;
        console.log(`🎨 WebGL Canvas exists: ${canvasExists}`);
        
        if (canvasExists) {
            const canvasStyle = await canvas.evaluate(el => {
                const computed = window.getComputedStyle(el);
                return {
                    background: computed.background,
                    position: computed.position,
                    zIndex: computed.zIndex,
                    display: computed.display
                };
            });
            console.log('🎨 Canvas styles:', canvasStyle);
        }
        
        // Check floating cards positioning
        const cards = await page.locator('.float-element').all();
        console.log(`📦 Floating cards found: ${cards.length}`);
        
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const position = await card.evaluate(el => {
                const rect = el.getBoundingClientRect();
                const computed = window.getComputedStyle(el);
                return {
                    top: rect.top,
                    left: rect.left,
                    bottom: rect.bottom,
                    right: rect.right,
                    position: computed.position,
                    zIndex: computed.zIndex
                };
            });
            console.log(`📦 Card ${i + 1} position:`, position);
        }
        
        // Check if cards are overlapping
        let overlapping = false;
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                const rect1 = await cards[i].boundingBox();
                const rect2 = await cards[j].boundingBox();
                
                if (rect1 && rect2) {
                    const overlap = !(rect1.x + rect1.width < rect2.x || 
                                    rect2.x + rect2.width < rect1.x || 
                                    rect1.y + rect1.height < rect2.y || 
                                    rect2.y + rect2.height < rect1.y);
                    
                    if (overlap) {
                        overlapping = true;
                        console.log(`⚠️ Cards ${i + 1} and ${j + 1} are overlapping!`);
                    }
                }
            }
        }
        
        if (!overlapping) {
            console.log('✅ No card overlapping detected');
        }
        
        // Full page screenshot
        await page.screenshot({ path: 'full-page-test.png', fullPage: true });
        console.log('📸 Full page screenshot: full-page-test.png');
        
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await browser.close();
        console.log('🏁 Test completed');
    }
}

testWebsite().catch(console.error);