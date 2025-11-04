/**
 * Business Manager Accounts Sync
 * Sync Facebook Business Manager accounts
 */

import { FacebookClient } from '../client';
import {
  FacebookBusiness,
  FacebookBusinessUser,
  SyncOptions,
  SyncResult,
} from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';

export class BusinessAccountsSync {
  constructor(private client: FacebookClient) {}

  /**
   * Sync all accessible business accounts
   */
  async syncBusinessAccounts(
    userId: string,
    options?: SyncOptions
  ): Promise<SyncResult<FacebookBusiness>> {
    const cacheKey = `businesses:${userId}`;
    const ttl = 1800; // 30 minutes

    try {
      // Check cache unless force refresh
      if (!options?.forceRefresh) {
        const cached = await this.client.getCached<FacebookBusiness[]>(
          cacheKey,
          async () => [],
          ttl
        );


        if (cached.fromCache && cached.data.length > 0) {
          FacebookErrorLogger.info('Returning cached businesses', {
            userId,
            count: cached.data.length,
          });


          return {
            success: true,
            data: cached.data,
            syncedAt: Date.now(),
            fromCache: true,
          };
        }
      }

      // Fetch from API
      FacebookErrorLogger.info('Fetching businesses from API', { userId });


      const sdk = this.client.getSdk();

      const User = sdk.User;
      const user = new User(userId);


      const fields = options?.fields || [
        'id',
        'name',
        'verification_status',
        'profile_picture_uri',
        'created_time',
        'updated_time',
      ];

      const response = await this.client.makeRequest(
        null,
        () => user.getBusinesses(fields, { limit: options?.limit || 100 })
      ) as any;


      const businesses: FacebookBusiness[] = response.map((business: any) => ({
        id: business.id,
        name: business.name,
        verificationStatus: business.verification_status,
        profilePictureUri: business.profile_picture_uri,
        createdTime: business.created_time,
        updatedTime: business.updated_time,
      }));


      // Cache the results
      await this.client
        .getRedis()
        .setex(
          `facebook:cache:${cacheKey}`,
          ttl,
          JSON.stringify(businesses)
        );


      FacebookErrorLogger.info('Successfully synced businesses', {
        userId,
        count: businesses.length,
      });


      return {
        success: true,
        data: businesses,
        syncedAt: Date.now(),
        fromCache: false,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'sync_businesses',
        userId,
      });


      return {
        success: false,
        error: error,
        syncedAt: Date.now(),
        fromCache: false,
      };
    }
  }

  /**
   * Get business by ID
   */
  async getBusiness(
    businessId: string,
    options?: SyncOptions
  ): Promise<FacebookBusiness | null> {
    const cacheKey = `business:${businessId}`;
    const ttl = 1800; // 30 minutes

    try {
      const result = await this.client.getCached<FacebookBusiness>(
        cacheKey,
        async () => {
          const sdk = this.client.getSdk();

          const Business = sdk.Business;
          const business = new Business(businessId);


          const fields = options?.fields || [
            'id',
            'name',
            'verification_status',
            'profile_picture_uri',
            'created_time',
            'updated_time',
          ];

          const data = await this.client.makeRequest(null, () =>
            business.read(fields)
          ) as any;


          return {
            id: data.id,
            name: data.name,
            verificationStatus: data.verification_status,
            profilePictureUri: data.profile_picture_uri,
            createdTime: data.created_time,
            updatedTime: data.updated_time,
          };
        },
        ttl
      );


      return result.data;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_business',
        businessId,
      });


      return null;
    }
  }

  /**
   * Get business users
   */
  async getBusinessUsers(
    businessId: string,
    options?: SyncOptions
  ): Promise<FacebookBusinessUser[]> {
    const cacheKey = `business:${businessId}:users`;
    const ttl = 1800; // 30 minutes

    try {
      const result = await this.client.getCached<FacebookBusinessUser[]>(
        cacheKey,
        async () => {
          const sdk = this.client.getSdk();

          const Business = sdk.Business;
          const business = new Business(businessId);


          const fields = options?.fields || [
            'id',
            'name',
            'email',
            'role',
            'permitted_tasks',
          ];

          const response = await this.client.makeRequest(null, () =>
            business.getBusinessUsers(fields, {
              limit: options?.limit || 100,
            })
          ) as any;


          return response.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permittedTasks: user.permitted_tasks || [],
          }));

        },
        ttl
      );


      return result.data;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_business_users',
        businessId,
      });


      return [];
    }
  }

  /**
   * Get owned businesses for user
   */
  async getOwnedBusinesses(
    userId: string,
    options?: SyncOptions
  ): Promise<FacebookBusiness[]> {
    const cacheKey = `businesses:owned:${userId}`;
    const ttl = 1800; // 30 minutes

    try {
      const result = await this.client.getCached<FacebookBusiness[]>(
        cacheKey,
        async () => {
          const sdk = this.client.getSdk();

          const User = sdk.User;
          const user = new User(userId);


          const fields = options?.fields || [
            'id',
            'name',
            'verification_status',
            'profile_picture_uri',
            'created_time',
            'updated_time',
          ];

          const response = await this.client.makeRequest(null, () =>
            user.getOwnedBusinesses(fields, {
              limit: options?.limit || 100,
            })
          ) as any;


          return response.map((business: any) => ({
            id: business.id,
            name: business.name,
            verificationStatus: business.verification_status,
            profilePictureUri: business.profile_picture_uri,
            createdTime: business.created_time,
            updatedTime: business.updated_time,
          }));

        },
        ttl
      );


      return result.data;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_owned_businesses',
        userId,
      });


      return [];
    }
  }

  /**
   * Invalidate business cache
   */
  async invalidateCache(businessId?: string): Promise<void> {
    if (businessId) {
      await this.client.invalidateCachePattern(`business:${businessId}*`);

    } else {
      await this.client.invalidateCachePattern('business*');

    }
  }
}
