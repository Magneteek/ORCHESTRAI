/**
 * COMPREHENSIVE INTELLIGENCE AGGREGATOR
 *
 * Aggregates all client intelligence data from multiple sources:
 * - EOS (Entrepreneurial Operating System) data
 * - ICP (Ideal Customer Profile) framework
 * - Customer personas
 * - Psychographic research
 * - Market analysis
 * - Client profile
 *
 * Outputs a unified JSON structure ready for HTML report generation
 */

const fs = require('fs').promises;
const path = require('path');
const pLimit = require('p-limit');

class ComprehensiveIntelligenceAggregator {
  constructor(clientIntelligencePath) {
    this.intelligencePath = clientIntelligencePath;
    this.data = {
      metadata: {},
      eos: null,
      icp: null,
      personas: [],
      psychographic: null,
      marketAnalysis: [],
      clientProfile: null
    };

    // CRASH PREVENTION: Limit concurrent file operations to prevent
    // file descriptor exhaustion and SQLite contention in VS Code
    this.fileLimit = pLimit(5); // Max 5 concurrent file operations
    this.readLimit = pLimit(3); // Max 3 concurrent file reads
  }

  /**
   * Aggregate all intelligence data from client folder
   */
  async aggregateAll() {
    console.log('📊 Aggregating comprehensive intelligence data...\n');

    try {
      // Load all data sources
      await this.loadEOSData();
      await this.loadICPData();
      await this.loadPersonas();
      await this.loadPsychographicResearch();
      await this.loadMarketAnalysis();
      await this.loadClientProfile();

      // Generate metadata
      this.data.metadata = {
        aggregatedAt: new Date().toISOString(),
        sources: this.getLoadedSources(),
        completeness: this.calculateCompleteness()
      };

      console.log('\n✅ Intelligence aggregation complete');
      console.log(`   Sources loaded: ${this.data.metadata.sources.length}`);
      console.log(`   Completeness: ${this.data.metadata.completeness}%`);

      return this.data;

    } catch (error) {
      console.error('❌ Intelligence aggregation failed:', error);
      throw error;
    }
  }

  /**
   * Load EOS data from markdown file
   */
  async loadEOSData() {
    try {
      console.log('Loading EOS data...');
      // Try multiple patterns to find EOS file
      const eosFiles = await this.findFiles('EOS*.md', '*EOS*.md', 'eos.md');

      if (eosFiles.length === 0) {
        console.log('   ⚠️  No EOS file found');
        return;
      }

      // CRASH PREVENTION: Rate-limited file read
      const eosContent = await this.readLimit(() => fs.readFile(eosFiles[0], 'utf8'));
      this.data.eos = this.parseEOSMarkdown(eosContent);

      console.log('   ✓ EOS data loaded');
    } catch (error) {
      console.log('   ⚠️  EOS data not available:', error.message);
    }
  }

  /**
   * Parse EOS markdown to structured data
   */
  parseEOSMarkdown(content) {
    const eos = {
      coreValues: [],
      coreFocus: {},
      marketingStrategy: {}
    };

    // Extract core values
    const valuesMatch = content.match(/### \*\*Osrednje vrednote[\s\S]*?\n\n([\s\S]*?)---/);
    if (valuesMatch) {
      const values = valuesMatch[1].match(/\d+\.\s\*\*(.*?)\*\*\s*–\s*(.*)/g);
      if (values) {
        eos.coreValues = values.map(v => {
          const match = v.match(/\d+\.\s\*\*(.*?)\*\*\s*–\s*(.*)/);
          return {
            name: match[1].trim(),
            description: match[2].trim()
          };
        });
      }
    }

    // Extract core focus
    const focusMatch = content.match(/### \*\*Temeljna usmeritev[\s\S]*?Namen \/ strast:\*\*\s*→\s*\*(.*?)\*.*?Naša niša:\*\*\s*→\s*\*(.*?)\*/s);
    if (focusMatch) {
      eos.coreFocus = {
        purpose: focusMatch[1].trim(),
        niche: focusMatch[2].trim()
      };
    }

    // Extract marketing strategy - target market
    const targetMarketMatch = content.match(/### \*\*Ciljni trg:\*\*([\s\S]*?)### \*\*\d+/);
    if (targetMarketMatch) {
      const markets = targetMarketMatch[1].match(/- (.*)/g);
      eos.marketingStrategy.targetMarket = markets ? markets.map(m => m.replace('- ', '').trim()) : [];
    }

    // Extract three uniques
    const uniquesMatch = content.match(/### \*\*Tri edinstvenosti[\s\S]*?\n\n([\s\S]*?)### \*\*\d+/);
    if (uniquesMatch) {
      const uniques = uniquesMatch[1].match(/- (.*)/g);
      eos.marketingStrategy.threeUniques = uniques ? uniques.map(u => u.replace('- ', '').trim()) : [];
    }

    // Extract proven process
    const processMatch = content.match(/### \*\*Dokazan proces[\s\S]*?\n\n([\s\S]*?)### \*\*\d+/);
    if (processMatch) {
      const steps = processMatch[1].match(/\d+\.\s+(.*)/g);
      eos.marketingStrategy.provenProcess = steps ? steps.map(s => s.replace(/\d+\.\s+/, '').trim()) : [];
    }

    // Extract guarantee
    const guaranteeMatch = content.match(/> "(.*?)"/);
    if (guaranteeMatch) {
      eos.marketingStrategy.guarantee = guaranteeMatch[1].trim();
    }

    return eos;
  }

  /**
   * Load ICP data from markdown file
   */
  async loadICPData() {
    try {
      console.log('Loading ICP data...');
      const icpFiles = await this.findFiles('*ICP*.md');

      if (icpFiles.length === 0) {
        console.log('   ⚠️  No ICP file found');
        return;
      }

      // CRASH PREVENTION: Rate-limited file read
      const icpContent = await this.readLimit(() => fs.readFile(icpFiles[0], 'utf8'));
      this.data.icp = this.parseICPMarkdown(icpContent);

      console.log('   ✓ ICP data loaded');
    } catch (error) {
      console.log('   ⚠️  ICP data not available:', error.message);
    }
  }

  /**
   * Parse ICP markdown to structured data
   */
  parseICPMarkdown(content) {
    const icp = {};

    // Extract sections using regex
    const sections = {
      avatar: /## Avatar:\s*([\s\S]*?)##/,
      before: /## Pred:\s*([\s\S]*?)##/,
      after: /## Po:\s*([\s\S]*?)##/,
      trigger: /## Ko se zgodi:\s*([\s\S]*?)##/,
      niche: /## Niša:\s*([\s\S]*?)##/,
      primaryGoals: /## Primarni cilji:\s*([\s\S]*?)##/,
      secondaryGoals: /## Sekundarni cilji:\s*([\s\S]*?)##/,
      dreams: /## Sanje:\s*([\s\S]*?)##/,
      promises: /## Obljube:\s*([\s\S]*?)##/,
      primaryComplaint: /## Primarna pritožba:\s*([\s\S]*?)##/,
      secondaryComplaint: /## Sekundarna pritožba:\s*([\s\S]*?)##/,
      objections: /## Ugovori:\s*([\s\S]*?)##/,
      badHabits: /## Slabe navade:\s*([\s\S]*?)##/,
      consequences: /## Posledice:\s*([\s\S]*?)##/,
      enemy: /## Sovražnik:\s*([\s\S]*?)##/,
      biggestFear: /## Največji strah:\s*([\s\S]*?)##/
    };

    for (const [key, regex] of Object.entries(sections)) {
      const match = content.match(regex);
      if (match) {
        const text = match[1].trim();

        // Check if it's a list
        if (text.includes('\n1.')) {
          const items = text.match(/\d+\.\s+(.*?)(?=\n\d+\.|\n##|$)/gs);
          icp[key] = items ? items.map(item => item.replace(/^\d+\.\s+/, '').trim()) : [text];
        } else {
          icp[key] = text;
        }
      }
    }

    // Extract statistics
    const negativeStatsMatch = content.match(/### Negativne statistike:\s*([\s\S]*?)### Splošne statistike:/);
    const generalStatsMatch = content.match(/### Splošne statistike:\s*([\s\S]*?)##/);

    if (negativeStatsMatch || generalStatsMatch) {
      icp.statistics = {};

      if (negativeStatsMatch) {
        const negStats = negativeStatsMatch[1].match(/- (.*)/g);
        icp.statistics.negative = negStats ? negStats.map(s => s.replace('- ', '').trim()) : [];
      }

      if (generalStatsMatch) {
        const genStats = generalStatsMatch[1].match(/- (.*)/g);
        icp.statistics.general = genStats ? genStats.map(s => s.replace('- ', '').trim()) : [];
      }
    }

    // Extract past experiences
    const experiencesMatch = content.match(/# ICP JE POSKUSIL NASLEDNJE STVARI[\s\S]*$/);
    if (experiencesMatch) {
      const expItems = experiencesMatch[0].match(/\d+\.\s+\*\*(.*?)\*\*([\s\S]*?)(?=\n\d+\.|\n$)/g);
      if (expItems) {
        icp.pastExperiences = expItems.map(item => {
          const titleMatch = item.match(/\d+\.\s+\*\*(.*?)\*\*/);
          const whatMatch = item.match(/\*\*Kaj so poskusili:\*\*\s*(.*)/);
          const whyTriedMatch = item.match(/\*\*Zakaj so to poskusili:\*\*\s*(.*)/);
          const whyFailedMatch = item.match(/\*\*Zakaj ni delovalo:\*\*\s*(.*)/);

          return {
            title: titleMatch ? titleMatch[1].trim() : '',
            whatTried: whatMatch ? whatMatch[1].trim() : '',
            whyTried: whyTriedMatch ? whyTriedMatch[1].trim() : '',
            whyFailed: whyFailedMatch ? whyFailedMatch[1].trim() : ''
          };
        });
      }
    }

    return icp;
  }

  /**
   * Load personas from markdown file
   */
  async loadPersonas() {
    try {
      console.log('Loading personas...');
      const personaFiles = await this.findFiles('*persona*.md', '*persone*.md');

      if (personaFiles.length === 0) {
        console.log('   ⚠️  No personas file found');
        return;
      }

      // CRASH PREVENTION: Rate-limited file read
      const personaContent = await this.readLimit(() => fs.readFile(personaFiles[0], 'utf8'));
      this.data.personas = this.parsePersonasMarkdown(personaContent);

      console.log(`   ✓ Personas loaded: ${this.data.personas.length} personas`);
    } catch (error) {
      console.log('   ⚠️  Personas not available:', error.message);
    }
  }

  /**
   * Parse personas markdown to structured data
   */
  parsePersonasMarkdown(content) {
    const personas = [];
    const personaSections = content.match(/# Persona \d+:[\s\S]*?(?=# Persona \d+:|# Privlačni pozivi|$)/g);

    if (!personaSections) return personas;

    for (const section of personaSections) {
      const nameMatch = section.match(/# Persona \d+:\s*(.*)/);
      const motivationMatch = section.match(/\*\*Motivacija:\*\*([\s\S]*?)\*\*Strahovi:\*\*/);
      const fearsMatch = section.match(/\*\*Strahovi:\*\*([\s\S]*?)\*\*Razlogi za izbiro/);
      const reasonsMatch = section.match(/\*\*Razlogi za izbiro[\s\S]*?:\*\*([\s\S]*?)\*\*Končni cilj:\*\*/);
      const goalsMatch = section.match(/\*\*Končni cilj:\*\*([\s\S]*?)(?=## Persona|$)/);

      const extractListItems = (text) => {
        if (!text) return [];
        const items = text.match(/- (.*)/g);
        return items ? items.map(i => i.replace('- ', '').trim()) : [];
      };

      personas.push({
        name: nameMatch ? nameMatch[1].trim() : '',
        motivation: extractListItems(motivationMatch ? motivationMatch[1] : ''),
        fears: extractListItems(fearsMatch ? fearsMatch[1] : ''),
        reasons: extractListItems(reasonsMatch ? reasonsMatch[1] : ''),
        goals: extractListItems(goalsMatch ? goalsMatch[1] : '')
      });
    }

    return personas;
  }

  /**
   * Load psychographic research data
   */
  async loadPsychographicResearch() {
    try {
      console.log('Loading psychographic research...');
      // Check in psychographic-research subfolder
      const psychoFiles = await this.findFiles('psychographic-research/*.json', '*psychographic*.json');

      if (psychoFiles.length === 0) {
        console.log('   ⚠️  No psychographic research found');
        return;
      }

      // CRASH PREVENTION: Rate-limited file read
      const psychoContent = await this.readLimit(() => fs.readFile(psychoFiles[0], 'utf8'));
      this.data.psychographic = JSON.parse(psychoContent);

      // Add user journey keyword mapping
      this.data.psychographic.userJourneyKeywords = this.mapKeywordsToUserJourney(this.data.psychographic);

      console.log('   ✓ Psychographic research loaded');
      console.log('   ✓ User journey keyword mapping generated');
    } catch (error) {
      console.log('   ⚠️  Psychographic research not available:', error.message);
    }
  }

  /**
   * Map psychographic keywords to user journey stages
   */
  mapKeywordsToUserJourney(psychoData) {
    const journeyStages = {
      awareness: {
        stage: 'Awareness',
        description: 'User is becoming aware of a problem or need',
        intent: 'Informational / Educational',
        keywords: []
      },
      consideration: {
        stage: 'Consideration',
        description: 'User is evaluating different solutions and options',
        intent: 'Comparative / Research',
        keywords: []
      },
      decision: {
        stage: 'Decision',
        description: 'User is ready to make a purchase or commitment',
        intent: 'Transactional / Action',
        keywords: []
      }
    };

    // Extract keywords from cultural values
    if (psychoData.slovenskeKulturneVrednote) {
      const culturalValues = psychoData.slovenskeKulturneVrednote.tradicionalneVrednote || psychoData.slovenskeKulturneVrednote;

      for (const [valueName, valueData] of Object.entries(culturalValues)) {
        if (valueData.iskaljniIzrazi && Array.isArray(valueData.iskaljniIzrazi)) {
          valueData.iskaljniIzrazi.forEach(keyword => {
            // Categorize based on keyword intent patterns
            const keywordLower = keyword.toLowerCase();

            // Decision stage keywords (transactional, action-oriented)
            if (keywordLower.includes('kupiti') || keywordLower.includes('naročiti') ||
                keywordLower.includes('cena') || keywordLower.includes('popust') ||
                keywordLower.includes('ponudba') || keywordLower.includes('rezervacija')) {
              journeyStages.decision.keywords.push({
                keyword,
                culturalValue: valueName,
                psychographicMotivation: valueData.psihološkaMotiacija || valueData.psihološkaMotoacija,
                emotionalTone: valueData.emocionalniTon
              });
            }
            // Consideration stage keywords (comparative, evaluative)
            else if (keywordLower.includes('primerjava') || keywordLower.includes('najboljši') ||
                     keywordLower.includes('kakovost') || keywordLower.includes('zanesljiv') ||
                     keywordLower.includes('certificiran') || keywordLower.includes('preizkušen') ||
                     keywordLower.includes('vs') || keywordLower.includes('ali')) {
              journeyStages.consideration.keywords.push({
                keyword,
                culturalValue: valueName,
                psychographicMotivation: valueData.psihološkaMotiacija || valueData.psihološkaMotoacija,
                emotionalTone: valueData.emocionalniTon
              });
            }
            // Awareness stage keywords (informational, educational)
            else {
              journeyStages.awareness.keywords.push({
                keyword,
                culturalValue: valueName,
                psychographicMotivation: valueData.psihološkaMotiacija || valueData.psihološkaMotoacija,
                emotionalTone: valueData.emocionalniTon
              });
            }
          });
        }
      }
    }

    // Add counts for quick reference
    journeyStages.awareness.count = journeyStages.awareness.keywords.length;
    journeyStages.consideration.count = journeyStages.consideration.keywords.length;
    journeyStages.decision.count = journeyStages.decision.keywords.length;

    return journeyStages;
  }

  /**
   * Load market analysis data
   */
  async loadMarketAnalysis() {
    try {
      console.log('Loading market analysis...');
      const marketFiles = await this.findFiles('market-analysis/*.json');

      // CRASH PREVENTION: Rate-limited parallel file reads
      const loadPromises = marketFiles.map(file =>
        this.readLimit(async () => {
          try {
            const content = await fs.readFile(file, 'utf8');
            const data = JSON.parse(content);
            return {
              filename: path.basename(file),
              data: data
            };
          } catch (e) {
            console.log(`   ⚠️  Could not load ${path.basename(file)}`);
            return null;
          }
        })
      );

      const results = await Promise.all(loadPromises);
      this.data.marketAnalysis = results.filter(r => r !== null);

      if (this.data.marketAnalysis.length > 0) {
        console.log(`   ✓ Market analysis loaded: ${this.data.marketAnalysis.length} files`);
      } else {
        console.log('   ⚠️  No market analysis found');
      }
    } catch (error) {
      console.log('   ⚠️  Market analysis not available:', error.message);
    }
  }

  /**
   * Load client profile
   */
  async loadClientProfile() {
    try {
      console.log('Loading client profile...');
      const profileFiles = await this.findFiles('client-profile.json');

      if (profileFiles.length === 0) {
        console.log('   ⚠️  No client profile found');
        return;
      }

      // CRASH PREVENTION: Rate-limited file read
      const profileContent = await this.readLimit(() => fs.readFile(profileFiles[0], 'utf8'));
      this.data.clientProfile = JSON.parse(profileContent);

      console.log('   ✓ Client profile loaded');
    } catch (error) {
      console.log('   ⚠️  Client profile not available:', error.message);
    }
  }

  /**
   * Find files matching patterns
   * CRASH PREVENTION: Rate-limited to prevent file descriptor exhaustion
   */
  async findFiles(...patterns) {
    // CRASH PREVENTION: Process patterns with concurrency limit
    const patternPromises = patterns.map(pattern =>
      this.fileLimit(async () => {
        const isRecursive = pattern.includes('/');

        if (isRecursive) {
          // Handle directory patterns like "market-analysis/*.json"
          const [dir, filePattern] = pattern.split('/');
          const dirPath = path.join(this.intelligencePath, dir);

          try {
            const dirFiles = await fs.readdir(dirPath);
            // IMPORTANT: Escape dots FIRST, then replace * with .*
            const regex = new RegExp(filePattern.replace(/\./g, '\\.').replace(/\*/g, '.*'));

            return dirFiles
              .filter(file => regex.test(file))
              .map(file => path.join(dirPath, file));
          } catch (e) {
            // Directory doesn't exist
            return [];
          }
        } else {
          // Handle file patterns like "*.md"
          try {
            const allFiles = await fs.readdir(this.intelligencePath);
            // IMPORTANT: Escape dots FIRST, then replace * with .* (case-insensitive)
            const regex = new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*'), 'i');

            return allFiles
              .filter(file => regex.test(file))
              .map(file => path.join(this.intelligencePath, file));
          } catch (e) {
            // Directory doesn't exist
            return [];
          }
        }
      })
    );

    const results = await Promise.all(patternPromises);
    const allFiles = results.flat();

    return [...new Set(allFiles)]; // Remove duplicates
  }

  /**
   * Get list of loaded sources
   */
  getLoadedSources() {
    const sources = [];

    if (this.data.eos) sources.push('EOS');
    if (this.data.icp) sources.push('ICP');
    if (this.data.personas && this.data.personas.length > 0) sources.push('Personas');
    if (this.data.psychographic) sources.push('Psychographic Research');
    if (this.data.marketAnalysis && this.data.marketAnalysis.length > 0) sources.push('Market Analysis');
    if (this.data.clientProfile) sources.push('Client Profile');

    return sources;
  }

  /**
   * Calculate data completeness percentage
   */
  calculateCompleteness() {
    const totalSources = 6;
    const loadedSources = this.getLoadedSources().length;

    return Math.round((loadedSources / totalSources) * 100);
  }

  /**
   * Export aggregated data to JSON file
   */
  async exportToJSON(outputPath) {
    await fs.writeFile(outputPath, JSON.stringify(this.data, null, 2), 'utf8');
    console.log(`\n📄 Aggregated data exported to: ${outputPath}`);
  }
}

module.exports = ComprehensiveIntelligenceAggregator;
