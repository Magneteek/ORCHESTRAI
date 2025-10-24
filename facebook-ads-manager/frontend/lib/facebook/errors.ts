/**
 * Facebook API Error Handling
 * Custom error classes for Facebook Marketing API integration
 */

import { FacebookAPIError, RateLimitInfo } from '@/types/facebook';

/**
 * Base Facebook API Error
 */
export class FacebookError extends Error {
  public readonly code: number;
  public readonly subcode?: number;
  public readonly type: string;
  public readonly fbtraceId: string;
  public readonly isTransient: boolean;
  public readonly userTitle?: string;
  public readonly userMessage?: string;

  constructor(error: FacebookAPIError) {
    super(error.message);
    this.name = 'FacebookError';
    this.code = error.code;
    this.subcode = error.error_subcode;
    this.type = error.type;
    this.fbtraceId = error.fbtrace_id;
    this.isTransient = error.is_transient || false;
    this.userTitle = error.error_user_title;
    this.userMessage = error.error_user_msg;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FacebookError);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      subcode: this.subcode,
      type: this.type,
      fbtraceId: this.fbtraceId,
      isTransient: this.isTransient,
      userTitle: this.userTitle,
      userMessage: this.userMessage,
    };
  }
}

/**
 * OAuth Authentication Errors
 */
export class FacebookOAuthError extends FacebookError {
  constructor(error: FacebookAPIError) {
    super(error);
    this.name = 'FacebookOAuthError';
  }

  static isOAuthError(code: number): boolean {
    // OAuth error codes
    return [
      190, // Invalid OAuth 2.0 Access Token
      102, // Session key invalid
      463, // Session has expired
      467, // Invalid access token signature
    ].includes(code);
  }
}

/**
 * Rate Limit Errors
 */
export class FacebookRateLimitError extends FacebookError {
  public readonly rateLimitInfo?: RateLimitInfo;
  public readonly retryAfter?: number;

  constructor(error: FacebookAPIError, rateLimitInfo?: RateLimitInfo) {
    super(error);
    this.name = 'FacebookRateLimitError';
    this.rateLimitInfo = rateLimitInfo;
    this.retryAfter = rateLimitInfo?.estimated_time_to_regain_access;
  }

  static isRateLimitError(code: number): boolean {
    // Rate limit error codes
    return [
      4,   // Application request limit reached
      17,  // User request limit reached
      32,  // Page request limit reached
      613, // Calls to this api have exceeded the rate limit
      80001, // There have been too many calls to this ad-account
    ].includes(code);
  }

  /**
   * Calculate backoff delay in milliseconds
   */
  getBackoffDelay(baseDelayMs: number = 1000, attempt: number = 1): number {
    if (this.retryAfter) {
      return this.retryAfter * 1000; // Convert to milliseconds
    }

    // Exponential backoff: base * 2^attempt with jitter
    const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
    const jitter = Math.random() * 1000;
    return Math.min(exponentialDelay + jitter, 60000); // Max 60 seconds
  }
}

/**
 * Permission Errors
 */
export class FacebookPermissionError extends FacebookError {
  public readonly requiredPermissions: string[];

  constructor(error: FacebookAPIError, requiredPermissions: string[] = []) {
    super(error);
    this.name = 'FacebookPermissionError';
    this.requiredPermissions = requiredPermissions;
  }

  static isPermissionError(code: number): boolean {
    // Permission error codes
    return [
      10,   // Permission denied
      200,  // Permission error
      220,  // Album or subject not visible
      299,  // Permission denied to access object
      3,    // Unknown method (often permission-related)
    ].includes(code);
  }
}

/**
 * Validation Errors
 */
export class FacebookValidationError extends FacebookError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(error: FacebookAPIError, field?: string, value?: unknown) {
    super(error);
    this.name = 'FacebookValidationError';
    this.field = field;
    this.value = value;
  }

  static isValidationError(code: number): boolean {
    // Validation error codes
    return [
      100,  // Invalid parameter
      2200, // Basic error
      2201, // Edit failure
      2202, // Edit error
    ].includes(code);
  }
}

/**
 * Budget/Billing Errors
 */
export class FacebookBudgetError extends FacebookError {
  constructor(error: FacebookAPIError) {
    super(error);
    this.name = 'FacebookBudgetError';
  }

  static isBudgetError(code: number): boolean {
    // Budget/billing error codes
    return [
      2204, // Insufficient budget
      3004, // Billing not setup
      3005, // Billing account error
    ].includes(code);
  }
}

/**
 * Ad Review/Approval Errors
 */
export class FacebookAdReviewError extends FacebookError {
  constructor(error: FacebookAPIError) {
    super(error);
    this.name = 'FacebookAdReviewError';
  }

  static isAdReviewError(code: number): boolean {
    // Ad review error codes
    return [
      1487441, // Ad is disapproved
      1487552, // Ad creative needs to be reviewed
    ].includes(code);
  }
}

/**
 * Network/Connectivity Errors
 */
export class FacebookNetworkError extends Error {
  public readonly originalError: Error;
  public readonly isTimeout: boolean;

  constructor(message: string, originalError: Error, isTimeout: boolean = false) {
    super(message);
    this.name = 'FacebookNetworkError';
    this.originalError = originalError;
    this.isTimeout = isTimeout;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FacebookNetworkError);
    }
  }
}

/**
 * Error Factory - Creates appropriate error type
 */
export class FacebookErrorFactory {
  static createError(
    error: FacebookAPIError,
    context?: {
      rateLimitInfo?: RateLimitInfo;
      requiredPermissions?: string[];
      field?: string;
      value?: unknown;
    }
  ): FacebookError {
    const { code } = error;

    if (FacebookRateLimitError.isRateLimitError(code)) {
      return new FacebookRateLimitError(error, context?.rateLimitInfo);
    }

    if (FacebookOAuthError.isOAuthError(code)) {
      return new FacebookOAuthError(error);
    }

    if (FacebookPermissionError.isPermissionError(code)) {
      return new FacebookPermissionError(error, context?.requiredPermissions);
    }

    if (FacebookValidationError.isValidationError(code)) {
      return new FacebookValidationError(error, context?.field, context?.value);
    }

    if (FacebookBudgetError.isBudgetError(code)) {
      return new FacebookBudgetError(error);
    }

    if (FacebookAdReviewError.isAdReviewError(code)) {
      return new FacebookAdReviewError(error);
    }

    // Default to base FacebookError
    return new FacebookError(error);
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: Error): boolean {
    if (error instanceof FacebookRateLimitError) {
      return true;
    }

    if (error instanceof FacebookNetworkError) {
      return true;
    }

    if (error instanceof FacebookError) {
      return error.isTransient || [
        1,   // Temporary error
        2,   // Service temporarily unavailable
        4,   // Application request limit reached
        17,  // User request limit reached
      ].includes(error.code);
    }

    return false;
  }

  /**
   * Get retry delay for error
   */
  static getRetryDelay(error: Error, attempt: number = 1): number {
    if (error instanceof FacebookRateLimitError) {
      return error.getBackoffDelay(1000, attempt);
    }

    if (error instanceof FacebookNetworkError) {
      // Exponential backoff for network errors
      return Math.min(1000 * Math.pow(2, attempt), 60000);
    }

    // Default backoff
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }

  /**
   * Check if error requires re-authentication
   */
  static requiresReauth(error: Error): boolean {
    if (!(error instanceof FacebookError)) {
      return false;
    }

    return [
      190, // Invalid OAuth 2.0 Access Token
      102, // Session key invalid
      463, // Session has expired
      467, // Invalid access token signature
    ].includes(error.code);
  }
}

/**
 * Error Logger - Structured error logging
 */
export class FacebookErrorLogger {
  static log(error: Error, context?: Record<string, unknown>) {
    if (error instanceof FacebookError) {
      console.error('[Facebook API Error]', {
        ...error.toJSON(),
        context,
        timestamp: new Date().toISOString(),
      });
    } else if (error instanceof FacebookNetworkError) {
      console.error('[Facebook Network Error]', {
        message: error.message,
        isTimeout: error.isTimeout,
        originalError: error.originalError.message,
        context,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error('[Unknown Error]', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }

  static warn(message: string, context?: Record<string, unknown>) {
    console.warn('[Facebook API Warning]', {
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  static info(message: string, context?: Record<string, unknown>) {
    console.info('[Facebook API Info]', {
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
