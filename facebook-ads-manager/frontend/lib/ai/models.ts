/**
 * Which Claude model the AI features run on, and what it costs.
 *
 * Overridable with ANTHROPIC_MODEL so the model can be changed per environment
 * without a deploy. Keep the pricing table in step with the default, or the
 * cost figures in the token-usage store quietly drift from reality.
 *
 * Prices are USD per million tokens, list rate.
 */

export const DEFAULT_MODEL = 'claude-opus-5';

export function getModelId(): string {
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
}

interface ModelPricing {
  input: number;
  output: number;
}

const PRICING: Record<string, ModelPricing> = {
  'claude-opus-5': { input: 5, output: 25 },
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-opus-4-7': { input: 5, output: 25 },
  'claude-sonnet-5': { input: 3, output: 15 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 1, output: 5 },
  'claude-fable-5': { input: 10, output: 50 },
};

/**
 * Falls back to Opus-tier pricing for an unknown model rather than zero —
 * over-reporting cost is a visible surprise, under-reporting is a silent one.
 */
export function getPricing(modelId: string): ModelPricing {
  return PRICING[modelId] ?? { input: 5, output: 25 };
}

/**
 * Reasoning depth, replacing the `temperature` these call sites used to pass.
 * Sampling parameters are rejected outright on Claude Opus 5, Sonnet 5, and the
 * Opus 4.7+ family, and effort is the supported way to trade cost against
 * thoroughness. Note it is not a like-for-like swap: temperature varied
 * randomness, effort varies how hard the model works.
 */
export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';
