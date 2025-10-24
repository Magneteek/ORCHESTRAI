/**
 * Anthropic Claude API Client
 * Centralized client with error handling, retry logic, and token tracking
 */

import Anthropic from '@anthropic-ai/sdk';

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
 * Calculate estimated cost based on token usage
 * Claude Sonnet pricing: $3 per million input tokens, $15 per million output tokens
 */
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 3;
  const outputCost = (outputTokens / 1_000_000) * 15;
  return inputCost + outputCost;
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
    temperature?: number;
    maxRetries?: number;
  } = {}
): Promise<{ content: string; usage: TokenUsage }> {
  const {
    maxTokens = 4096,
    temperature = 0.7,
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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Extract content
      const content = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

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
      { maxTokens: 10, temperature: 0 }
    );
    return true;
  } catch (error) {
    console.error('Claude API health check failed:', error);
    return false;
  }
}

export default anthropic;
