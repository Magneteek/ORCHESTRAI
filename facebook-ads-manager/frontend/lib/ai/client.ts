/**
 * Anthropic Claude API Client
 * Centralized client with error handling, retry logic, and token tracking
 */

import Anthropic from '@anthropic-ai/sdk';
import { getModelId, getPricing, type Effort } from './models';

// Validate API key exists
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('ANTHROPIC_API_KEY not configured - AI features will be disabled');
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder',
});

// Rate limiting state
interface RateLimitState {
  requestCount: number;
  resetAt: number;
}

const rateLimitState: RateLimitState = {
  requestCount: 0,
  resetAt: Date.now() + 60000, // Reset every minute
};

// Token usage tracking
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalCost: number; // Estimated cost in USD
}

const tokenUsageStore: Map<string, TokenUsage> = new Map();

/**
 * Estimated cost for one call, priced against whichever model actually ran.
 * Previously hardcoded to Sonnet's $3/$15, which silently under-reported by
 * ~40% the moment the model changed.
 */
function calculateCost(inputTokens: number, outputTokens: number): number {
  const { input, output } = getPricing(getModelId());
  return (inputTokens / 1_000_000) * input + (outputTokens / 1_000_000) * output;
}

/**
 * Check and enforce rate limiting
 */
function checkRateLimit(): void {
  const now = Date.now();

  // Reset counter if window expired
  if (now >= rateLimitState.resetAt) {
    rateLimitState.requestCount = 0;
    rateLimitState.resetAt = now + 60000;
  }

  // Enforce limit (50 requests per minute)
  if (rateLimitState.requestCount >= 50) {
    const waitTime = rateLimitState.resetAt - now;
    throw new Error(`Rate limit exceeded. Retry in ${Math.ceil(waitTime / 1000)} seconds`);
  }

  rateLimitState.requestCount++;
}

/**
 * Track token usage for analytics
 */
function trackTokenUsage(
  analysisType: string,
  inputTokens: number,
  outputTokens: number
): void {
  const existing = tokenUsageStore.get(analysisType) || {
    inputTokens: 0,
    outputTokens: 0,
    totalCost: 0,
  };

  existing.inputTokens += inputTokens;
  existing.outputTokens += outputTokens;
  existing.totalCost += calculateCost(inputTokens, outputTokens);

  tokenUsageStore.set(analysisType, existing);
}

/**
 * Get token usage statistics
 */
export function getTokenUsageStats(analysisType?: string): TokenUsage | Record<string, TokenUsage> {
  if (analysisType) {
    return tokenUsageStore.get(analysisType) || {
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0,
    };
  }

  return Object.fromEntries(tokenUsageStore);
}

/**
 * Main Claude API call with retry logic
 */
export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  analysisType: string,
  options: {
    maxTokens?: number;
    /** Replaces the old `temperature`; see lib/ai/models.ts. */
    effort?: Effort;
    maxRetries?: number;
  } = {}
): Promise<{ content: string; usage: TokenUsage }> {
  const {
    // Current models think by default, and max_tokens caps thinking *plus*
    // the response. The old 4096 budgeted for the answer alone and now risks
    // truncating mid-JSON, which surfaces as a parse error rather than an
    // obvious cutoff.
    maxTokens = 16000,
    effort,
    maxRetries = 3,
  } = options;

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  // Rate limiting check
  checkRateLimit();

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: getModelId(),
        max_tokens: maxTokens,
        ...(effort && { output_config: { effort } }),
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Safety classifiers can decline a request: HTTP 200, empty content and
      // stop_reason "refusal". Reading content[0] blindly would throw here.
      //
      // Cast because SDK 0.104.1 does not yet type "refusal" or stop_details,
      // while the API already returns both — narrowing to the shape we read
      // rather than `any` so a future SDK bump surfaces any mismatch.
      const stopReason = response.stop_reason as string | null;
      const stopDetails = (response as { stop_details?: { category?: string } })
        .stop_details;

      if (stopReason === 'refusal') {
        throw new Error(
          `Claude declined this ${analysisType} request` +
            (stopDetails?.category ? ` (${stopDetails.category})` : '')
        );
      }

      // Find the text block rather than assuming index 0. Current models think
      // by default and return thinking blocks first, so content[0] is often a
      // thinking block whose text is empty — indexing it returned "" and every
      // downstream JSON parse failed on an empty string.
      const textBlock = response.content.find((block) => block.type === 'text');
      const content = textBlock && textBlock.type === 'text' ? textBlock.text : '';

      if (!content) {
        throw new Error(
          `Claude returned no text content for ${analysisType} ` +
            `(stop_reason: ${stopReason})`
        );
      }

      // Track token usage
      const usage: TokenUsage = {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalCost: calculateCost(
          response.usage.input_tokens,
          response.usage.output_tokens
        ),
      };

      trackTokenUsage(analysisType, usage.inputTokens, usage.outputTokens);

      return { content, usage };
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw new Error(`Claude API error: ${error.message}`);
      }

      // Exponential backoff for retries
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Claude API call failed after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Parse JSON response from Claude
 */
export function parseClaudeJson<T>(content: string): T {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                     content.match(/```\n([\s\S]*?)\n```/);

    const jsonString = jsonMatch ? jsonMatch[1] : content;

    return JSON.parse(jsonString.trim());
  } catch (error) {
    throw new Error(`Failed to parse Claude JSON response: ${error}`);
  }
}

/**
 * Health check for Claude API
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await callClaude(
      'You are a helpful assistant.',
      'Respond with "OK"',
      'health_check',
      { maxTokens: 64, effort: 'low' }
    );
    return true;
  } catch (error) {
    console.error('Claude API health check failed:', error);
    return false;
  }
}

export default anthropic;
