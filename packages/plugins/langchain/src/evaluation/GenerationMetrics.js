/**
 * Metrics for evaluating text generation performance
 */

/**
 * Calculate BLEU score for generation
 * 
 * @param {string} generatedText The generated text
 * @param {string} referenceText The reference text
 * @returns {number} The BLEU score
 */
export function calculateBLEU(generatedText, referenceText) {
  // This is a simplified implementation of BLEU
  // In a real implementation, this would use a proper BLEU implementation
  
  // Tokenize the texts
  const generatedTokens = generatedText.toLowerCase().split(/\s+/);
  const referenceTokens = referenceText.toLowerCase().split(/\s+/);
  
  // Calculate n-gram precision for n=1 (unigrams)
  const generatedUnigrams = new Set(generatedTokens);
  const referenceUnigrams = new Set(referenceTokens);
  
  let matchCount = 0;
  for (const token of generatedUnigrams) {
    if (referenceUnigrams.has(token)) {
      matchCount++;
    }
  }
  
  // Calculate precision
  const precision = matchCount / generatedUnigrams.size;
  
  // Calculate brevity penalty
  const brevityPenalty = Math.exp(Math.min(0, 1 - (referenceTokens.length / generatedTokens.length)));
  
  // Calculate BLEU score
  return precision * brevityPenalty;
}

/**
 * Calculate ROUGE-L score for generation
 * 
 * @param {string} generatedText The generated text
 * @param {string} referenceText The reference text
 * @returns {number} The ROUGE-L score
 */
export function calculateROUGEL(generatedText, referenceText) {
  // This is a simplified implementation of ROUGE-L
  // In a real implementation, this would use a proper ROUGE-L implementation
  
  // Tokenize the texts
  const generatedTokens = generatedText.toLowerCase().split(/\s+/);
  const referenceTokens = referenceText.toLowerCase().split(/\s+/);
  
  // Calculate longest common subsequence
  const lcsLength = longestCommonSubsequence(generatedTokens, referenceTokens);
  
  // Calculate precision, recall, and F1
  const precision = lcsLength / generatedTokens.length;
  const recall = lcsLength / referenceTokens.length;
  
  // Avoid division by zero
  if (precision + recall === 0) {
    return 0;
  }
  
  // Calculate F1 score
  const f1 = (2 * precision * recall) / (precision + recall);
  
  return f1;
}

/**
 * Calculate longest common subsequence
 * 
 * @param {string[]} sequence1 The first sequence
 * @param {string[]} sequence2 The second sequence
 * @returns {number} The length of the longest common subsequence
 */
function longestCommonSubsequence(sequence1, sequence2) {
  const m = sequence1.length;
  const n = sequence2.length;
  
  // Create a table to store the lengths of longest common subsequences
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // Fill the table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (sequence1[i - 1] === sequence2[j - 1]) {
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
 * @param {string} text1 The first text
 * @param {string} text2 The second text
 * @returns {number} The semantic similarity score
 */
export function calculateSemanticSimilarity(text1, text2) {
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
 * @param {string} generatedText The generated text
 * @param {object} model The language model
 * @returns {number} The perplexity score
 */
export function calculatePerplexity(generatedText, model) {
  // This is a placeholder for a more sophisticated perplexity calculation
  // In a real implementation, this would use a language model to calculate perplexity
  
  // For now, we'll return a random value between 0 and 1
  return Math.random();
}

/**
 * Evaluate generation
 * 
 * @param {string} prompt The prompt
 * @param {string} generatedText The generated text
 * @param {string} referenceText The reference text
 * @param {object} options The evaluation options
 * @returns {object} The evaluation result
 */
export function evaluateGeneration(prompt, generatedText, referenceText, options = {}) {
  const result = {
    metrics: {}
  };
  
  // Calculate BLEU score if requested
  if (options.bleu) {
    result.metrics.bleu = calculateBLEU(generatedText, referenceText);
  }
  
  // Calculate ROUGE-L score if requested
  if (options.rouge) {
    result.metrics.rouge = calculateROUGEL(generatedText, referenceText);
  }
  
  // Calculate semantic similarity if requested
  if (options.semanticSimilarity) {
    result.metrics.semanticSimilarity = calculateSemanticSimilarity(generatedText, referenceText);
  }
  
  // Calculate perplexity if requested
  if (options.perplexity && options.model) {
    result.metrics.perplexity = calculatePerplexity(generatedText, options.model);
  }
  
  return result;
}

/**
 * Generation evaluator
 */
export class GenerationEvaluator {
  /**
   * Create a new generation evaluator
   * 
   * @param {object} options The evaluator options
   */
  constructor(options = {}) {
    this.options = options;
  }
  
  /**
   * Evaluate generation
   * 
   * @param {string} prompt The prompt
   * @param {string} generatedText The generated text
   * @param {string} referenceText The reference text
   * @returns {object} The evaluation result
   */
  evaluate(prompt, generatedText, referenceText) {
    return evaluateGeneration(prompt, generatedText, referenceText, this.options);
  }
}
