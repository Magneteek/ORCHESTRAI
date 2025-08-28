/*
=============================================
ARTICLE.JS - DENTAL 3D PRINTING HUB
=============================================
Enhanced article functionality for educational content
Reading progress, table of contents, interactive elements
ORCHESTRAI Content Enhancement Agent
=============================================
*/

'use strict';

// ===== ARTICLE-SPECIFIC FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    initializeArticleFeatures();
});

function initializeArticleFeatures() {
    console.log('🎯 Initializing article features...');
    
    // Core article features
    initializeTableOfContents();
    initializeReadingProgress();
    initializeArticleAnimations();
    initializeSocialSharing();
    initializeBookmarkFunction();
    initializePrintFunction();
    
    console.log('✅ Article features initialized successfully');
}

// ===== TABLE OF CONTENTS =====
function initializeTableOfContents() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    if (!tocLinks.length || !contentSections.length) return;

    // Active section tracking
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                updateActiveTocItem(entry.target.id);
            }
        });
    }, {
        rootMargin: '-120px 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    contentSections.forEach(section => {
        observer.observe(section);
    });

    // Click handling
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            updateActiveTocItem(targetId);
        });
    });
}

function updateActiveTocItem(activeId) {
    const tocLinks = document.querySelectorAll('.toc-link');
    
    tocLinks.forEach(link => {
        const href = link.getAttribute('href').substring(1);
        if (href === activeId) {
            link.classList.add('active');
            
            // Smooth scroll TOC into view if needed
            if (window.innerWidth >= 1024) {
                const tocContainer = link.closest('.toc-sticky');
                if (tocContainer) {
                    const linkRect = link.getBoundingClientRect();
                    const containerRect = tocContainer.getBoundingClientRect();
                    
                    if (linkRect.bottom > containerRect.bottom || linkRect.top < containerRect.top) {
                        link.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        } else {
            link.classList.remove('active');
        }
    });
}

function scrollToSection(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Update URL without triggering navigation
        if (history.replaceState) {
            history.replaceState(null, null, '#' + targetId);
        }
    }
}

// ===== READING PROGRESS =====
function initializeReadingProgress() {
    const progressBar = document.getElementById('reading-progress');
    const articleBody = document.querySelector('.article-body');
    
    if (!progressBar || !articleBody) return;

    function updateReadingProgress() {
        const articleTop = articleBody.offsetTop;
        const articleHeight = articleBody.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        
        const articleStart = articleTop - windowHeight / 2;
        const articleEnd = articleTop + articleHeight - windowHeight / 2;
        const totalReadingHeight = articleEnd - articleStart;
        
        let progress = 0;
        
        if (scrollTop >= articleStart && scrollTop <= articleEnd) {
            progress = ((scrollTop - articleStart) / totalReadingHeight) * 100;
        } else if (scrollTop > articleEnd) {
            progress = 100;
        }
        
        progress = Math.max(0, Math.min(100, progress));
        progressBar.style.setProperty('--progress', progress + '%');
        
        // Update progress bar visual
        if (progressBar.querySelector('::after')) {
            progressBar.style.setProperty('--progress-width', progress + '%');
        } else {
            // Fallback for browsers without ::after support
            progressBar.style.background = `linear-gradient(90deg, var(--primary-color) ${progress}%, var(--gray-200) ${progress}%)`;
        }
    }
    
    // Add CSS custom property support
    if (!document.querySelector('#progress-styles')) {
        const style = document.createElement('style');
        style.id = 'progress-styles';
        style.textContent = `
            .progress-bar {
                --progress-width: 0%;
                position: relative;
                overflow: hidden;
            }
            .progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: var(--progress-width);
                background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // Throttled scroll listener
    let ticking = false;
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateReadingProgress);
            ticking = true;
            setTimeout(() => { ticking = false; }, 16);
        }
    }

    window.addEventListener('scroll', requestTick);
    window.addEventListener('resize', requestTick);
    
    // Initial update
    updateReadingProgress();
}

// ===== ARTICLE ANIMATIONS =====
function initializeArticleAnimations() {
    // Animate elements as they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Add animation class
                element.classList.add('animate-in');
                
                // Handle special element types
                if (element.classList.contains('specs-grid') || 
                    element.classList.contains('components-grid') ||
                    element.classList.contains('factors-grid')) {
                    animateGridItems(element);
                }
                
                if (element.classList.contains('timeline')) {
                    animateTimelineItems(element);
                }
                
                if (element.classList.contains('comparison-table')) {
                    animateTableRows(element);
                }
                
                // Stop observing this element
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe animatable elements
    const animatableElements = document.querySelectorAll(`
        .key-insight,
        .cost-breakdown,
        .technology-comparison,
        .expert-quote,
        .success-story,
        .specs-grid,
        .components-grid,
        .factors-grid,
        .timeline,
        .comparison-table,
        .download-resource
    `);

    animatableElements.forEach(el => observer.observe(el));
}

function animateGridItems(container) {
    const items = container.querySelectorAll('.spec-item, .component, .success-factor, .criteria-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
}

function animateTimelineItems(timeline) {
    const items = timeline.querySelectorAll('.timeline-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 50);
        }, index * 200);
    });
}

function animateTableRows(table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        setTimeout(() => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(10px)';
            row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
}

// ===== SOCIAL SHARING =====
function initializeSocialSharing() {
    // Create floating share buttons
    if (!document.querySelector('.article-share-buttons')) {
        createShareButtons();
    }
    
    // Handle share button clicks
    document.addEventListener('click', handleShareClick);
}

function createShareButtons() {
    const shareContainer = document.createElement('div');
    shareContainer.className = 'article-share-buttons';
    shareContainer.innerHTML = `
        <div class="share-toggle">
            <i class="fas fa-share-alt"></i>
        </div>
        <div class="share-menu">
            <button class="share-btn" data-platform="twitter">
                <i class="fab fa-twitter"></i>
            </button>
            <button class="share-btn" data-platform="linkedin">
                <i class="fab fa-linkedin"></i>
            </button>
            <button class="share-btn" data-platform="facebook">
                <i class="fab fa-facebook"></i>
            </button>
            <button class="share-btn" data-platform="copy">
                <i class="fas fa-copy"></i>
            </button>
        </div>
    `;
    
    // Add styles
    const shareStyles = `
        .article-share-buttons {
            position: fixed;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1000;
            display: none;
        }
        
        @media (min-width: 1200px) {
            .article-share-buttons {
                display: block;
            }
        }
        
        .share-toggle {
            width: 50px;
            height: 50px;
            background: var(--primary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        }
        
        .share-toggle:hover {
            background: var(--primary-hover);
            transform: scale(1.1);
        }
        
        .share-menu {
            position: absolute;
            left: 60px;
            top: 0;
            display: flex;
            gap: 10px;
            opacity: 0;
            transform: translateX(-20px);
            transition: all 0.3s ease;
            pointer-events: none;
        }
        
        .share-menu.active {
            opacity: 1;
            transform: translateX(0);
            pointer-events: all;
        }
        
        .share-btn {
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .share-btn:hover {
            transform: scale(1.1);
        }
        
        .share-btn[data-platform="twitter"] { background: #1da1f2; }
        .share-btn[data-platform="linkedin"] { background: #0077b5; }
        .share-btn[data-platform="facebook"] { background: #1877f2; }
        .share-btn[data-platform="copy"] { background: var(--gray-600); }
    `;
    
    if (!document.querySelector('#share-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'share-styles';
        styleEl.textContent = shareStyles;
        document.head.appendChild(styleEl);
    }
    
    document.body.appendChild(shareContainer);
    
    // Toggle functionality
    const toggle = shareContainer.querySelector('.share-toggle');
    const menu = shareContainer.querySelector('.share-menu');
    
    toggle.addEventListener('click', () => {
        menu.classList.toggle('active');
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!shareContainer.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
}

function handleShareClick(e) {
    const shareBtn = e.target.closest('.share-btn');
    if (!shareBtn) return;
    
    e.preventDefault();
    
    const platform = shareBtn.dataset.platform;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.querySelector('.article-title')?.textContent || document.title);
    const description = encodeURIComponent(document.querySelector('.article-subtitle')?.textContent || '');
    
    let shareUrl = '';
    
    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'copy':
            copyToClipboard(window.location.href);
            showShareNotification('Link copied to clipboard!');
            return;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        trackShare(platform);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showShareNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function trackShare(platform) {
    if (typeof gtag === 'function') {
        gtag('event', 'share', {
            'event_category': 'Article Engagement',
            'event_label': platform,
            'article_title': document.querySelector('.article-title')?.textContent || document.title
        });
    }
}

// ===== BOOKMARK FUNCTION =====
function initializeBookmarkFunction() {
    const bookmarkBtn = createBookmarkButton();
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', toggleBookmark);
        updateBookmarkState();
    }
}

function createBookmarkButton() {
    const articleHeader = document.querySelector('.article-header .container');
    if (!articleHeader) return null;
    
    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'bookmark-btn';
    bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Bookmark';
    bookmarkBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: var(--white);
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    bookmarkBtn.addEventListener('mouseenter', () => {
        bookmarkBtn.style.background = 'var(--primary-color)';
        bookmarkBtn.style.color = 'var(--white)';
    });
    
    bookmarkBtn.addEventListener('mouseleave', () => {
        const isBookmarked = isPageBookmarked();
        if (!isBookmarked) {
            bookmarkBtn.style.background = 'var(--white)';
            bookmarkBtn.style.color = 'var(--primary-color)';
        }
    });
    
    articleHeader.style.position = 'relative';
    articleHeader.appendChild(bookmarkBtn);
    
    return bookmarkBtn;
}

function toggleBookmark() {
    const url = window.location.href;
    const title = document.querySelector('.article-title')?.textContent || document.title;
    const isBookmarked = isPageBookmarked();
    
    if (isBookmarked) {
        removeBookmark(url);
        showShareNotification('Bookmark removed');
    } else {
        addBookmark(url, title);
        showShareNotification('Article bookmarked!');
    }
    
    updateBookmarkState();
    trackBookmark(!isBookmarked);
}

function isPageBookmarked() {
    const bookmarks = JSON.parse(localStorage.getItem('dental3d_bookmarks') || '[]');
    return bookmarks.some(bookmark => bookmark.url === window.location.href);
}

function addBookmark(url, title) {
    const bookmarks = JSON.parse(localStorage.getItem('dental3d_bookmarks') || '[]');
    bookmarks.push({
        url: url,
        title: title,
        timestamp: Date.now()
    });
    localStorage.setItem('dental3d_bookmarks', JSON.stringify(bookmarks));
}

function removeBookmark(url) {
    const bookmarks = JSON.parse(localStorage.getItem('dental3d_bookmarks') || '[]');
    const filtered = bookmarks.filter(bookmark => bookmark.url !== url);
    localStorage.setItem('dental3d_bookmarks', JSON.stringify(filtered));
}

function updateBookmarkState() {
    const bookmarkBtn = document.querySelector('.bookmark-btn');
    if (!bookmarkBtn) return;
    
    const isBookmarked = isPageBookmarked();
    const icon = bookmarkBtn.querySelector('i');
    
    if (isBookmarked) {
        icon.className = 'fas fa-bookmark';
        bookmarkBtn.style.background = 'var(--primary-color)';
        bookmarkBtn.style.color = 'var(--white)';
        bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Bookmarked';
    } else {
        icon.className = 'far fa-bookmark';
        bookmarkBtn.style.background = 'var(--white)';
        bookmarkBtn.style.color = 'var(--primary-color)';
        bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Bookmark';
    }
}

function trackBookmark(added) {
    if (typeof gtag === 'function') {
        gtag('event', added ? 'bookmark_add' : 'bookmark_remove', {
            'event_category': 'Article Engagement',
            'article_title': document.querySelector('.article-title')?.textContent || document.title
        });
    }
}

// ===== PRINT FUNCTION =====
function initializePrintFunction() {
    // Add print button to article
    const articleMeta = document.querySelector('.article-meta');
    if (articleMeta) {
        const printBtn = document.createElement('button');
        printBtn.className = 'print-btn';
        printBtn.innerHTML = '<i class="fas fa-print"></i> Print Article';
        printBtn.style.cssText = `
            background: var(--gray-100);
            border: none;
            color: var(--gray-700);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        `;
        
        printBtn.addEventListener('click', printArticle);
        printBtn.addEventListener('mouseenter', () => {
            printBtn.style.background = 'var(--gray-200)';
        });
        printBtn.addEventListener('mouseleave', () => {
            printBtn.style.background = 'var(--gray-100)';
        });
        
        articleMeta.appendChild(printBtn);
    }
}

function printArticle() {
    // Create print-optimized version
    const printWindow = window.open('', '_blank');
    const articleTitle = document.querySelector('.article-title')?.textContent || document.title;
    const articleContent = document.querySelector('.article-body')?.innerHTML || '';
    const articleDate = document.querySelector('.publish-date')?.textContent || '';
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${articleTitle}</title>
            <style>
                body {
                    font-family: Georgia, serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1, h2, h3, h4, h5, h6 {
                    color: #000;
                    margin-top: 30px;
                    margin-bottom: 15px;
                }
                h1 {
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                }
                .article-meta {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 30px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #ddd;
                }
                .key-insight, .safety-callout, .expert-quote {
                    background: #f8f9fa;
                    border-left: 4px solid #007bff;
                    padding: 15px;
                    margin: 20px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background: #f8f9fa;
                    font-weight: bold;
                }
                .no-print {
                    display: none !important;
                }
            </style>
        </head>
        <body>
            <h1>${articleTitle}</h1>
            <div class="article-meta">
                <p>Published: ${articleDate}</p>
                <p>Source: ${window.location.href}</p>
            </div>
            ${articleContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
    
    // Track print action
    if (typeof gtag === 'function') {
        gtag('event', 'print_article', {
            'event_category': 'Article Engagement',
            'article_title': articleTitle
        });
    }
}

// ===== ENHANCED INTERACTIONS =====

// Highlight text selection
document.addEventListener('mouseup', function() {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
        // Track text selection for analytics
        if (typeof gtag === 'function') {
            gtag('event', 'text_selection', {
                'event_category': 'Article Engagement',
                'selected_text': selection.toString().substring(0, 100)
            });
        }
    }
});

// Copy quote functionality
document.addEventListener('click', function(e) {
    if (e.target.closest('.expert-quote, .success-story, .expert-perspective')) {
        const quote = e.target.closest('.expert-quote, .success-story, .expert-perspective');
        const quoteText = quote.querySelector('p').textContent;
        const cite = quote.querySelector('cite')?.textContent || '';
        
        // Add copy button if not already present
        if (!quote.querySelector('.copy-quote-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-quote-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255,255,255,0.9);
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 6px;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            quote.style.position = 'relative';
            quote.appendChild(copyBtn);
            
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                copyToClipboard(`"${quoteText}" ${cite}`);
                showShareNotification('Quote copied to clipboard!');
                
                if (typeof gtag === 'function') {
                    gtag('event', 'quote_copy', {
                        'event_category': 'Article Engagement'
                    });
                }
            });
        }
        
        // Show copy button on hover
        const copyBtn = quote.querySelector('.copy-quote-btn');
        if (copyBtn) {
            copyBtn.style.opacity = '1';
            setTimeout(() => {
                if (copyBtn) copyBtn.style.opacity = '0';
            }, 3000);
        }
    }
});

// Smooth reveal animations for complex elements
function initializeRevealAnimations() {
    const revealElements = document.querySelectorAll('.technology-comparison, .tco-analysis, .roi-framework');
    
    revealElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    revealElements.forEach(el => revealObserver.observe(el));
}

// Initialize reveal animations
document.addEventListener('DOMContentLoaded', initializeRevealAnimations);

// ===== ACCESSIBILITY ENHANCEMENTS =====
document.addEventListener('keydown', function(e) {
    // ESC key to close any open menus
    if (e.key === 'Escape') {
        const shareMenu = document.querySelector('.share-menu.active');
        if (shareMenu) {
            shareMenu.classList.remove('active');
        }
    }
    
    // Arrow key navigation for TOC
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const focusedTocLink = document.activeElement;
        if (focusedTocLink.classList.contains('toc-link')) {
            e.preventDefault();
            const tocLinks = Array.from(document.querySelectorAll('.toc-link'));
            const currentIndex = tocLinks.indexOf(focusedTocLink);
            
            if (e.key === 'ArrowUp' && currentIndex > 0) {
                tocLinks[currentIndex - 1].focus();
            } else if (e.key === 'ArrowDown' && currentIndex < tocLinks.length - 1) {
                tocLinks[currentIndex + 1].focus();
            }
        }
    }
});

// Focus management for screen readers
document.addEventListener('focusin', function(e) {
    if (e.target.classList.contains('toc-link')) {
        e.target.style.outline = '2px solid var(--primary-color)';
        e.target.style.outlineOffset = '2px';
    }
});

document.addEventListener('focusout', function(e) {
    if (e.target.classList.contains('toc-link')) {
        e.target.style.outline = '';
        e.target.style.outlineOffset = '';
    }
});

console.log('🎯 Article enhancement system loaded successfully');

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateActiveTocItem,
        scrollToSection,
        copyToClipboard,
        isPageBookmarked,
        addBookmark,
        removeBookmark
    };
}