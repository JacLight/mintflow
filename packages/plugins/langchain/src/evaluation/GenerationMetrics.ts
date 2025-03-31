/**
 * Metrics for evaluating text generation performance
 */

/**
 * Interface for generation evaluation results
 */
export interface GenerationEvaluationResult {
  /**
   * The overall score of the generation
   * A value between 0 and 1, where 1 is the best
   */
  overallScore: number;
  
  /**
   * The relevance score of the generation
   * Measures how relevant the generation is to the prompt
   */
  relevanceScore: number;
  
  /**
   * The coherence score of the generation
   * Measures how coherent and logical the generation is
   */
  coherenceScore: number;
  
  /**
   * The fluency score of the generation
   * Measures how natural and fluent the generation is
   */
  fluencyScore: number;
  
  /**
   * The groundedness score of the generation
   * Measures how grounded the generation is in facts
   */
  groundednessScore: number;
  
  /**
   * The hallucination score of the generation
   * Measures how much the generation hallucinates
   * Lower is better
   */
  hallucinationScore: number;
  
  /**
   * The toxicity score of the generation
   * Measures how toxic the generation is
   * Lower is better
   */
  toxicityScore: number;
  
  /**
   * The time taken to generate the text in milliseconds
   */
  latencyMs: number;
  
  /**
   * Additional metrics specific to the generation method
   */
  additionalMetrics?: Record<string, number>;
}

/**
 * Options for evaluating generation
 */
export interface GenerationEvaluationOptions {
  /**
   * The reference text to compare against
   * Optional for some metrics
   */
  reference?: string;
  
  /**
   * Whether to include latency measurements
   */
  includeLatency?: boolean;
  
  /**
   * The evaluation model to use for subjective metrics
   */
  evaluationModel?: string;
  
  /**
   * The API key for the evaluation model
   */
  evaluationModelApiKey?: string;
  
  /**
   * Whether to use exact match for relevance
   */
  useExactMatch?: boolean;
  
  /**
   * Whether to check for factual accuracy
   */
  checkFactualAccuracy?: boolean;
  
  /**
   * Whether to check for toxicity
   */
  checkToxicity?: boolean;
  
  /**
   * Additional options specific to the generation method
   */
  additionalOptions?: Record<string, any>;
}

/**
 * Calculate BLEU score for generation
 * 
 * @param generated The generated text
 * @param reference The reference text
 * @returns The BLEU score
 */
export function calculateBLEU(generated: string, reference: string): number {
  // Tokenize the texts
  const generatedTokens = generated.toLowerCase().split(/\s+/);
  const referenceTokens = reference.toLowerCase().split(/\s+/);
  
  // Calculate n-gram precision for n=1,2,3,4
  const maxN = 4;
  const precisions: number[] = [];
  
  for (let n = 1; n <= maxN; n++) {
    const nGramMatches = countNGramMatches(generatedTokens, referenceTokens, n);
    const totalNGrams = Math.max(0, generatedTokens.length - n + 1);
    
    precisions.push(totalNGrams === 0 ? 0 : nGramMatches / totalNGrams);
  }
  
  // Calculate brevity penalty
  const brevityPenalty = Math.exp(
    Math.min(0, 1 - referenceTokens.length / generatedTokens.length)
  );
  
  // Calculate geometric mean of precisions
  const geometricMean = precisions.reduce((product, p) => product * (p || 1), 1) ** (1 / maxN);
  
  // Return BLEU score
  return brevityPenalty * geometricMean;
}

/**
 * Count n-gram matches between generated and reference texts
 * 
 * @param generatedTokens The generated tokens
 * @param referenceTokens The reference tokens
 * @param n The n-gram size
 * @returns The number of matching n-grams
 */
function countNGramMatches(
  generatedTokens: string[],
  referenceTokens: string[],
  n: number
): number {
  const generatedNGrams = getNGrams(generatedTokens, n);
  const referenceNGrams = getNGrams(referenceTokens, n);
  
  let matches = 0;
  
  for (const nGram of generatedNGrams) {
    if (referenceNGrams.has(nGram)) {
      matches++;
      referenceNGrams.delete(nGram); // Count each reference n-gram only once
    }
  }
  
  return matches;
}

/**
 * Get n-grams from tokens
 * 
 * @param tokens The tokens
 * @param n The n-gram size
 * @returns The set of n-grams
 */
function getNGrams(tokens: string[], n: number): Set<string> {
  const nGrams = new Set<string>();
  
  for (let i = 0; i <= tokens.length - n; i++) {
    nGrams.add(tokens.slice(i, i + n).join(' '));
  }
  
  return nGrams;
}

/**
 * Calculate ROUGE-L score for generation
 * 
 * @param generated The generated text
 * @param reference The reference text
 * @returns The ROUGE-L score
 */
export function calculateROUGEL(generated: string, reference: string): number {
  // Tokenize the texts
  const generatedTokens = generated.toLowerCase().split(/\s+/);
  const referenceTokens = reference.toLowerCase().split(/\s+/);
  
  // Calculate longest common subsequence
  const lcsLength = calculateLCS(generatedTokens, referenceTokens);
  
  // Calculate precision, recall, and F1 score
  const precision = lcsLength / generatedTokens.length;
  const recall = lcsLength / referenceTokens.length;
  
  if (precision + recall === 0) {
    return 0;
  }
  
  // Return F1 score
  return (2 * precision * recall) / (precision + recall);
}

/**
 * Calculate longest common subsequence length
 * 
 * @param a The first sequence
 * @param b The second sequence
 * @returns The length of the longest common subsequence
 */
function calculateLCS(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  
  // Create a table to store LCS lengths
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));
  
  // Fill the table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Calculate semantic similarity between two texts
 * 
 * @param text1 The first text
 * @param text2 The second text
 * @returns The semantic similarity score
 */
export function calculateSemanticSimilarity(text1: string, text2: string): number {
  // This is a placeholder for a more sophisticated semantic similarity calculation
  // In a real implementation, this would use embeddings or a language model
  
  // For now, we'll use a simple Jaccard similarity
  const tokens1 = new Set(text1.toLowerCase().split(/\s+/));
  const tokens2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...tokens1].filter(token => tokens2.has(token)));
  const union = new Set([...tokens1, ...tokens2]);
  
  return intersection.size / union.size;
}

/**
 * Calculate perplexity of generated text
 * 
 * @param text The text to calculate perplexity for
 * @param model The language model to use
 * @returns The perplexity score
 */
export function calculatePerplexity(text: string, model?: any): number {
  // This is a placeholder for a more sophisticated perplexity calculation
  // In a real implementation, this would use a language model
  
  // For now, we'll return a random value between 1 and 100
  return Math.random() * 99 + 1;
}

/**
 * Evaluate generation results
 * 
 * @param prompt The prompt used for generation
 * @param generated The generated text
 * @param options The evaluation options
 * @returns The evaluation results
 */
export function evaluateGeneration(
  prompt: string,
  generated: string,
  options: GenerationEvaluationOptions
): GenerationEvaluationResult {
  // Calculate relevance score
  let relevanceScore = 0;
  if (options.reference) {
    // If we have a reference, use BLEU and ROUGE-L
    const bleuScore = calculateBLEU(generated, options.reference);
    const rougeScore = calculateROUGEL(generated, options.reference);
    relevanceScore = (bleuScore + rougeScore) / 2;
  } else {
    // Otherwise, use semantic similarity between prompt and generated text
    relevanceScore = calculateSemanticSimilarity(prompt, generated);
  }
  
  // Calculate coherence score (placeholder)
  // In a real implementation, this would use a language model
  const coherenceScore = 0.8;
  
  // Calculate fluency score (placeholder)
  // In a real implementation, this would use a language model
  const fluencyScore = 0.9;
  
  // Calculate groundedness score (placeholder)
  // In a real implementation, this would check against a knowledge base
  const groundednessScore = options.checkFactualAccuracy ? 0.7 : 1.0;
  
  // Calculate hallucination score (placeholder)
  // In a real implementation, this would check against a knowledge base
  const hallucinationScore = options.checkFactualAccuracy ? 0.3 : 0.0;
  
  // Calculate toxicity score (placeholder)
  // In a real implementation, this would use a toxicity classifier
  const toxicityScore = options.checkToxicity ? 0.1 : 0.0;
  
  // Calculate overall score
  const overallScore = (
    relevanceScore * 0.3 +
    coherenceScore * 0.2 +
    fluencyScore * 0.2 +
    groundednessScore * 0.2 -
    hallucinationScore * 0.05 -
    toxicityScore * 0.05
  );
  
  // Return evaluation results
  return {
    overallScore,
    relevanceScore,
    coherenceScore,
    fluencyScore,
    groundednessScore,
    hallucinationScore,
    toxicityScore,
    latencyMs: 0, // Set by the caller if includeLatency is true
    additionalMetrics: options.additionalOptions
  };
}

/**
 * Class for evaluating generation performance
 */
export class GenerationEvaluator {
  private options: GenerationEvaluationOptions;
  
  /**
   * Create a new GenerationEvaluator
   * 
   * @param options The evaluation options
   */
  constructor(options: GenerationEvaluationOptions) {
    this.options = options;
  }
  
  /**
   * Evaluate generation results
   * 
   * @param prompt The prompt used for generation
   * @param generated The generated text
   * @param latencyMs Optional latency in milliseconds
   * @returns The evaluation results
   */
  evaluate(
    prompt: string,
    generated: string,
    latencyMs?: number
  ): GenerationEvaluationResult {
    const result = evaluateGeneration(prompt, generated, this.options);
    
    if (this.options.includeLatency && latencyMs !== undefined) {
      result.latencyMs = latencyMs;
    }
    
    return result;
  }
  
  /**
   * Evaluate multiple generation results
   * 
   * @param prompts The prompts used for generation
   * @param generatedTexts The generated texts
   * @param latencyMs Optional latency in milliseconds
   * @returns The evaluation results
   */
  evaluateMultiple(
    prompts: string[],
    generatedTexts: string[],
    latencyMs?: number
  ): GenerationEvaluationResult[] {
    if (prompts.length !== generatedTexts.length) {
      throw new Error('Number of prompts must match number of generated texts');
    }
    
    return prompts.map((prompt, i) => this.evaluate(prompt, generatedTexts[i], latencyMs));
  }
  
  /**
   * Get the options used for evaluation
   * 
   * @returns The evaluation options
   */
  getOptions(): GenerationEvaluationOptions {
    return this.options;
  }
  
  /**
   * Set the options used for evaluation
   * 
   * @param options The evaluation options
   */
  setOptions(options: GenerationEvaluationOptions): void {
    this.options = options;
  }
}
