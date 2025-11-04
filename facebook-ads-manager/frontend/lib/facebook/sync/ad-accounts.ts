/**
 * Ad Accounts Sync
 * Sync Facebook Ad Accounts
 */

import { FacebookClient } from '../client';
import {
  FacebookAdAccount,
  AdAccountStatus,
  SyncOptions,
  SyncResult,
} from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';

export class AdAccountsSync {
  constructor(private client: FacebookClient) {}

  /**
   * Sync ad accounts for a business
   */
  async syncAdAccounts(
    businessId: string,
    options?: SyncOptions
  ): Promise<SyncResult<FacebookAdAccount>> {
    const cacheKey = `adaccounts:business:${businessId}`;
    const ttl = 900; // 15 minutes

    try {
      // Check cache unless force refresh
      if (!options?.forceRefresh) {
        const cached = await this.client.getCached<FacebookAdAccount[]>(
          cacheKey,
          async () => [],
          ttl
        );


        if (cached.fromCache && cached.data.length > 0) {
          FacebookErrorLogger.info('Returning cached ad accounts', {
            businessId,
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
      FacebookErrorLogger.info('Fetching ad accounts from API', {
        businessId,
      });


      const sdk = this.client.getSdk();

      const Business = sdk.Business;
      const business = new Business(businessId);


      const fields = options?.fields || [
        'id',
        'account_id',
        'name',
        'account_status',
        'currency',
        'timezone_name',
        'business',
        'business_name',
        'amount_spent',
        'balance',
        'spend_cap',
        'disable_reason',
        'created_time',
        'funding_source_details',
      ];

      const response = await this.client.makeRequest(null, () =>
        business.getOwnedAdAccounts(fields, {
          limit: options?.limit || 100,
        })
      ) as any;

      const adAccounts: FacebookAdAccount[] = response.map(
        (account: any) => ({
          id: account.id,
          accountId: account.account_id,
          name: account.name,
          accountStatus: account.account_status as AdAccountStatus,
          currency: account.currency,
          timezone: account.timezone_name,
          businessId: account.business?.id,
          businessName: account.business_name,
          amountSpent: parseFloat(account.amount_spent) / 100 || 0,
          balance: parseFloat(account.balance) / 100 || 0,
          spendCap: account.spend_cap
            ? parseFloat(account.spend_cap) / 100
            : undefined,
          disableReason: account.disable_reason,
          createdTime: account.created_time,
          fundingSourceDetails: account.funding_source_details,
        })
      );


      // Cache the results
      await this.client
        .getRedis()
        .setex(
          `facebook:cache:${cacheKey}`,
          ttl,
          JSON.stringify(adAccounts)
        );


      FacebookErrorLogger.info('Successfully synced ad accounts', {
        businessId,
        count: adAccounts.length,
      });


      return {
        success: true,
        data: adAccounts,
        syncedAt: Date.now(),
        fromCache: false,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'sync_ad_accounts',
        businessId,
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
   * Get ad account by ID
   */
  async getAdAccount(
    adAccountId: string,
    options?: SyncOptions
  ): Promise<FacebookAdAccount | null> {
    const cacheKey = `adaccount:${adAccountId}`;
    const ttl = 900; // 15 minutes

    try {
      const result = await this.client.getCached<FacebookAdAccount>(
        cacheKey,
        async () => {
          const sdk = this.client.getSdk();

          const AdAccount = sdk.AdAccount;
          const account = new AdAccount(adAccountId);


          const fields = options?.fields || [
            'id',
            'account_id',
            'name',
            'account_status',
            'currency',
            'timezone_name',
            'business',
            'business_name',
            'amount_spent',
            'balance',
            'spend_cap',
            'disable_reason',
            'created_time',
            'funding_source_details',
          ];

          const data = await this.client.makeRequest(adAccountId, () =>
            account.read(fields)
          ) as any;

          return {
            id: data.id,
            accountId: data.account_id,
            name: data.name,
            accountStatus: data.account_status as AdAccountStatus,
            currency: data.currency,
            timezone: data.timezone_name,
            businessId: data.business?.id,
            businessName: data.business_name,
            amountSpent: parseFloat(data.amount_spent) / 100 || 0,
            balance: parseFloat(data.balance) / 100 || 0,
            spendCap: data.spend_cap
              ? parseFloat(data.spend_cap) / 100
              : undefined,
            disableReason: data.disable_reason,
            createdTime: data.created_time,
            fundingSourceDetails: data.funding_source_details,
          };
        },
        ttl
      ) as any;


      return result.data;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_ad_account',
        adAccountId,
      });


      return null;
    }
  }

  /**
   * Sync ad accounts for a user
   */
  async syncUserAdAccounts(
    userId: string,
    options?: SyncOptions
  ): Promise<SyncResult<FacebookAdAccount>> {
    const cacheKey = `adaccounts:user:${userId}`;
    const ttl = 900; // 15 minutes

    try {
      if (!options?.forceRefresh) {
        const cached = await this.client.getCached<FacebookAdAccount[]>(
          cacheKey,
          async () => [],
          ttl
        );


        if (cached.fromCache && cached.data.length > 0) {
          return {
            success: true,
            data: cached.data,
            syncedAt: Date.now(),
            fromCache: true,
          };
        }
      }

      const sdk = this.client.getSdk();

      const User = sdk.User;
      const user = new User(userId);


      const fields = options?.fields || [
        'id',
        'account_id',
        'name',
        'account_status',
        'currency',
        'timezone_name',
        'business',
        'business_name',
        'amount_spent',
        'balance',
        'spend_cap',
        'disable_reason',
        'created_time',
      ];

      const response = await this.client.makeRequest(null, () =>
        user.getAdAccounts(fields, { limit: options?.limit || 100 })
      ) as any;

      const adAccounts: FacebookAdAccount[] = response.map(
        (account: any) => ({
          id: account.id,
          accountId: account.account_id,
          name: account.name,
          accountStatus: account.account_status as AdAccountStatus,
          currency: account.currency,
          timezone: account.timezone_name,
          businessId: account.business?.id,
          businessName: account.business_name,
          amountSpent: parseFloat(account.amount_spent) / 100 || 0,
          balance: parseFloat(account.balance) / 100 || 0,
          spendCap: account.spend_cap
            ? parseFloat(account.spend_cap) / 100
            : undefined,
          disableReason: account.disable_reason,
          createdTime: account.created_time,
        })
      );


      await this.client
        .getRedis()
        .setex(
          `facebook:cache:${cacheKey}`,
          ttl,
          JSON.stringify(adAccounts)
        );


      return {
        success: true,
        data: adAccounts,
        syncedAt: Date.now(),
        fromCache: false,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'sync_user_ad_accounts',
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
   * Check ad account health/status
   */
  async checkAccountHealth(adAccountId: string): Promise<{
    isActive: boolean;
    status: AdAccountStatus;
    canRunAds: boolean;
    issues: string[];
  }> {
    try {
      const account = await this.getAdAccount(adAccountId);


      if (!account) {
        return {
          isActive: false,
          status: 2, // DISABLED
          canRunAds: false,
          issues: ['Account not found'],
        };
      }

      const issues: string[] = [];
      const isActive = account.accountStatus === 1; // ACTIVE
      let canRunAds = isActive;

      if (account.disableReason) {
        issues.push(`Disabled: ${account.disableReason}`);

        canRunAds = false;
      }

      if (account.balance < 0) {
        issues.push('Negative balance');

        canRunAds = false;
      }

      if (account.spendCap && account.amountSpent >= account.spendCap) {
        issues.push('Spend cap reached');

        canRunAds = false;
      }

      return {
        isActive,
        status: account.accountStatus,
        canRunAds,
        issues,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'check_account_health',
        adAccountId,
      });


      return {
        isActive: false,
        status: 2,
        canRunAds: false,
        issues: ['Failed to check account health'],
      };
    }
  }

  /**
   * Invalidate ad account cache
   */
  async invalidateCache(adAccountId?: string): Promise<void> {
    if (adAccountId) {
      await this.client.invalidateCachePattern(`adaccount:${adAccountId}*`);

    } else {
      await this.client.invalidateCachePattern('adaccount*');

    }
  }
}
