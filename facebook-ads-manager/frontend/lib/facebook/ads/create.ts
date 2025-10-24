/**
 * Ad Creation
 * Create Facebook ads with creative
 */

import { FacebookClient } from '../client';
import {
  FacebookAd,
  CampaignStatus,
  AdCreative,
  CallToActionType,
} from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';

export interface CreateAdParams {
  name: string;
  adsetId: string;
  status?: CampaignStatus;
  creative: CreateAdCreativeParams;
}

export interface CreateAdCreativeParams {
  name: string;
  title?: string;
  body: string;
  imageHash?: string;
  imageUrl?: string;
  videoId?: string;
  linkUrl?: string;
  callToActionType?: CallToActionType;
  pageId: string;
  instagramActorId?: string;
}

export class AdCreator {
  constructor(private client: FacebookClient) {}

  /**
   * Create a new ad with creative
   */
  async createAd(
    adAccountId: string,
    params: CreateAdParams
  ): Promise<FacebookAd | null> {
    try {
      FacebookErrorLogger.info('Creating ad', {
        adAccountId,
        name: params.name,
        adsetId: params.adsetId,
      });

      // First create the creative
      const creative = await this.createCreative(adAccountId, params.creative);

      if (!creative) {
        FacebookErrorLogger.log(new Error('Failed to create creative'), {
          operation: 'create_ad',
          adAccountId,
        });
        return null;
      }

      // Then create the ad
      const sdk = this.client.getSdk();
      const AdAccount = sdk.AdAccount;
      const account = new AdAccount(adAccountId);

      const adData: any = {
        name: params.name,
        adset_id: params.adsetId,
        creative: { creative_id: creative.id },
        status: params.status || 'PAUSED',
      };

      const response = await this.client.makeRequest(adAccountId, () =>
        account.createAd([], adData)
      ) as { id: string };

      const adId = response.id;

      FacebookErrorLogger.info('Ad created successfully', {
        adAccountId,
        adId,
        name: params.name,
        creativeId: creative.id,
      });

      // Invalidate cache
      await this.invalidateCache(params.adsetId, adAccountId);

      // Fetch and return full ad object
      const Ad = sdk.Ad;
      const ad = new Ad(adId);

      const adDataResponse = await this.client.makeRequest(adAccountId, () =>
        ad.read([
          'id',
          'account_id',
          'campaign_id',
          'adset_id',
          'name',
          'status',
          'configured_status',
          'effective_status',
          'created_time',
          'updated_time',
          'creative',
          'preview_shareable_link',
        ])
      ) as any;

      return {
        id: adDataResponse.id,
        accountId: adDataResponse.account_id,
        campaignId: adDataResponse.campaign_id,
        adsetId: adDataResponse.adset_id,
        name: adDataResponse.name,
        status: adDataResponse.status as CampaignStatus,
        configuredStatus: adDataResponse.configured_status as CampaignStatus,
        effectiveStatus: adDataResponse.effective_status,
        createdTime: adDataResponse.created_time,
        updatedTime: adDataResponse.updated_time,
        creative: adDataResponse.creative,
        preview_shareable_link: adDataResponse.preview_shareable_link,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'create_ad',
        adAccountId,
        params,
      });

      return null;
    }
  }

  /**
   * Create ad creative
   */
  async createCreative(
    adAccountId: string,
    params: CreateAdCreativeParams
  ): Promise<AdCreative | null> {
    try {
      FacebookErrorLogger.info('Creating ad creative', {
        adAccountId,
        name: params.name,
      });

      const sdk = this.client.getSdk();
      const AdAccount = sdk.AdAccount;
      const account = new AdAccount(adAccountId);

      // Build creative data based on media type
      const creativeData: any = {
        name: params.name,
        object_story_spec: {
          page_id: params.pageId,
        },
      };

      // Add Instagram actor if provided
      if (params.instagramActorId) {
        creativeData.object_story_spec.instagram_actor_id = params.instagramActorId;
      }

      // Build link data or media data
      if (params.videoId) {
        // Video ad
        creativeData.object_story_spec.video_data = {
          video_id: params.videoId,
          message: params.body,
        };

        if (params.title) {
          creativeData.object_story_spec.video_data.title = params.title;
        }

        if (params.linkUrl) {
          creativeData.object_story_spec.video_data.call_to_action = {
            type: params.callToActionType || 'LEARN_MORE',
            value: { link: params.linkUrl },
          };
        }
      } else if (params.imageHash || params.imageUrl) {
        // Image ad
        creativeData.object_story_spec.link_data = {
          message: params.body,
          link: params.linkUrl || '',
        };

        if (params.imageHash) {
          creativeData.object_story_spec.link_data.image_hash = params.imageHash;
        } else if (params.imageUrl) {
          creativeData.object_story_spec.link_data.picture = params.imageUrl;
        }

        if (params.title) {
          creativeData.object_story_spec.link_data.name = params.title;
        }

        if (params.callToActionType) {
          creativeData.object_story_spec.link_data.call_to_action = {
            type: params.callToActionType,
            value: { link: params.linkUrl || '' },
          };
        }
      } else {
        // Text-only post
        creativeData.object_story_spec.link_data = {
          message: params.body,
        };
      }

      // Create creative
      const response = await this.client.makeRequest(adAccountId, () =>
        account.createAdCreative([], creativeData)
      ) as { id: string };

      FacebookErrorLogger.info('Creative created successfully', {
        adAccountId,
        creativeId: response.id,
        name: params.name,
      });

      return {
        id: response.id,
        name: params.name,
        title: params.title,
        body: params.body,
        image_hash: params.imageHash,
        image_url: params.imageUrl,
        video_id: params.videoId,
        link_url: params.linkUrl,
        call_to_action_type: params.callToActionType,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'create_creative',
        adAccountId,
        params,
      });

      return null;
    }
  }

  /**
   * Upload image for ad
   */
  async uploadImage(
    adAccountId: string,
    imageUrl: string,
    fileName?: string
  ): Promise<{ hash: string; url: string } | null> {
    try {
      FacebookErrorLogger.info('Uploading image', {
        adAccountId,
        imageUrl,
      });

      const sdk = this.client.getSdk();
      const AdAccount = sdk.AdAccount;
      const account = new AdAccount(adAccountId);

      const response = await this.client.makeRequest(adAccountId, () =>
        account.createAdImage([], {
          url: imageUrl,
          name: fileName,
        })
      ) as any;

      const hash = response.images ? Object.keys(response.images)[0] : null;

      if (!hash) {
        throw new Error('Failed to get image hash from response');
      }

      FacebookErrorLogger.info('Image uploaded successfully', {
        adAccountId,
        hash,
      });

      return {
        hash,
        url: response.images[hash].url,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'upload_image',
        adAccountId,
        imageUrl,
      });

      return null;
    }
  }

  /**
   * Duplicate existing ad
   */
  async duplicateAd(
    adId: string,
    adAccountId: string,
    newName?: string,
    newAdSetId?: string
  ): Promise<FacebookAd | null> {
    try {
      const sdk = this.client.getSdk();
      const Ad = sdk.Ad;
      const ad = new Ad(adId);

      // Fetch original ad data
      const originalData = await this.client.makeRequest(adAccountId, () =>
        ad.read(['adset_id', 'name', 'status', 'creative'])
      ) as any;

      // Create new ad with same creative
      const adData: any = {
        name: newName || `${originalData.name} (Copy)`,
        adset_id: newAdSetId || originalData.adset_id,
        creative: { creative_id: originalData.creative.id },
        status: 'PAUSED', // Always create duplicates as paused
      };

      const AdAccount = sdk.AdAccount;
      const account = new AdAccount(adAccountId);

      const response = await this.client.makeRequest(adAccountId, () =>
        account.createAd([], adData)
      ) as { id: string };

      FacebookErrorLogger.info('Ad duplicated successfully', {
        originalAdId: adId,
        newAdId: response.id,
      });

      // Fetch and return full ad object
      const newAd = new Ad(response.id);
      const newAdData = await this.client.makeRequest(adAccountId, () =>
        newAd.read([
          'id',
          'account_id',
          'campaign_id',
          'adset_id',
          'name',
          'status',
          'configured_status',
          'effective_status',
          'created_time',
          'updated_time',
          'creative',
        ])
      ) as any;

      return {
        id: newAdData.id,
        accountId: newAdData.account_id,
        campaignId: newAdData.campaign_id,
        adsetId: newAdData.adset_id,
        name: newAdData.name,
        status: newAdData.status as CampaignStatus,
        configuredStatus: newAdData.configured_status as CampaignStatus,
        effectiveStatus: newAdData.effective_status,
        createdTime: newAdData.created_time,
        updatedTime: newAdData.updated_time,
        creative: newAdData.creative,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'duplicate_ad',
        adId,
      });

      return null;
    }
  }

  /**
   * Invalidate ad cache
   */
  private async invalidateCache(
    adSetId: string,
    adAccountId: string
  ): Promise<void> {
    await this.client.invalidateCache(`ads:adset:${adSetId}`);
    await this.client.invalidateCache(`ads:account:${adAccountId}`);
  }
}
