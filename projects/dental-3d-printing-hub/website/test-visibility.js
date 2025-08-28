const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto('file:///Users/kris/CLAUDEtools/ORCHESTRAI/projects/dental-3d-printing-hub/website/index-v2.html');
    
    // Check CSS variables
    const cssVars = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        return {
            bgPrimary: styles.getPropertyValue('--bg-primary'),
            bgSecondary: styles.getPropertyValue('--bg-secondary'),
            textPrimary: styles.getPropertyValue('--text-primary'),
            textSecondary: styles.getPropertyValue('--text-secondary')
        };
    });
    
    console.log('🎨 CSS Variables:', cssVars);
    
    // Check guides section specifically
    const guidesSection = await page.$('#guides');
    if (guidesSection) {
        const guidesStyles = await guidesSection.evaluate(el => {
            const styles = getComputedStyle(el);
            return {
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                display: styles.display,
                opacity: styles.opacity,
                visibility: styles.visibility,
                height: styles.height
            };
        });
        console.log('📋 Guides section styles:', guidesStyles);
        
        // Check section-header
        const sectionHeader = await guidesSection.$('.section-header');
        if (sectionHeader) {
            const headerStyles = await sectionHeader.evaluate(el => {
                const styles = getComputedStyle(el);
                return {
                    color: styles.color,
                    opacity: styles.opacity,
                    transform: styles.transform,
                    display: styles.display
                };
            });
            console.log('📄 Section header styles:', headerStyles);
        }
        
        // Check feature cards
        const featureCards = await guidesSection.$$('.feature-card');
        console.log(`🃏 Feature cards found in guides: ${featureCards.length}`);
        
        for (let i = 0; i < featureCards.length; i++) {
            const cardStyles = await featureCards[i].evaluate(el => {
                const styles = getComputedStyle(el);
                const bounds = el.getBoundingClientRect();
                return {
                    backgroundColor: styles.backgroundColor,
                    color: styles.color,
                    opacity: styles.opacity,
                    transform: styles.transform,
                    width: bounds.width,
                    height: bounds.height,
                    visible: bounds.width > 0 && bounds.height > 0
                };
            });
            console.log(`🃏 Card ${i + 1} styles:`, cardStyles);
        }
    }
    
    await browser.close();
})();