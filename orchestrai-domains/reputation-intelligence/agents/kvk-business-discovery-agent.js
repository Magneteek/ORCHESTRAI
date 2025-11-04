/**
 * KVK Business Discovery Agent
 * Integrates with Dutch Chamber of Commerce (KVK) API for accurate Dutch business discovery
 * Specializes in finding dental practices (tandarts) in the Netherlands
 */

const { EventEmitter } = require('events');
const https = require('https');

class KVKBusinessDiscoveryAgent extends EventEmitter {
    constructor() {
        super();
        this.name = 'kvk-business-discovery';
        this.isInitialized = false;
        this.config = null;
        this.baseUrl = 'https://api.kvk.nl/test/api/v2';
        this.dentalSBICodes = [
            '86230', // Dental practices
            '86221', // Specialist dental practices
            '86222'  // Dental hygienist practices
        ];
    }

    async initialize(config) {
        try {
            this.config = config;
            this.apiKey = process.env.KVK_API_KEY;

            if (!this.apiKey) {
                console.log('⚠️ No KVK API key found, using mock data mode');
            }

            this.isInitialized = true;
            console.log(`✅ KVK Business Discovery Agent initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize KVK Business Discovery Agent:`, error);
            throw error;
        }
    }

    async searchDentalPractices(searchCriteria) {
        try {
            console.log(`🔍 Searching KVK for dental practices:`, searchCriteria);

            if (!this.apiKey) {
                return this.generateMockDentalPractices(searchCriteria);
            }

            const businesses = [];

            // Search for different dental practice types
            for (const sbiCode of this.dentalSBICodes) {
                const results = await this.searchKVKByCategory(sbiCode, searchCriteria);
                businesses.push(...results);
            }

            // Filter and enrich results
            const dentalPractices = await this.enrichBusinessData(businesses, searchCriteria);

            console.log(`✅ Found ${dentalPractices.length} dental practices in KVK`);
            return dentalPractices;

        } catch (error) {
            console.error(`❌ KVK search failed:`, error);
            return this.generateMockDentalPractices(searchCriteria);
        }
    }

    async searchKVKByCategory(sbiCode, searchCriteria) {
        try {
            // Use KVK test API parameters for dental practices
            const searchParams = new URLSearchParams({
                naam: 'tandarts', // Search by name instead of SBI code for test API
                plaats: searchCriteria.location || searchCriteria.city || 'Amsterdam',
                type: 'hoofdvestiging' // Main establishments only
            });

            if (searchCriteria.limit) {
                searchParams.append('aantal', Math.min(searchCriteria.limit, 100));
            }

            const url = `${this.baseUrl}/zoeken?${searchParams.toString()}`;

            const response = await this.makeKVKRequest(url);

            if (response.resultaten) {
                return response.resultaten.map(business => ({
                    kvkNumber: business.kvkNummer,
                    name: business.handelsnaam || business.statutaireNaam,
                    address: this.formatAddress(business.adres),
                    city: business.adres?.plaats,
                    postalCode: business.adres?.postcode,
                    sbiCode: sbiCode,
                    type: 'dental_practice',
                    source: 'kvk_api'
                }));
            }

            return [];

        } catch (error) {
            console.error(`❌ Error searching KVK by SBI code ${sbiCode}:`, error);
            return [];
        }
    }

    async makeKVKRequest(url) {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'apikey': this.apiKey,
                    'Accept': 'application/json'
                }
            };

            https.get(url, options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200) {
                            resolve(parsed);
                        } else {
                            reject(new Error(`KVK API error: ${res.statusCode} - ${parsed.message || data}`));
                        }
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}`));
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    formatAddress(address) {
        if (!address) return '';

        const parts = [];
        if (address.straatnaam) parts.push(address.straatnaam);
        if (address.huisnummer) parts.push(address.huisnummer);
        if (address.huisnummerToevoeging) parts.push(address.huisnummerToevoeging);

        return parts.join(' ');
    }

    async enrichBusinessData(businesses, searchCriteria) {
        try {
            const enrichedBusinesses = [];

            for (const business of businesses) {
                // Get detailed business profile
                const profile = await this.getBusinessProfile(business.kvkNumber);

                const enriched = {
                    ...business,
                    ...profile,
                    id: `kvk_${business.kvkNumber}`,
                    cid: null, // Will be populated by Google Maps search
                    category: 'Dental clinic',
                    businessType: 'dental_practice',
                    discoveryMethod: 'kvk_api',
                    discoveredAt: new Date(),
                    needsGoogleMapsData: true,
                    searchQuery: `${business.name} ${business.address} ${business.city}`
                };

                enrichedBusinesses.push(enriched);

                if (searchCriteria.limit && enrichedBusinesses.length >= searchCriteria.limit) {
                    break;
                }
            }

            return enrichedBusinesses;

        } catch (error) {
            console.error(`❌ Error enriching business data:`, error);
            return businesses;
        }
    }

    async getBusinessProfile(kvkNumber) {
        try {
            if (!this.apiKey) {
                return {};
            }

            const url = `https://api.kvk.nl/test/api/v1/basisprofielen/${kvkNumber}`;
            const profile = await this.makeKVKRequest(url);

            return {
                legalName: profile.statutaireNaam,
                tradeNames: profile.handelsNamen || [],
                establishmentDate: profile.datumAanvang,
                businessStatus: profile.indicatieEconomischActief ? 'active' : 'inactive',
                employees: profile.personen?.length || 0,
                website: profile.websites?.[0]?.url,
                phone: profile.communicatiegegevens?.telefoon,
                email: profile.communicatiegegevens?.email
            };

        } catch (error) {
            console.error(`❌ Error getting business profile for ${kvkNumber}:`, error);
            return {};
        }
    }

    generateMockDentalPractices(searchCriteria) {
        console.log(`🔧 Generating mock Dutch dental practices for: ${searchCriteria.location || 'Netherlands'}`);

        const mockPractices = [
            {
                id: 'kvk_mock_001',
                kvkNumber: '12345678',
                name: 'Tandartspraktijk Amsterdam Centrum',
                legalName: 'Tandartspraktijk Amsterdam Centrum B.V.',
                address: 'Damrak 123',
                city: 'Amsterdam',
                postalCode: '1012 AB',
                category: 'Dental clinic',
                businessType: 'dental_practice',
                sbiCode: '86230',
                phone: '+31 20 123 4567',
                website: 'www.tandarts-amsterdam-centrum.nl',
                discoveryMethod: 'kvk_mock',
                discoveredAt: new Date(),
                needsGoogleMapsData: true,
                searchQuery: 'Tandartspraktijk Amsterdam Centrum Damrak 123 Amsterdam'
            },
            {
                id: 'kvk_mock_002',
                kvkNumber: '23456789',
                name: 'Dental Care Rotterdam',
                legalName: 'Dental Care Rotterdam B.V.',
                address: 'Coolsingel 456',
                city: 'Rotterdam',
                postalCode: '3012 CD',
                category: 'Dental clinic',
                businessType: 'dental_practice',
                sbiCode: '86230',
                phone: '+31 10 234 5678',
                website: 'www.dentalcare-rotterdam.nl',
                discoveryMethod: 'kvk_mock',
                discoveredAt: new Date(),
                needsGoogleMapsData: true,
                searchQuery: 'Dental Care Rotterdam Coolsingel 456 Rotterdam'
            },
            {
                id: 'kvk_mock_003',
                kvkNumber: '34567890',
                name: 'Tandarts Den Haag Centrum',
                legalName: 'Tandartspraktijk Den Haag Centrum V.O.F.',
                address: 'Lange Voorhout 789',
                city: 'Den Haag',
                postalCode: '2514 EF',
                category: 'Dental clinic',
                businessType: 'dental_practice',
                sbiCode: '86230',
                phone: '+31 70 345 6789',
                website: 'www.tandarts-denhaag.nl',
                discoveryMethod: 'kvk_mock',
                discoveredAt: new Date(),
                needsGoogleMapsData: true,
                searchQuery: 'Tandarts Den Haag Centrum Lange Voorhout 789 Den Haag'
            },
            {
                id: 'kvk_mock_004',
                kvkNumber: '45678901',
                name: 'Utrecht Dental Specialists',
                legalName: 'Utrecht Dental Specialists B.V.',
                address: 'Oudegracht 321',
                city: 'Utrecht',
                postalCode: '3511 PE',
                category: 'Dental clinic',
                businessType: 'dental_practice',
                sbiCode: '86221',
                phone: '+31 30 456 7890',
                website: 'www.utrecht-dental.nl',
                discoveryMethod: 'kvk_mock',
                discoveredAt: new Date(),
                needsGoogleMapsData: true,
                searchQuery: 'Utrecht Dental Specialists Oudegracht 321 Utrecht'
            },
            {
                id: 'kvk_mock_005',
                kvkNumber: '56789012',
                name: 'Tandartspraktijk Eindhoven',
                legalName: 'Tandartspraktijk Eindhoven B.V.',
                address: 'Grote Markt 654',
                city: 'Eindhoven',
                postalCode: '5611 GH',
                category: 'Dental clinic',
                businessType: 'dental_practice',
                sbiCode: '86230',
                phone: '+31 40 567 8901',
                website: 'www.tandarts-eindhoven.nl',
                discoveryMethod: 'kvk_mock',
                discoveredAt: new Date(),
                needsGoogleMapsData: true,
                searchQuery: 'Tandartspraktijk Eindhoven Grote Markt 654 Eindhoven'
            }
        ];

        // Filter by location if specified
        if (searchCriteria.location || searchCriteria.city) {
            const targetLocation = (searchCriteria.location || searchCriteria.city).toLowerCase();

            // If searching for "Netherlands" or similar broad terms, return all practices
            if (targetLocation.includes('netherlands') || targetLocation.includes('nederland') ||
                targetLocation.includes('holland') || targetLocation === 'nl') {
                return mockPractices.slice(0, searchCriteria.limit || 5);
            }

            // Otherwise filter by specific city
            return mockPractices.filter(practice =>
                practice.city.toLowerCase().includes(targetLocation) ||
                targetLocation.includes(practice.city.toLowerCase())
            ).slice(0, searchCriteria.limit || 10);
        }

        return mockPractices.slice(0, searchCriteria.limit || 5);
    }

    async shutdown() {
        console.log(`🔄 Shutting down KVK Business Discovery Agent...`);
        this.isInitialized = false;
    }
}

module.exports = new KVKBusinessDiscoveryAgent();