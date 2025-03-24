/**
 * Metrics for evaluating retrieval performance
 */

/**
 * Interface for retrieval evaluation results
 */
export interface RetrievalEvaluationResult {
  /**
   * Precision of the retrieval
   * The fraction of retrieved documents that are relevant
   */
  precision: number;
  
  /**
   * Recall of the retrieval
   * The fraction of relevant documents that are retrieved
   */
  recall: number;
  
  /**
   * F1 score of the retrieval
   * The harmonic mean of precision and recall
   */
  f1Score: number;
  
  /**
   * Mean reciprocal rank of the retrieval
   * The average of the reciprocal ranks of the first relevant document
   */
  mrr: number;
  
  /**
   * Mean average precision of the retrieval
   * The mean of the average precision scores for each query
   */
  map: number;
  
  /**
   * Normalized discounted cumulative gain of the retrieval
   * Measures the ranking quality of the retrieved documents
   */
  ndcg: number;
  
  /**
   * The time taken to retrieve the documents in milliseconds
   */
  latencyMs: number;
  
  /**
   * Additional metrics specific to the retrieval method
   */
  additionalMetrics?: Record<string, number>;
}

/**
 * Options for evaluating retrieval
 */
export interface RetrievalEvaluationOptions {
  /**
   * The ground truth relevant documents for each query
   */
  groundTruth: Map<string, string[]>;
  
  /**
   * Whether to include latency measurements
   */
  includeLatency?: boolean;
  
  /**
   * The k value for precision@k, recall@k, etc.
   */
  k?: number;
  
  /**
   * Additional options specific to the retrieval method
   */
  additionalOptions?: Record<string, any>;
}

/**
 * Calculate precision of retrieval results
 * 
 * @param retrieved The retrieved documents
 * @param relevant The relevant documents
 * @param k Optional k value for precision@k
 * @returns The precision value
 */
export function calculatePrecision(
  retrieved: string[],
  relevant: string[],
  k?: number
): number {
  if (retrieved.length === 0) {
    return 0;
  }
  
  const retrievedSet = new Set(k ? retrieved.slice(0, k) : retrieved);
  const relevantSet = new Set(relevant);
  
  let relevantRetrieved = 0;
  retrievedSet.forEach(doc => {
    if (relevantSet.has(doc)) {
      relevantRetrieved++;
    }
  });
  
  return relevantRetrieved / retrievedSet.size;
}

/**
 * Calculate recall of retrieval results
 * 
 * @param retrieved The retrieved documents
 * @param relevant The relevant documents
 * @param k Optional k value for recall@k
 * @returns The recall value
 */
export function calculateRecall(
  retrieved: string[],
  relevant: string[],
  k?: number
): number {
  if (relevant.length === 0) {
    return 1.0; // Perfect recall if there are no relevant documents
  }
  
  const retrievedSet = new Set(k ? retrieved.slice(0, k) : retrieved);
  const relevantSet = new Set(relevant);
  
  let relevantRetrieved = 0;
  relevantSet.forEach(doc => {
    if (retrievedSet.has(doc)) {
      relevantRetrieved++;
    }
  });
  
  return relevantRetrieved / relevantSet.size;
}

/**
 * Calculate F1 score of retrieval results
 * 
 * @param precision The precision value
 * @param recall The recall value
 * @returns The F1 score
 */
export function calculateF1Score(precision: number, recall: number): number {
  if (precision + recall === 0) {
    return 0;
  }
  
  return (2 * precision * recall) / (precision + recall);
}

/**
 * Calculate mean reciprocal rank of retrieval results
 * 
 * @param retrievedLists The lists of retrieved documents for each query
 * @param relevantLists The lists of relevant documents for each query
 * @returns The mean reciprocal rank
 */
export function calculateMRR(
  retrievedLists: string[][],
  relevantLists: string[][]
): number {
  if (retrievedLists.length === 0) {
    return 0;
  }
  
  let totalRR = 0;
  
  for (let i = 0; i < retrievedLists.length; i++) {
    const retrieved = retrievedLists[i];
    const relevant = new Set(relevantLists[i]);
    
    let reciprocalRank = 0;
    
    for (let j = 0; j < retrieved.length; j++) {
      if (relevant.has(retrieved[j])) {
        reciprocalRank = 1 / (j + 1);
        break;
      }
    }
    
    totalRR += reciprocalRank;
  }
  
  return totalRR / retrievedLists.length;
}

/**
 * Calculate mean average precision of retrieval results
 * 
 * @param retrievedLists The lists of retrieved documents for each query
 * @param relevantLists The lists of relevant documents for each query
 * @returns The mean average precision
 */
export function calculateMAP(
  retrievedLists: string[][],
  relevantLists: string[][]
): number {
  if (retrievedLists.length === 0) {
    return 0;
  }
  
  let totalAP = 0;
  
  for (let i = 0; i < retrievedLists.length; i++) {
    const retrieved = retrievedLists[i];
    const relevant = new Set(relevantLists[i]);
    
    let relevantCount = 0;
    let sumPrecision = 0;
    
    for (let j = 0; j < retrieved.length; j++) {
      if (relevant.has(retrieved[j])) {
        relevantCount++;
        sumPrecision += relevantCount / (j + 1);
      }
    }
    
    const ap = relevant.size === 0 ? 0 : sumPrecision / relevant.size;
    totalAP += ap;
  }
  
  return totalAP / retrievedLists.length;
}

/**
 * Calculate normalized discounted cumulative gain of retrieval results
 * 
 * @param retrieved The retrieved documents
 * @param relevant The relevant documents
 * @param k Optional k value for NDCG@k
 * @returns The NDCG value
 */
export function calculateNDCG(
  retrieved: string[],
  relevant: string[],
  k?: number
): number {
  if (relevant.length === 0) {
    return 1.0; // Perfect NDCG if there are no relevant documents
  }
  
  const retrievedSlice = k ? retrieved.slice(0, k) : retrieved;
  const relevantSet = new Set(relevant);
  
  // Calculate DCG
  let dcg = 0;
  for (let i = 0; i < retrievedSlice.length; i++) {
    if (relevantSet.has(retrievedSlice[i])) {
      // Using binary relevance (0 or 1)
      dcg += 1 / Math.log2(i + 2); // +2 because log2(1) = 0
    }
  }
  
  // Calculate ideal DCG
  const idealDCG = relevant.length < retrievedSlice.length
    ? relevant.length
    : retrievedSlice.length;
  
  let idcg = 0;
  for (let i = 0; i < idealDCG; i++) {
    idcg += 1 / Math.log2(i + 2);
  }
  
  return idcg === 0 ? 0 : dcg / idcg;
}

/**
 * Evaluate retrieval results
 * 
 * @param queries The queries used for retrieval
 * @param retrievedLists The lists of retrieved documents for each query
 * @param options The evaluation options
 * @returns The evaluation results
 */
export function evaluateRetrieval(
  queries: string[],
  retrievedLists: string[][],
  options: RetrievalEvaluationOptions
): RetrievalEvaluationResult {
  if (queries.length !== retrievedLists.length) {
    throw new Error('Number of queries must match number of retrieved lists');
  }
  
  const k = options.k;
  const relevantLists: string[][] = [];
  
  // Get relevant documents for each query
  for (const query of queries) {
    const relevant = options.groundTruth.get(query) || [];
    relevantLists.push(relevant);
  }
  
  // Calculate precision and recall for each query
  const precisions: number[] = [];
  const recalls: number[] = [];
  
  for (let i = 0; i < queries.length; i++) {
    const precision = calculatePrecision(retrievedLists[i], relevantLists[i], k);
    const recall = calculateRecall(retrievedLists[i], relevantLists[i], k);
    
    precisions.push(precision);
    recalls.push(recall);
  }
  
  // Calculate average precision and recall
  const avgPrecision = precisions.reduce((sum, p) => sum + p, 0) / precisions.length;
  const avgRecall = recalls.reduce((sum, r) => sum + r, 0) / recalls.length;
  
  // Calculate F1 score
  const f1Score = calculateF1Score(avgPrecision, avgRecall);
  
  // Calculate MRR
  const mrr = calculateMRR(retrievedLists, relevantLists);
  
  // Calculate MAP
  const map = calculateMAP(retrievedLists, relevantLists);
  
  // Calculate NDCG for each query
  const ndcgs: number[] = [];
  
  for (let i = 0; i < queries.length; i++) {
    const ndcg = calculateNDCG(retrievedLists[i], relevantLists[i], k);
    ndcgs.push(ndcg);
  }
  
  // Calculate average NDCG
  const avgNDCG = ndcgs.reduce((sum, n) => sum + n, 0) / ndcgs.length;
  
  // Return evaluation results
  return {
    precision: avgPrecision,
    recall: avgRecall,
    f1Score,
    mrr,
    map,
    ndcg: avgNDCG,
    latencyMs: 0, // Set by the caller if includeLatency is true
    additionalMetrics: options.additionalOptions
  };
}

/**
 * Class for evaluating retrieval performance
 */
export class RetrievalEvaluator {
  private options: RetrievalEvaluationOptions;
  
  /**
   * Create a new RetrievalEvaluator
   * 
   * @param options The evaluation options
   */
  constructor(options: RetrievalEvaluationOptions) {
    this.options = options;
  }
  
  /**
   * Evaluate retrieval results
   * 
   * @param queries The queries used for retrieval
   * @param retrievedLists The lists of retrieved documents for each query
   * @param latencyMs Optional latency in milliseconds
   * @returns The evaluation results
   */
  evaluate(
    queries: string[],
    retrievedLists: string[][],
    latencyMs?: number
  ): RetrievalEvaluationResult {
    const result = evaluateRetrieval(queries, retrievedLists, this.options);
    
    if (this.options.includeLatency && latencyMs !== undefined) {
      result.latencyMs = latencyMs;
    }
    
    return result;
  }
  
  /**
   * Evaluate a single query
   * 
   * @param query The query used for retrieval
   * @param retrieved The retrieved documents
   * @param latencyMs Optional latency in milliseconds
   * @returns The evaluation results
   */
  evaluateQuery(
    query: string,
    retrieved: string[],
    latencyMs?: number
  ): RetrievalEvaluationResult {
    return this.evaluate([query], [retrieved], latencyMs);
  }
  
  /**
   * Get the options used for evaluation
   * 
   * @returns The evaluation options
   */
  getOptions(): RetrievalEvaluationOptions {
    return this.options;
  }
  
  /**
   * Set the options used for evaluation
   * 
   * @param options The evaluation options
   */
  setOptions(options: RetrievalEvaluationOptions): void {
    this.options = options;
  }
}
