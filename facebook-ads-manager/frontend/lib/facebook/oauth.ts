/**
 * Facebook OAuth Implementation
 * Handle OAuth flow and token management
 */

import crypto from 'crypto';
import axios from 'axios';
import {
  FacebookOAuthTokens,
  FacebookSystemUserToken,
  FacebookTokenMetadata,
} from '@/types/facebook';
import { FacebookOAuthError, FacebookErrorLogger } from './errors';

export interface OAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  apiVersion: string;
}

export interface OAuthState {
  state: string;
  codeVerifier?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export class FacebookOAuth {
  private config: OAuthConfig;
  private baseUrl: string;

  constructor(config: OAuthConfig) {
    this.config = config;
    this.baseUrl = `https://graph.facebook.com/${config.apiVersion}`;
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  generateAuthUrl(options?: {
    scopes?: string[];
    state?: string;
    display?: 'page' | 'popup' | 'touch' | 'wap';
    authType?: 'rerequest';
    usePKCE?: boolean;
  }): { url: string; state: OAuthState } {
    const state = options?.state || this.generateState();
    const scopes = options?.scopes || this.getDefaultScopes();

    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      state,
      scope: scopes.join(','),
      response_type: 'code',
    });

    if (options?.display) {
      params.append('display', options.display);
    }

    if (options?.authType) {
      params.append('auth_type', options.authType);
    }

    let codeVerifier: string | undefined;
    if (options?.usePKCE) {
      codeVerifier = this.generateCodeVerifier();
      const codeChallenge = this.generateCodeChallenge(codeVerifier);
      params.append('code_challenge', codeChallenge);
      params.append('code_challenge_method', 'S256');
    }

    const url = `https://www.facebook.com/${this.config.apiVersion}/dialog/oauth?${params.toString()}`;

    FacebookErrorLogger.info('Generated auth URL', {
      scopes,
      usePKCE: !!options?.usePKCE,
    });

    return {
      url,
      state: {
        state,
        codeVerifier,
      },
    };
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string,
    codeVerifier?: string
  ): Promise<FacebookOAuthTokens> {
    try {
      const params: Record<string, string> = {
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        redirect_uri: this.config.redirectUri,
        code,
      };

      if (codeVerifier) {
        params.code_verifier = codeVerifier;
      }

      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params,
      });

      const data = response.data;

      FacebookErrorLogger.info('Successfully exchanged code for token', {
        expiresIn: data.expires_in,
      });

      return {
        accessToken: data.access_token,
        tokenType: data.token_type || 'bearer',
        expiresIn: data.expires_in,
        issuedAt: Date.now(),
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, { operation: 'exchange_code' });
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Exchange short-lived token for long-lived token (60 days)
   */
  async getLongLivedToken(shortLivedToken: string): Promise<FacebookOAuthTokens> {
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.config.appId,
          client_secret: this.config.appSecret,
          fb_exchange_token: shortLivedToken,
        },
      });

      const data = response.data;

      FacebookErrorLogger.info('Successfully obtained long-lived token', {
        expiresIn: data.expires_in,
      });

      return {
        accessToken: data.access_token,
        tokenType: data.token_type || 'bearer',
        expiresIn: data.expires_in,
        issuedAt: Date.now(),
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, { operation: 'get_long_lived_token' });
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Create System User token (never expires, for server-to-server)
   */
  async createSystemUserToken(
    businessId: string,
    adminToken: string,
    scopes?: string[]
  ): Promise<FacebookSystemUserToken> {
    try {
      const scopeList = scopes || this.getDefaultScopes();

      const response = await axios.post(
        `${this.baseUrl}/${businessId}/system_users`,
        {
          name: `System User ${Date.now()}`,
          role: 'ADMIN',
          system_user_id: undefined, // Will be created
        },
        {
          params: {
            access_token: adminToken,
          },
        }
      );

      const systemUserId = response.data.id;

      // Generate token for system user
      const tokenResponse = await axios.post(
        `${this.baseUrl}/${systemUserId}/access_tokens`,
        {},
        {
          params: {
            access_token: adminToken,
            scope: scopeList.join(','),
          },
        }
      );

      const tokenData = tokenResponse.data;

      FacebookErrorLogger.info('Created system user token', {
        businessId,
        systemUserId,
      });

      return {
        accessToken: tokenData.access_token,
        userId: systemUserId,
        businessId,
        expiresAt: null, // System user tokens don't expire
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, { operation: 'create_system_user_token' });
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Refresh access token (for long-lived tokens)
   */
  async refreshToken(currentToken: string): Promise<FacebookOAuthTokens> {
    // For Facebook, we exchange the current long-lived token for a new one
    return this.getLongLivedToken(currentToken);
  }

  /**
   * Validate and get token metadata
   */
  async validateToken(token: string): Promise<FacebookTokenMetadata> {
    try {
      const response = await axios.get(`${this.baseUrl}/debug_token`, {
        params: {
          input_token: token,
          access_token: `${this.config.appId}|${this.config.appSecret}`,
        },
      });

      const data = response.data.data;

      return {
        appId: data.app_id,
        userId: data.user_id,
        isValid: data.is_valid,
        scopes: data.scopes || [],
        expiresAt: data.expires_at,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, { operation: 'validate_token' });
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(token: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/me/permissions`, {
        params: {
          access_token: token,
        },
      });

      FacebookErrorLogger.info('Token revoked successfully');
      return true;
    } catch (error: any) {
      FacebookErrorLogger.log(error, { operation: 'revoke_token' });
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Get user's granted permissions
   */
  async getGrantedPermissions(token: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/permissions`, {
        params: {
          access_token: token,
        },
      });

      const permissions = response.data.data
        .filter((p: any) => p.status === 'granted')
        .map((p: any) => p.permission);

      return permissions;
    } catch (error: any) {
      FacebookErrorLogger.log(error, { operation: 'get_permissions' });
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Check if token has required permissions
   */
  async hasRequiredPermissions(
    token: string,
    requiredScopes: string[]
  ): Promise<{ hasAll: boolean; missing: string[] }> {
    const grantedScopes = await this.getGrantedPermissions(token);

    const missing = requiredScopes.filter(
      scope => !grantedScopes.includes(scope)
    );

    return {
      hasAll: missing.length === 0,
      missing,
    };
  }

  /**
   * Get default required scopes for ads management
   */
  private getDefaultScopes(): string[] {
    return [
      'ads_management',
      'ads_read',
      'business_management',
      'catalog_management',
      'pages_manage_ads',
      'pages_manage_metadata',
      'pages_read_engagement',
      'pages_read_user_content',
      'read_insights',
      'instagram_basic',
      'instagram_content_publish',
    ];
  }

  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate code verifier for PKCE
   */
  private generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate code challenge from verifier for PKCE
   */
  private generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
  }

  /**
   * Handle OAuth errors
   */
  private handleOAuthError(error: any): Error {
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      return new FacebookOAuthError({
        message: fbError.message,
        type: fbError.type,
        code: fbError.code,
        error_subcode: fbError.error_subcode,
        fbtrace_id: fbError.fbtrace_id,
      });
    }

    return new Error(error.message || 'OAuth error occurred');
  }

  /**
   * Encrypt token for storage
   */
  static encryptToken(token: string, encryptionKey: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    });
  }

  /**
   * Decrypt token from storage
   */
  static decryptToken(encryptedData: string, encryptionKey: string): string {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData);

    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

/**
 * Create OAuth instance from environment
 */
export function createOAuthFromEnv(): FacebookOAuth {
  const config: OAuthConfig = {
    appId: process.env.FACEBOOK_APP_ID!,
    appSecret: process.env.FACEBOOK_APP_SECRET!,
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/facebook`,
    apiVersion: process.env.FACEBOOK_API_VERSION || 'v22.0',
  };

  if (!config.appId || !config.appSecret) {
    throw new Error('Facebook App ID and App Secret are required');
  }

  return new FacebookOAuth(config);
}
