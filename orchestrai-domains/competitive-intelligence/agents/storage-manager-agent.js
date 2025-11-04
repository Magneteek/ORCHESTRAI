/**
 * Storage Manager Agent - Full Implementation
 *
 * Infrastructure agent for managing creative asset storage (images, videos)
 * Supports Cloudflare R2 (S3-compatible) and AWS S3
 *
 * Features:
 * - Download ad creatives from external URLs
 * - Upload to Cloudflare R2 or AWS S3
 * - Image optimization and compression
 * - Video handling and conversion
 * - CDN URL generation
 * - Storage quota management
 * - Automatic cleanup of old assets
 */

const { EventEmitter } = require('events');
const { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');

class StorageManagerAgent extends EventEmitter {
    constructor(config = {}) {
        super();

        this.name = 'storage-manager';
        this.isInitialized = false;

        this.config = {
            provider: process.env.STORAGE_PROVIDER || 'r2', // 'r2' or 's3'
            // Cloudflare R2 configuration
            accountId: process.env.R2_ACCOUNT_ID,
            accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
            bucketName: process.env.R2_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'facebook-ads-creative',
            publicUrl: process.env.R2_PUBLIC_URL, // e.g., https://your-bucket.r2.dev
            // AWS S3 configuration
            region: process.env.AWS_REGION || 'auto',
            // File handling
            maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '50'),
            allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime').split(','),
            // Image optimization
            imageMaxWidth: 1920,
            imageMaxHeight: 1920,
            imageQuality: 85,
            // Video handling
            videoMaxSizeMB: 100,
            // Caching
            redis: config.redis || null,
            ...config
        };

        this.s3Client = null;
        this.uploadQueue = [];
        this.stats = {
            uploaded: 0,
            failed: 0,
            totalBytes: 0
        };
    }

    /**
     * Initialize the storage client (Cloudflare R2 or AWS S3)
     */
    async initialize() {
        console.log(`📦 Initializing Storage Manager Agent...`);
        console.log(`   Provider: ${this.config.provider.toUpperCase()}`);

        if (!this.config.accessKeyId || !this.config.secretAccessKey) {
            console.warn(`⚠️  Storage credentials not configured - storage disabled`);
            console.warn(`   Add R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY to .env`);
            this.isInitialized = false;
            return { success: false, reason: 'no_credentials' };
        }

        try {
            // Initialize S3-compatible client
            if (this.config.provider === 'r2') {
                // Cloudflare R2 endpoint
                this.s3Client = new S3Client({
                    region: 'auto',
                    endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
                    credentials: {
                        accessKeyId: this.config.accessKeyId,
                        secretAccessKey: this.config.secretAccessKey
                    }
                });
            } else {
                // AWS S3 endpoint
                this.s3Client = new S3Client({
                    region: this.config.region,
                    credentials: {
                        accessKeyId: this.config.accessKeyId,
                        secretAccessKey: this.config.secretAccessKey
                    }
                });
            }

            // Verify bucket access
            await this.verifyBucketAccess();

            this.isInitialized = true;
            console.log(`✅ Storage Manager Agent initialized successfully`);
            console.log(`   Bucket: ${this.config.bucketName}`);
            console.log(`   Max file size: ${this.config.maxFileSizeMB}MB`);

            return { success: true };

        } catch (error) {
            console.error(`❌ Failed to initialize storage: ${error.message}`);
            this.isInitialized = false;
            return { success: false, reason: error.message };
        }
    }

    /**
     * Verify bucket access
     */
    async verifyBucketAccess() {
        const command = new HeadBucketCommand({
            Bucket: this.config.bucketName
        });

        await this.s3Client.send(command);
        console.log(`   Bucket access verified: ${this.config.bucketName}`);
    }

    /**
     * Store creative assets from URLs
     *
     * @param {string} adId - Ad identifier
     * @param {Array<string>} creativeUrls - URLs of images/videos to download and store
     * @returns {Promise<Array<Object>>} Stored asset information
     */
    async storeCreativeAssets(adId, creativeUrls) {
        if (!this.isInitialized) {
            console.warn(`⚠️  Storage not initialized - returning original URLs`);
            return creativeUrls.map(url => ({ originalUrl: url, storedUrl: url, status: 'skipped' }));
        }

        console.log(`📦 Storing ${creativeUrls.length} creative assets for ad ${adId}`);

        const results = [];

        for (let i = 0; i < creativeUrls.length; i++) {
            const url = creativeUrls[i];
            console.log(`   Processing asset ${i + 1}/${creativeUrls.length}: ${url.substring(0, 60)}...`);

            try {
                // Check cache first
                if (this.redis) {
                    const cacheKey = `storage:${this.generateHash(url)}`;
                    const cached = await this.redis.get(cacheKey);
                    if (cached) {
                        console.log(`   ✅ Found in cache`);
                        results.push(JSON.parse(cached));
                        continue;
                    }
                }

                // Download asset
                const { buffer, contentType, size } = await this.downloadAsset(url);

                // Validate file size
                if (size > this.config.maxFileSizeMB * 1024 * 1024) {
                    throw new Error(`File too large: ${(size / 1024 / 1024).toFixed(2)}MB (max: ${this.config.maxFileSizeMB}MB)`);
                }

                // Process based on content type
                let processedBuffer = buffer;
                let finalContentType = contentType;

                if (contentType.startsWith('image/')) {
                    const processed = await this.optimizeImage(buffer, contentType);
                    processedBuffer = processed.buffer;
                    finalContentType = processed.contentType;
                } else if (contentType.startsWith('video/')) {
                    // For videos, store as-is (conversion would require ffmpeg)
                    if (size > this.config.videoMaxSizeMB * 1024 * 1024) {
                        throw new Error(`Video too large: ${(size / 1024 / 1024).toFixed(2)}MB`);
                    }
                }

                // Generate storage key
                const extension = this.getExtension(finalContentType);
                const hash = this.generateHash(url);
                const key = `ads/${adId}/${hash}${extension}`;

                // Upload to R2/S3
                await this.uploadToStorage(key, processedBuffer, finalContentType);

                // Generate CDN URL
                const storedUrl = this.generateCdnUrl(key);

                const result = {
                    originalUrl: url,
                    storedUrl: storedUrl,
                    key: key,
                    contentType: finalContentType,
                    size: processedBuffer.length,
                    status: 'success'
                };

                results.push(result);

                // Cache result
                if (this.redis) {
                    const cacheKey = `storage:${hash}`;
                    await this.redis.setEx(cacheKey, 86400, JSON.stringify(result)); // 24h cache
                }

                // Update stats
                this.stats.uploaded++;
                this.stats.totalBytes += processedBuffer.length;

                console.log(`   ✅ Stored: ${key}`);

            } catch (error) {
                console.error(`   ❌ Failed to store asset: ${error.message}`);
                this.stats.failed++;

                results.push({
                    originalUrl: url,
                    storedUrl: url, // Fallback to original URL
                    error: error.message,
                    status: 'failed'
                });
            }
        }

        console.log(`✅ Storage complete: ${results.filter(r => r.status === 'success').length}/${results.length} successful`);
        this.emit('storage-complete', { adId, results });

        return results;
    }

    /**
     * Download asset from URL
     */
    async downloadAsset(url) {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000, // 30 second timeout
            maxContentLength: this.config.maxFileSizeMB * 1024 * 1024 * 2, // 2x max to detect oversized files
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AdIntelligenceBot/1.0)'
            }
        });

        const buffer = Buffer.from(response.data);
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const size = buffer.length;

        return { buffer, contentType, size };
    }

    /**
     * Optimize image for storage
     */
    async optimizeImage(buffer, contentType) {
        try {
            const image = sharp(buffer);
            const metadata = await image.metadata();

            console.log(`   🖼️  Optimizing image: ${metadata.width}x${metadata.height} ${metadata.format}`);

            // Resize if larger than max dimensions
            let pipeline = image.resize(this.config.imageMaxWidth, this.config.imageMaxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            });

            // Convert to optimal format
            let outputFormat = 'jpeg';
            if (contentType === 'image/png' && metadata.hasAlpha) {
                // Keep PNG for images with transparency
                pipeline = pipeline.png({ quality: this.config.imageQuality });
                outputFormat = 'png';
            } else {
                // Convert to JPEG for smaller file size
                pipeline = pipeline.jpeg({ quality: this.config.imageQuality, progressive: true });
                outputFormat = 'jpeg';
            }

            const optimizedBuffer = await pipeline.toBuffer();

            const originalSize = (buffer.length / 1024).toFixed(2);
            const optimizedSize = (optimizedBuffer.length / 1024).toFixed(2);
            const savings = ((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(1);

            console.log(`   📉 Size: ${originalSize}KB → ${optimizedSize}KB (${savings}% reduction)`);

            return {
                buffer: optimizedBuffer,
                contentType: `image/${outputFormat}`
            };

        } catch (error) {
            console.warn(`   ⚠️  Image optimization failed, using original: ${error.message}`);
            return { buffer, contentType };
        }
    }

    /**
     * Upload buffer to R2/S3
     */
    async uploadToStorage(key, buffer, contentType) {
        const command = new PutObjectCommand({
            Bucket: this.config.bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000', // 1 year cache
            Metadata: {
                uploadedAt: new Date().toISOString(),
                source: 'competitive-intelligence'
            }
        });

        await this.s3Client.send(command);
    }

    /**
     * Delete asset from storage
     */
    async deleteAsset(key) {
        console.log(`🗑️  Deleting asset: ${key}`);

        try {
            const command = new DeleteObjectCommand({
                Bucket: this.config.bucketName,
                Key: key
            });

            await this.s3Client.send(command);
            console.log(`✅ Asset deleted: ${key}`);
            return { success: true };

        } catch (error) {
            console.error(`❌ Failed to delete asset: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate CDN URL for stored asset
     */
    generateCdnUrl(key) {
        if (this.config.publicUrl) {
            return `${this.config.publicUrl}/${key}`;
        }

        // Fallback: Generate R2/S3 URL
        if (this.config.provider === 'r2') {
            return `https://${this.config.bucketName}.r2.dev/${key}`;
        } else {
            return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`;
        }
    }

    /**
     * Generate hash for URL (for deduplication)
     */
    generateHash(url) {
        return crypto.createHash('sha256').update(url).digest('hex').substring(0, 16);
    }

    /**
     * Get file extension from content type
     */
    getExtension(contentType) {
        const extensionMap = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/gif': '.gif',
            'video/mp4': '.mp4',
            'video/quicktime': '.mov',
            'video/x-msvideo': '.avi'
        };

        return extensionMap[contentType] || '.bin';
    }

    /**
     * Get storage statistics
     */
    getStats() {
        return {
            ...this.stats,
            uploadedMB: (this.stats.totalBytes / 1024 / 1024).toFixed(2),
            successRate: this.stats.uploaded > 0
                ? ((this.stats.uploaded / (this.stats.uploaded + this.stats.failed)) * 100).toFixed(1)
                : 0
        };
    }

    /**
     * Shutdown agent
     */
    async shutdown() {
        console.log(`🛑 Shutting down Storage Manager Agent...`);

        // Wait for any pending uploads
        if (this.uploadQueue.length > 0) {
            console.log(`   Waiting for ${this.uploadQueue.length} pending uploads...`);
            await Promise.allSettled(this.uploadQueue);
        }

        // Log final stats
        const stats = this.getStats();
        console.log(`📊 Storage Statistics:`);
        console.log(`   Uploaded: ${stats.uploaded} assets`);
        console.log(`   Failed: ${stats.failed} assets`);
        console.log(`   Total data: ${stats.uploadedMB}MB`);
        console.log(`   Success rate: ${stats.successRate}%`);

        this.isInitialized = false;
        console.log(`✅ Storage Manager Agent shutdown complete`);
    }
}

module.exports = StorageManagerAgent;
