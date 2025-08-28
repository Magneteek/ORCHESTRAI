/**
 * AI Phrase Detector and Human Voice Enhancer
 * 
 * This module detects and replaces commonly used AI phrases and patterns
 * to ensure content sounds naturally human-written rather than AI-generated.
 * 
 * Based on 2024-2025 research from GPTZero, Originality.AI, and detection studies
 */

class AIPhraseDetector {
    constructor() {
        // Most overused AI words (ranked by frequency difference vs human writing)
        // Complete comprehensive database integrated from user input
        this.aiDeadGiveaways = {
            // Top tier - 10x+ more likely in AI content (HIGH RISK WORDS)
            highRisk: [
                // Core AI dead giveaways
                'delve', 'leverage', 'utilize', 'paradigm', 'plethora', 'myriad', 'robust', 'comprehensive',
                'holistic', 'synergy', 'confluence', 'transformative', 'pivotal', 'nuanced', 'intricate',
                'multifaceted', 'dynamic', 'innovative', 'streamline', 'optimize', 'maximize', 'enhance',
                'elevate', 'seamless', 'cutting-edge', 'state-of-the-art', 'game-changer', 'treasure-trove',
                
                // Creative writing cliches (high risk)
                'breathtaking', 'mesmerizing', 'captivating', 'spellbinding', 'enchanting', 'riveting',
                'compelling', 'gripping', 'enthralling', 'fascinating', 'intriguing', 'thought-provoking',
                'mind-boggling', 'awe-inspiring', 'jaw-dropping', 'stunning', 'remarkable',
                
                // Overused descriptors
                'quintessential', 'ubiquitous', 'indispensable', 'exemplary', 'stellar', 'extraordinary',
                'phenomenal', 'unprecedented', 'unparalleled', 'incomparable', 'cornucopia', 'fastidious',
                'meticulous', 'sophisticated', 'elaborate', 'exquisite', 'impeccable', 'flawless',
                
                // Corporate jargon (high risk)
                'revolutionary', 'disruptive', 'scalable', 'sustainable', 'ecosystem', 'infrastructure',
                'strategic', 'tactical', 'operational', 'synergistic', 'paradigm-shifting'
            ],

            // Medium risk - 5x+ more likely in AI content (MEDIUM RISK WORDS)
            mediumRisk: [
                // Context and framework words
                'landscape', 'evolving', 'context', 'insight', 'perspective', 'framework', 'facet',
                'intricacies', 'iterative', 'underpinning', 'spectrum', 'trajectory', 'tapestry', 'realm',
                'endeavor', 'foster', 'facilitate', 'encompasses', 'embark', 'navigate', 'cornerstone',
                'catalyst', 'pioneer', 'spearhead', 'culminate', 'articulate',
                
                // Academic formality terms
                'abundance', 'multitude', 'array', 'gamut', 'breadth', 'depth', 'notably', 'thus',
                'subsequently', 'accordingly', 'nonetheless', 'plausible', 'conceivable', 'feasible',
                'viable', 'pertinent', 'inherent', 'intrinsic', 'predominant', 'prevalent',
                
                // Overused transitions
                'furthermore', 'moreover', 'however', 'therefore', 'additionally', 'consequently',
                'nevertheless', 'nonetheless', 'hence', 'thus', 'thereby', 'wherein',
                
                // Business and technical terms
                'implementation', 'integration', 'optimization', 'functionality', 'capability',
                'scalability', 'efficiency', 'effectiveness', 'methodology', 'utilization'
            ],

            // Lower risk but still overused (LOW RISK WORDS)
            lowRisk: [
                // Intensity and importance words
                'significant', 'substantial', 'considerable', 'notable', 'remarkable', 'exceptional',
                'outstanding', 'crucial', 'vital', 'essential', 'fundamental', 'paramount', 'imperative',
                'pertinent', 'relevant', 'applicable', 'viable', 'feasible', 'optimal', 'efficient',
                
                // Quality and assessment words
                'adequate', 'sufficient', 'appropriate', 'suitable', 'beneficial', 'advantageous',
                'valuable', 'worthwhile', 'meaningful', 'purposeful', 'effective', 'successful',
                
                // Common overused adjectives
                'various', 'different', 'multiple', 'several', 'numerous', 'diverse', 'distinct',
                'unique', 'specific', 'particular', 'certain', 'general', 'overall', 'comprehensive'
            ]
        };

        // AI phrase patterns that are dead giveaways - COMPREHENSIVE DATABASE
        this.aiPhrasePatterns = {
            // Phrases 100+ times more likely in AI content (DEAD GIVEAWAY PHRASES)
            deadGiveaways: [
                // Direct AI references
                /as an ai language model/gi,
                /my training data/gi,
                /i don't have real-time/gi,
                /i cannot browse/gi,
                /as of my last update/gi,
                
                // Academic phrases
                /objective study aimed/gi,
                /research needed to understand/gi,
                /despite facing/gi
            ],

            // Overused transitional phrases (TIME/CONTEXT OPENERS)
            transitions: [
                /in today's (fast-paced|digital|modern|competitive|ever-changing|dynamic|rapidly evolving) (world|age|landscape|environment|era|marketplace)/gi,
                /in today's modern age/gi,
                /in the (ever-evolving|rapidly changing|dynamic|fast-paced) world of/gi,
                /in this (digital age|modern era|technological landscape|interconnected world)/gi,
                /in an era (where|of|characterized by)/gi,
                /in our (modern society|digital world|interconnected age)/gi,
                
                // Formal transitions
                /furthermore/gi,
                /moreover/gi,
                /additionally/gi,
                /however/gi,
                /nevertheless/gi,
                /consequently/gi,
                /therefore/gi,
                /thus/gi,
                /hence/gi,
                /accordingly/gi,
                /subsequently/gi,
                /nonetheless/gi
            ],

            // Note-taking language patterns
            noteTaking: [
                /it's important to note that/gi,
                /it's worth noting that/gi,
                /it stands to reason that/gi,
                /one might consider/gi,
                /it's crucial to understand/gi,
                /it's essential to recognize/gi,
                /it should be noted that/gi,
                /one should bear in mind/gi,
                /it's imperative to realize/gi
            ],

            // Hedging language (shows AI uncertainty)
            hedging: [
                /to some extent/gi,
                /in many cases/gi,
                /it can be argued/gi,
                /arguably/gi,
                /one could argue/gi,
                /it might be suggested/gi,
                /perhaps it's fair to say/gi,
                /it's reasonable to assume/gi,
                /one might suggest/gi,
                /it's plausible to think/gi,
                /it's conceivable that/gi
            ],

            // Overused conclusion patterns
            conclusions: [
                /in conclusion/gi,
                /to sum up/gi,
                /to summarize/gi,
                /ultimately/gi,
                /in summary/gi,
                /all in all/gi,
                /in the final analysis/gi,
                /to conclude/gi,
                /in closing/gi,
                /to wrap up/gi,
                /at the end of the day/gi,
                /when all is said and done/gi
            ],

            // Authority claims without substance (FAKE AUTHORITY CLAIMS)
            authorities: [
                /studies have shown/gi,
                /experts agree/gi,
                /research indicates/gi,
                /it is widely accepted/gi,
                /scientists believe/gi,
                /data suggests/gi,
                /research demonstrates/gi,
                /evidence suggests/gi,
                /experts in the field/gi,
                /leading researchers/gi,
                /according to studies/gi
            ],

            // Corporate speak (MEANINGLESS BUSINESS PHRASES)
            corporate: [
                /here's why this matters/gi,
                /the key takeaway/gi,
                /bottom line/gi,
                /at scale/gi,
                /best practices/gi,
                /low-hanging fruit/gi,
                /circle back/gi,
                /touch base/gi,
                /synergistic/gi,
                /paradigm shift/gi,
                /move the needle/gi,
                /drill down/gi,
                /deep dive/gi,
                /think outside the box/gi,
                /game changer/gi,
                /disruptive innovation/gi
            ],

            // Forbidden sentence starters
            forbiddenStarters: [
                /^(In order to|With regards to|In terms of|From the perspective of|In the context of|For the purpose of|In relation to|With respect to|In consideration of|Taking into account)/gi,
                /^(It is important to note|It should be emphasized|It must be understood|It is crucial to recognize|It is essential to realize)/gi,
                /^(When it comes to|In the realm of|In the field of|Within the scope of|In the domain of)/gi
            ],

            // Overused descriptive phrases
            descriptive: [
                /vast array of/gi,
                /wide range of/gi,
                /broad spectrum of/gi,
                /comprehensive suite of/gi,
                /diverse portfolio of/gi,
                /extensive collection of/gi,
                /impressive array of/gi,
                /remarkable variety of/gi
            ]
        };

        // Human-like replacements for AI phrases - COMPREHENSIVE DATABASE
        this.humanReplacements = {
            // HIGH RISK word replacements
            'delve': ['explore', 'dig into', 'look at', 'examine', 'dive into', 'check out'],
            'leverage': ['use', 'apply', 'tap into', 'make use of', 'harness'],
            'utilize': ['use', 'employ', 'apply', 'make use of'],
            'paradigm': ['approach', 'method', 'way', 'model', 'system'],
            'plethora': ['lots of', 'plenty of', 'tons of', 'many', 'loads of'],
            'myriad': ['many', 'countless', 'lots of', 'numerous'],
            'robust': ['strong', 'solid', 'powerful', 'reliable', 'sturdy'],
            'comprehensive': ['complete', 'thorough', 'full', 'detailed'],
            'holistic': ['complete', 'whole', 'full-picture', 'all-around'],
            'synergy': ['teamwork', 'collaboration', 'combined effect'],
            'confluence': ['meeting', 'coming together', 'intersection'],
            'transformative': ['game-changing', 'life-changing', 'revolutionary'],
            'pivotal': ['crucial', 'key', 'important', 'critical'],
            'nuanced': ['subtle', 'complex', 'layered'],
            'intricate': ['complex', 'detailed', 'complicated'],
            'multifaceted': ['complex', 'many-sided', 'varied'],
            'dynamic': ['active', 'changing', 'flexible'],
            'innovative': ['new', 'creative', 'original'],
            'streamline': ['simplify', 'improve', 'make easier'],
            'optimize': ['improve', 'perfect', 'fine-tune', 'make better'],
            'maximize': ['boost', 'increase', 'get the most from'],
            'enhance': ['improve', 'boost', 'strengthen', 'upgrade'],
            'elevate': ['raise', 'improve', 'boost'],
            'seamless': ['smooth', 'effortless', 'easy', 'simple'],
            'cutting-edge': ['latest', 'newest', 'advanced', 'modern'],
            'state-of-the-art': ['latest', 'most advanced', 'top-of-the-line'],
            'game-changer': ['breakthrough', 'revolution', 'big deal'],
            'treasure-trove': ['goldmine', 'wealth of', 'collection'],
            
            // Creative writing cliches
            'breathtaking': ['amazing', 'incredible', 'stunning'],
            'mesmerizing': ['captivating', 'fascinating', 'engaging'],
            'spellbinding': ['gripping', 'compelling', 'riveting'],
            'enchanting': ['charming', 'delightful', 'magical'],
            'thought-provoking': ['interesting', 'challenging', 'insightful'],
            'mind-boggling': ['incredible', 'unbelievable', 'amazing'],
            'awe-inspiring': ['impressive', 'remarkable', 'extraordinary'],
            'jaw-dropping': ['shocking', 'surprising', 'incredible'],
            
            // Overused descriptors
            'quintessential': ['classic', 'typical', 'perfect example of'],
            'ubiquitous': ['everywhere', 'common', 'widespread'],
            'indispensable': ['essential', 'necessary', 'crucial'],
            'exemplary': ['excellent', 'outstanding', 'perfect'],
            'stellar': ['excellent', 'great', 'outstanding'],
            'extraordinary': ['amazing', 'remarkable', 'incredible'],
            'phenomenal': ['amazing', 'incredible', 'outstanding'],
            'unprecedented': ['never seen before', 'first time', 'unique'],
            'unparalleled': ['unmatched', 'unique', 'one-of-a-kind'],
            'incomparable': ['unique', 'unmatched', 'one-of-a-kind'],
            'fastidious': ['careful', 'detailed', 'thorough'],
            'meticulous': ['careful', 'detailed', 'precise'],
            'sophisticated': ['advanced', 'complex', 'refined'],
            'elaborate': ['detailed', 'complex', 'intricate'],
            'exquisite': ['beautiful', 'elegant', 'refined'],
            'impeccable': ['perfect', 'flawless', 'excellent'],
            'flawless': ['perfect', 'excellent', 'without fault'],
            
            // Corporate jargon
            'revolutionary': ['groundbreaking', 'new', 'innovative'],
            'disruptive': ['game-changing', 'innovative', 'groundbreaking'],
            'scalable': ['expandable', 'flexible', 'adaptable'],
            'sustainable': ['long-lasting', 'viable', 'eco-friendly'],
            'ecosystem': ['environment', 'network', 'system'],
            'infrastructure': ['foundation', 'framework', 'system'],
            'strategic': ['planned', 'important', 'key'],
            'tactical': ['practical', 'hands-on', 'direct'],
            'operational': ['day-to-day', 'practical', 'functional'],
            'synergistic': ['working together', 'collaborative', 'combined'],
            
            // MEDIUM RISK word replacements
            'landscape': ['scene', 'field', 'environment', 'area'],
            'evolving': ['changing', 'developing', 'growing'],
            'context': ['situation', 'background', 'setting'],
            'insight': ['understanding', 'realization', 'discovery'],
            'perspective': ['viewpoint', 'angle', 'way of seeing'],
            'framework': ['structure', 'system', 'approach'],
            'facet': ['aspect', 'side', 'part'],
            'intricacies': ['complexities', 'details', 'ins and outs'],
            'iterative': ['repeated', 'step-by-step', 'gradual'],
            'underpinning': ['foundation', 'basis', 'support'],
            'spectrum': ['range', 'variety', 'span'],
            'trajectory': ['path', 'course', 'direction'],
            'tapestry': ['mix', 'blend', 'combination'],
            'realm': ['world', 'area', 'field'],
            'endeavor': ['effort', 'attempt', 'project'],
            'foster': ['encourage', 'promote', 'support'],
            'facilitate': ['help', 'enable', 'make easier'],
            'encompasses': ['includes', 'covers', 'contains'],
            'embark': ['start', 'begin', 'set out'],
            'navigate': ['handle', 'deal with', 'work through'],
            'cornerstone': ['foundation', 'key part', 'basis'],
            'catalyst': ['trigger', 'spark', 'driver'],
            'pioneer': ['lead', 'innovate', 'break ground'],
            'spearhead': ['lead', 'drive', 'champion'],
            'culminate': ['end', 'result', 'finish'],
            'articulate': ['express', 'explain', 'describe'],
            
            // Academic formality terms
            'abundance': ['plenty', 'lots', 'wealth'],
            'multitude': ['many', 'lots', 'crowd'],
            'array': ['range', 'variety', 'selection'],
            'gamut': ['range', 'spectrum', 'variety'],
            'breadth': ['width', 'range', 'scope'],
            'depth': ['detail', 'thoroughness', 'complexity'],
            'notably': ['especially', 'particularly', 'importantly'],
            'thus': ['so', 'therefore', 'as a result'],
            'subsequently': ['later', 'then', 'after that'],
            'accordingly': ['so', 'therefore', 'as a result'],
            'nonetheless': ['still', 'however', 'even so'],
            'plausible': ['believable', 'possible', 'reasonable'],
            'conceivable': ['possible', 'imaginable', 'thinkable'],
            'feasible': ['possible', 'doable', 'workable'],
            'viable': ['workable', 'possible', 'practical'],
            'pertinent': ['relevant', 'related', 'applicable'],
            'inherent': ['natural', 'built-in', 'innate'],
            'intrinsic': ['natural', 'built-in', 'essential'],
            'predominant': ['main', 'primary', 'leading'],
            'prevalent': ['common', 'widespread', 'popular'],
            
            // Business and technical terms
            'implementation': ['putting into practice', 'execution', 'rollout'],
            'integration': ['combining', 'merging', 'bringing together'],
            'optimization': ['improvement', 'enhancement', 'fine-tuning'],
            'functionality': ['features', 'capabilities', 'what it does'],
            'capability': ['ability', 'capacity', 'feature'],
            'scalability': ['ability to grow', 'expandability', 'flexibility'],
            'efficiency': ['effectiveness', 'productivity', 'performance'],
            'effectiveness': ['success', 'results', 'impact'],
            'methodology': ['method', 'approach', 'way'],
            'utilization': ['use', 'usage', 'employment'],
            
            // LOW RISK word replacements (intensity and quality words)
            'significant': ['important', 'major', 'big'],
            'substantial': ['large', 'considerable', 'big'],
            'considerable': ['large', 'significant', 'substantial'],
            'notable': ['noteworthy', 'important', 'significant'],
            'remarkable': ['amazing', 'impressive', 'outstanding'],
            'exceptional': ['outstanding', 'extraordinary', 'unusual'],
            'outstanding': ['excellent', 'exceptional', 'remarkable'],
            'crucial': ['important', 'vital', 'essential'],
            'vital': ['essential', 'important', 'critical'],
            'essential': ['necessary', 'important', 'vital'],
            'fundamental': ['basic', 'essential', 'key'],
            'paramount': ['most important', 'top priority', 'essential'],
            'imperative': ['essential', 'crucial', 'necessary'],
            'pertinent': ['relevant', 'applicable', 'related'],
            'relevant': ['applicable', 'related', 'important'],
            'applicable': ['relevant', 'appropriate', 'suitable'],
            'viable': ['workable', 'feasible', 'practical'],
            'feasible': ['possible', 'doable', 'viable'],
            'optimal': ['best', 'ideal', 'perfect'],
            'efficient': ['effective', 'productive', 'streamlined'],
            
            // Transition word replacements
            'furthermore': ['also', 'plus', 'what\'s more', 'on top of that'],
            'moreover': ['also', 'plus', 'what\'s more', 'besides'],
            'additionally': ['also', 'plus', 'on top of that', 'and'],
            'however': ['but', 'though', 'still', 'yet'],
            'nevertheless': ['but', 'still', 'even so', 'yet'],
            'consequently': ['so', 'as a result', 'because of this', 'that\'s why'],
            'therefore': ['so', 'that\'s why', 'as a result', 'which means'],
            'thus': ['so', 'therefore', 'as a result'],
            'hence': ['so', 'therefore', 'that\'s why'],
            'accordingly': ['so', 'therefore', 'as a result'],
            'subsequently': ['later', 'then', 'after that'],
            'nonetheless': ['still', 'however', 'even so'],
            
            // PHRASE replacements (complete overhaul)
            'in today\'s fast-paced world': ['these days', 'nowadays', 'right now', 'currently'],
            'in today\'s digital world': ['these days', 'nowadays', 'in our connected world'],
            'in today\'s modern age': ['these days', 'currently', 'nowadays'],
            'in the ever-evolving world of': ['in the changing field of', 'in the world of'],
            'it\'s important to note': ['worth mentioning', 'keep in mind', 'remember'],
            'it\'s worth noting': ['remember', 'worth mentioning', 'keep in mind'],
            'it stands to reason': ['it makes sense that', 'naturally', 'obviously'],
            'one might consider': ['you might think about', 'consider', 'you could'],
            'studies have shown': ['research finds', 'data shows', 'evidence suggests'],
            'experts agree': ['most professionals think', 'specialists say', 'people in the field believe'],
            'research indicates': ['studies show', 'evidence suggests', 'data shows'],
            'it is widely accepted': ['most people believe', 'it\'s commonly known', 'generally'],
            'scientists believe': ['researchers think', 'studies suggest', 'evidence shows'],
            'data suggests': ['numbers show', 'research indicates', 'evidence points to'],
            'at the end of the day': ['ultimately', 'when it comes down to it', 'the reality is'],
            'when all is said and done': ['ultimately', 'in the end', 'finally'],
            'in conclusion': ['so', 'to wrap up', 'the bottom line'],
            'to sum up': ['so', 'in short', 'basically'],
            'to summarize': ['basically', 'in short', 'so'],
            'ultimately': ['in the end', 'when it comes down to it', 'finally'],
            'in summary': ['so', 'basically', 'in short'],
            'all in all': ['overall', 'generally', 'on the whole'],
            
            // Corporate speak replacements
            'here\'s why this matters': ['this is important because', 'this matters because'],
            'the key takeaway': ['the main point', 'what you need to know'],
            'bottom line': ['the point is', 'basically', 'what matters is'],
            'at scale': ['on a large level', 'broadly', 'widely'],
            'best practices': ['proven methods', 'what works best', 'good approaches'],
            'low-hanging fruit': ['easy wins', 'quick victories', 'simple solutions'],
            'circle back': ['get back to', 'return to', 'revisit'],
            'touch base': ['check in', 'connect', 'follow up'],
            'paradigm shift': ['big change', 'major shift', 'transformation']
        };

        // Structural patterns to detect
        this.structuralPatterns = {
            // Perfect lists of three (AI loves tricolons)
            perfectTricolons: /(\w+),\s+(\w+),\s+and\s+(\w+)\b/gi,
            
            // Excessive em dash usage
            excessiveEmDashes: /—/g,
            
            // Repetitive sentence starters
            repetitiveStarters: /^(The|This|That|It|There)\s+/gim,
            
            // Passive voice overuse
            passiveVoice: /\b(is|are|was|were|being|been)\s+\w*ed\b/gi,
            
            // Overly balanced paragraphs (same length)
            balancedSentences: /\.\s+/g
        };

        // Human voice enhancement patterns
        this.humanVoiceEnhancements = {
            // Add personality and voice
            personalityMarkers: [
                'honestly', 'frankly', 'let\'s be real', 'here\'s the thing',
                'look', 'listen', 'between you and me', 'real talk',
                'no joke', 'seriously', 'trust me on this', 'here\'s what I\'ve learned'
            ],

            // Conversational connectors
            conversationalConnectors: [
                'so', 'now', 'but here\'s the kicker', 'plot twist',
                'here\'s where it gets interesting', 'and get this',
                'funny thing is', 'turns out', 'guess what'
            ],

            // Imperfect human patterns
            humanImperfections: [
                'kinda', 'sorta', 'pretty much', 'basically',
                'more or less', 'ish', 'roughly', 'about'
            ]
        };
    }

    /**
     * Main method to detect and replace AI phrases in content
     */
    detectAndReplaceAILanguage(content) {
        const analysis = {
            originalContent: content,
            detectedPatterns: [],
            replacements: [],
            riskScore: 0,
            humanScore: 0
        };

        // Phase 1: Detect AI patterns
        analysis.detectedPatterns = this.detectAIPatterns(content);
        analysis.riskScore = this.calculateRiskScore(analysis.detectedPatterns);

        // Phase 2: Replace AI language with human alternatives
        let humanizedContent = content;
        analysis.replacements = [];

        // Replace dead giveaway phrases first
        for (const pattern of this.aiPhrasePatterns.deadGiveaways) {
            if (pattern.test(humanizedContent)) {
                humanizedContent = humanizedContent.replace(pattern, '[REMOVE AI REFERENCE]');
                analysis.replacements.push({
                    type: 'dead-giveaway',
                    original: pattern.source,
                    replacement: '[REMOVED]',
                    severity: 'critical'
                });
            }
        }

        // Replace all AI phrase patterns
        humanizedContent = this.replaceAllAIPhrasePatterns(humanizedContent, analysis.replacements);

        // Replace overused words
        humanizedContent = this.replaceOverusedWords(humanizedContent, analysis.replacements);

        // Phase 3: Add human voice elements
        humanizedContent = this.addHumanVoiceElements(humanizedContent, analysis.replacements);

        // Phase 4: Fix structural patterns
        humanizedContent = this.fixStructuralPatterns(humanizedContent, analysis.replacements);
        
        // Phase 5: Clean up grammar issues from replacements
        humanizedContent = this.cleanupGrammarIssues(humanizedContent);

        // Calculate final human score
        analysis.humanScore = this.calculateHumanScore(humanizedContent);
        analysis.humanizedContent = humanizedContent;

        return analysis;
    }

    /**
     * Detect AI patterns in content
     */
    detectAIPatterns(content) {
        const detected = {
            deadGiveaways: [],
            overusedWords: [],
            overusedPhrases: [],
            structuralIssues: []
        };

        // Check for dead giveaway phrases
        for (const pattern of this.aiPhrasePatterns.deadGiveaways) {
            const matches = content.match(pattern);
            if (matches) {
                detected.deadGiveaways.push(...matches);
            }
        }

        // Check for overused words
        const words = content.toLowerCase().split(/\s+/);
        const wordCounts = {};
        
        words.forEach(word => {
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (this.isAIWord(cleanWord)) {
                wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
            }
        });

        detected.overusedWords = Object.entries(wordCounts)
            .filter(([word, count]) => count > 0)
            .map(([word, count]) => ({ word, count, risk: this.getWordRiskLevel(word) }));

        // Check for overused phrases - comprehensive detection
        Object.entries(this.aiPhrasePatterns).forEach(([category, patterns]) => {
            if (Array.isArray(patterns)) {
                patterns.forEach(pattern => {
                    const matches = content.match(pattern);
                    if (matches) {
                        detected.overusedPhrases.push(...matches.map(m => ({
                            phrase: m,
                            pattern: pattern.source,
                            category: category,
                            severity: this.getPatternSeverity(category)
                        })));
                    }
                });
            }
        });

        // Check structural issues
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
        const lengthVariation = this.calculateLengthVariation(sentences);

        if (lengthVariation < 0.3) {
            detected.structuralIssues.push('uniform-sentence-length');
        }

        const emDashCount = (content.match(/—/g) || []).length;
        if (emDashCount > sentences.length * 0.2) {
            detected.structuralIssues.push('excessive-em-dashes');
        }

        return detected;
    }

    /**
     * Replace all AI phrase patterns with human alternatives - COMPREHENSIVE
     */
    replaceAllAIPhrasePatterns(content, replacements) {
        let result = content;

        // Process each category of AI patterns
        Object.entries(this.aiPhrasePatterns).forEach(([category, patterns]) => {
            if (Array.isArray(patterns)) {
                patterns.forEach(pattern => {
                    if (pattern.test(result)) {
                        const matches = result.match(pattern);
                        if (matches) {
                            matches.forEach(match => {
                                const humanReplacement = this.getHumanPhrasealternative(match, category);
                                if (humanReplacement !== match) {
                                    result = result.replace(match, humanReplacement);
                                    replacements.push({
                                        type: category,
                                        original: match,
                                        replacement: humanReplacement,
                                        severity: this.getPatternSeverity(category)
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });

        return result;
    }
    
    /**
     * Get human alternative for detected AI phrase
     */
    getHumanPhrasealternative(phrase, category) {
        // Clean the phrase for lookup
        const cleanPhrase = phrase.toLowerCase().trim();
        
        // Check direct phrase replacements first
        if (this.humanReplacements[cleanPhrase]) {
            const alternatives = this.humanReplacements[cleanPhrase];
            return alternatives[Math.floor(Math.random() * alternatives.length)];
        }
        
        // Category-specific replacements
        switch (category) {
            case 'deadGiveaways':
                return '[REMOVE AI REFERENCE]';
                
            case 'transitions':
                if (cleanPhrase.includes('today\'s')) {
                    return ['these days', 'nowadays', 'currently'][Math.floor(Math.random() * 3)];
                }
                if (cleanPhrase.includes('furthermore')) return 'also';
                if (cleanPhrase.includes('moreover')) return 'plus';
                if (cleanPhrase.includes('however')) return 'but';
                if (cleanPhrase.includes('therefore')) return 'so';
                break;
                
            case 'noteTaking':
                if (cleanPhrase.includes('important to note')) return 'worth mentioning';
                if (cleanPhrase.includes('worth noting')) return 'keep in mind';
                break;
                
            case 'hedging':
                if (cleanPhrase.includes('to some extent')) return 'partly';
                if (cleanPhrase.includes('arguably')) return 'probably';
                if (cleanPhrase.includes('it can be argued')) return 'many believe';
                break;
                
            case 'conclusions':
                if (cleanPhrase.includes('in conclusion')) return 'so';
                if (cleanPhrase.includes('ultimately')) return 'in the end';
                if (cleanPhrase.includes('to sum up')) return 'basically';
                break;
                
            case 'authorities':
                if (cleanPhrase.includes('studies have shown')) return 'research finds';
                if (cleanPhrase.includes('experts agree')) return 'specialists say';
                if (cleanPhrase.includes('data suggests')) return 'numbers show';
                break;
                
            case 'corporate':
                if (cleanPhrase.includes('bottom line')) return 'the point is';
                if (cleanPhrase.includes('best practices')) return 'what works best';
                if (cleanPhrase.includes('circle back')) return 'get back to';
                break;
        }
        
        // Default to a more human version
        return phrase.replace(/\b(furthermore|moreover|however|therefore)\b/gi, (match) => {
            const replacements = {
                'furthermore': 'also',
                'moreover': 'plus', 
                'however': 'but',
                'therefore': 'so'
            };
            return replacements[match.toLowerCase()] || match;
        });
    }
    
    /**
     * Get severity level for pattern category
     */
    getPatternSeverity(category) {
        const severityMap = {
            'deadGiveaways': 'critical',
            'transitions': 'high',
            'noteTaking': 'high', 
            'hedging': 'medium',
            'conclusions': 'medium',
            'authorities': 'high',
            'corporate': 'medium',
            'forbiddenStarters': 'high',
            'descriptive': 'low'
        };
        return severityMap[category] || 'medium';
    }

    /**
     * Replace overused AI words with human alternatives
     */
    replaceOverusedWords(content, replacements) {
        let result = content;

        Object.entries(this.humanReplacements).forEach(([aiWord, alternatives]) => {
            const regex = new RegExp(`\\b${aiWord}\\b`, 'gi');
            const matches = result.match(regex);
            
            if (matches) {
                matches.forEach(match => {
                    const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
                    result = result.replace(match, replacement);
                    replacements.push({
                        type: 'overused-word',
                        original: match,
                        replacement: replacement,
                        severity: this.getWordRiskLevel(aiWord)
                    });
                });
            }
        });

        return result;
    }

    // Note: replaceHedgingLanguage method removed - now handled by replaceAllAIPhrasePatterns

    /**
     * Add human voice elements to make content sound more natural
     */
    addHumanVoiceElements(content, replacements) {
        let result = content;

        // Add occasional personality markers (but don't overdo it)
        const sentences = result.split(/(?<=[.!?])\s+/);
        const targetSentences = Math.floor(sentences.length * 0.1); // 10% of sentences

        for (let i = 0; i < targetSentences && i < sentences.length; i++) {
            const randomIndex = Math.floor(Math.random() * sentences.length);
            const sentence = sentences[randomIndex];
            
            if (!sentence.match(/^(honestly|frankly|look|listen)/i)) {
                const personality = this.humanVoiceEnhancements.personalityMarkers[
                    Math.floor(Math.random() * this.humanVoiceEnhancements.personalityMarkers.length)
                ];
                
                sentences[randomIndex] = `${personality.charAt(0).toUpperCase()}${personality.slice(1)}, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
                
                replacements.push({
                    type: 'personality-addition',
                    original: sentence.slice(0, 50) + '...',
                    replacement: personality,
                    severity: 'positive'
                });
            }
        }

        result = sentences.join(' ');
        return result;
    }

    /**
     * Fix structural patterns that make content sound AI-generated
     */
    fixStructuralPatterns(content, replacements) {
        let result = content;

        // Break up perfect tricolons occasionally
        const tricolonMatches = result.match(this.structuralPatterns.perfectTricolons);
        if (tricolonMatches && tricolonMatches.length > 3) {
            // Replace some perfect tricolons with imperfect lists
            const imperfectPatterns = [
                '$1, $2, and maybe $3',
                '$1, $2, or even $3',
                '$1 and $2 (plus $3)',
                '$1, $2, and especially $3'
            ];

            tricolonMatches.slice(0, 2).forEach(match => {
                const pattern = imperfectPatterns[Math.floor(Math.random() * imperfectPatterns.length)];
                result = result.replace(match, match.replace(/(\w+),\s+(\w+),\s+and\s+(\w+)/, pattern));
                
                replacements.push({
                    type: 'structure-fix',
                    original: 'perfect-tricolon',
                    replacement: 'imperfect-list',
                    severity: 'low'
                });
            });
        }

        // Reduce excessive em dashes
        const emDashCount = (result.match(/—/g) || []).length;
        if (emDashCount > 5) {
            // Replace some em dashes with periods or commas
            let dashesReplaced = 0;
            result = result.replace(/—/g, (match) => {
                if (dashesReplaced < Math.floor(emDashCount / 2)) {
                    dashesReplaced++;
                    return Math.random() > 0.5 ? '.' : ',';
                }
                return match;
            });

            replacements.push({
                type: 'punctuation-fix',
                original: 'excessive-em-dashes',
                replacement: 'varied-punctuation',
                severity: 'medium'
            });
        }

        return result;
    }
    
    /**
     * Clean up grammar issues caused by replacements
     */
    cleanupGrammarIssues(content) {
        let result = content;
        
        // Fix double words/phrases
        result = result.replace(/\b(\w+)\s+\1\b/gi, '$1'); // Remove duplicate consecutive words
        result = result.replace(/\b(dig into)\s+into\b/gi, 'dig into'); // Fix "dig into into"
        result = result.replace(/\b(loads of)\s+of\b/gi, 'loads of'); // Fix "loads of of"
        result = result.replace(/\b(lots of)\s+of\b/gi, 'lots of'); // Fix "lots of of"
        result = result.replace(/\b(tons of)\s+of\b/gi, 'tons of'); // Fix "tons of of"
        
        // Fix awkward spacing from replacements
        result = result.replace(/\s{2,}/g, ' '); // Multiple spaces to single space
        result = result.replace(/,\s*,/g, ','); // Double commas
        result = result.replace(/\.\s*\./g, '.'); // Double periods
        
        // Fix capitalization after sentence starters
        result = result.replace(/^([a-z])/gm, (match) => match.toUpperCase()); // Capitalize start of sentences
        result = result.replace(/\.\s+([a-z])/g, (match, letter) => match.replace(letter, letter.toUpperCase()));
        result = result.replace(/\?\s+([a-z])/g, (match, letter) => match.replace(letter, letter.toUpperCase()));
        result = result.replace(/!\s+([a-z])/g, (match, letter) => match.replace(letter, letter.toUpperCase()));
        
        // Fix common grammatical inconsistencies
        result = result.replace(/\ba\s+(?=[aeiou])/gi, 'an '); // Fix a/an articles
        result = result.replace(/\ban\s+(?=[^aeiou])/gi, 'a '); // Fix an/a articles
        
        return result.trim();
    }

    /**
     * Calculate risk score based on detected AI patterns
     */
    calculateRiskScore(detectedPatterns) {
        let score = 0;

        // Dead giveaways = critical risk
        score += detectedPatterns.deadGiveaways.length * 50;

        // Overused words = variable risk based on word type
        detectedPatterns.overusedWords.forEach(item => {
            switch (item.risk) {
                case 'high': score += item.count * 10; break;
                case 'medium': score += item.count * 5; break;
                case 'low': score += item.count * 2; break;
            }
        });

        // Overused phrases
        score += detectedPatterns.overusedPhrases.length * 8;

        // Structural issues
        score += detectedPatterns.structuralIssues.length * 15;

        return Math.min(100, score); // Cap at 100
    }

    /**
     * Calculate human score (inverse of AI risk)
     */
    calculateHumanScore(content) {
        const patterns = this.detectAIPatterns(content);
        const riskScore = this.calculateRiskScore(patterns);
        return Math.max(0, 100 - riskScore);
    }

    // Helper methods
    isAIWord(word) {
        return [...this.aiDeadGiveaways.highRisk, ...this.aiDeadGiveaways.mediumRisk, ...this.aiDeadGiveaways.lowRisk]
            .includes(word.toLowerCase());
    }

    getWordRiskLevel(word) {
        if (this.aiDeadGiveaways.highRisk.includes(word.toLowerCase())) return 'high';
        if (this.aiDeadGiveaways.mediumRisk.includes(word.toLowerCase())) return 'medium';
        if (this.aiDeadGiveaways.lowRisk.includes(word.toLowerCase())) return 'low';
        return 'none';
    }

    calculateLengthVariation(sentences) {
        if (sentences.length < 2) return 1;
        
        const lengths = sentences.map(s => s.length);
        const avg = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
        
        return Math.sqrt(variance) / avg;
    }

    /**
     * Get replacement suggestions for detected AI language
     */
    getReplacementSuggestions(detectedWord) {
        return this.humanReplacements[detectedWord.toLowerCase()] || ['[manual replacement needed]'];
    }

    /**
     * Generate human voice enhancement report
     */
    generateHumanVoiceReport(analysis) {
        return {
            originalRiskScore: analysis.riskScore,
            improvedHumanScore: analysis.humanScore,
            totalReplacements: analysis.replacements.length,
            replacementBreakdown: this.categorizeReplacements(analysis.replacements),
            recommendations: this.generateRecommendations(analysis),
            readinessLevel: this.determineReadinessLevel(analysis.humanScore)
        };
    }

    categorizeReplacements(replacements) {
        const categories = {};
        replacements.forEach(replacement => {
            categories[replacement.type] = (categories[replacement.type] || 0) + 1;
        });
        return categories;
    }

    generateRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.riskScore > 50) {
            recommendations.push('High AI detection risk - consider major revisions');
        }
        if (analysis.humanScore < 70) {
            recommendations.push('Add more personality and conversational elements');
        }
        if (analysis.replacements.filter(r => r.type === 'overused-word').length > 10) {
            recommendations.push('Vocabulary is too formal - use simpler, more natural words');
        }
        
        return recommendations;
    }

    determineReadinessLevel(humanScore) {
        if (humanScore >= 85) return 'publication-ready';
        if (humanScore >= 70) return 'minor-revisions-needed';
        if (humanScore >= 50) return 'moderate-revisions-needed';
        return 'major-revisions-needed';
    }
}

module.exports = AIPhraseDetector;