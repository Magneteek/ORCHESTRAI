const { chromium } = require('playwright');

async function testV2Website() {
    console.log('🎯 Testing Dental Website V2...');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to V2
        await page.goto('http://localhost:8083/index-v2.html');
        console.log('📄 V2 Page loaded');
        
        // Wait for animations and content
        await page.waitForTimeout(3000);
        
        // Take screenshot of hero section
        const heroSection = await page.locator('.hero');
        await heroSection.screenshot({ path: 'v2-hero-test.png' });
        console.log('📸 V2 Hero screenshot: v2-hero-test.png');
        
        // Test dark mode design
        const bodyStyle = await page.evaluate(() => {
            const body = document.body;
            const computed = window.getComputedStyle(body);
            return {
                background: computed.backgroundColor,
                color: computed.color
            };
        });
        console.log('🎨 Dark mode styling:', bodyStyle);
        
        // Test animated background
        const animatedBg = await page.locator('.animated-bg');
        const bgExists = await animatedBg.count() > 0;
        console.log(`🌟 Animated background exists: ${bgExists}`);
        
        // Test feature cards
        const featureCards = await page.locator('.feature-card').all();
        console.log(`📦 Feature cards found: ${featureCards.length}`);
        
        // Test card hover effects
        if (featureCards.length > 0) {
            await featureCards[0].hover();
            await page.waitForTimeout(500);
            console.log('✨ Tested card hover effect');
        }
        
        // Test navigation
        const navLinks = await page.locator('.nav-links a').all();
        console.log(`🧭 Navigation links found: ${navLinks.length}`);
        
        // Test counter animations
        const counters = await page.locator('.stat-number').all();
        console.log(`🔢 Counter elements found: ${counters.length}`);
        
        // Test gradient text elements
        const gradientTexts = await page.locator('.gradient-text').all();
        console.log(`🌈 Gradient text elements: ${gradientTexts.length}`);
        
        // Test floating elements
        const floatingCards = await page.locator('.floating-card').all();
        console.log(`🎈 Floating cards found: ${floatingCards.length}`);
        
        // Full page screenshot
        await page.screenshot({ path: 'v2-full-page.png', fullPage: true });
        console.log('📸 V2 Full page screenshot: v2-full-page.png');
        
        // Test responsive design
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'v2-tablet.png', fullPage: false });
        console.log('📱 V2 Tablet screenshot: v2-tablet.png');
        
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'v2-mobile.png', fullPage: false });
        console.log('📱 V2 Mobile screenshot: v2-mobile.png');
        
        console.log('✅ V2 Website testing completed successfully!');
        
    } catch (error) {
        console.error('❌ V2 Test error:', error);
    } finally {
        await browser.close();
    }
}

testV2Website().catch(console.error);