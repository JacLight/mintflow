/**
 * Metrics for evaluating retrieval performance
 */

/**
 * Calculate precision for retrieval
 * 
 * @param {Array<{content: string, metadata?: object}>} retrievedDocuments The retrieved documents
 * @param {Array<{content: string, metadata?: object}>} relevantDocuments The relevant documents
 * @returns {number} The precision score
 */
export function calculatePrecision(retrievedDocuments, relevantDocuments) {
  if (retrievedDocuments.length === 0) {
    return 0;
  }
  
  const relevantContents = new Set(relevantDocuments.map(doc => doc.content));
  const relevantRetrieved = retrievedDocuments.filter(doc => relevantContents.has(doc.content));
  
  return relevantRetrieved.length / retrievedDocuments.length;
}

/**
 * Calculate recall for retrieval
 * 
 * @param {Array<{content: string, metadata?: object}>} retrievedDocuments The retrieved documents
 * @param {Array<{content: string, metadata?: object}>} relevantDocuments The relevant documents
 * @returns {number} The recall score
 */
export function calculateRecall(retrievedDocuments, relevantDocuments) {
  if (relevantDocuments.length === 0) {
    return 0;
  }
  
  const retrievedContents = new Set(retrievedDocuments.map(doc => doc.content));
  const retrievedRelevant = relevantDocuments.filter(doc => retrievedContents.has(doc.content));
  
  return retrievedRelevant.length / relevantDocuments.length;
}

/**
 * Calculate F1 score for retrieval
 * 
 * @param {Array<{content: string, metadata?: object}>} retrievedDocuments The retrieved documents
 * @param {Array<{content: string, metadata?: object}>} relevantDocuments The relevant documents
 * @returns {number} The F1 score
 */
export function calculateF1Score(retrievedDocuments, relevantDocuments) {
  const precision = calculatePrecision(retrievedDocuments, relevantDocuments);
  const recall = calculateRecall(retrievedDocuments, relevantDocuments);
  
  if (precision + recall === 0) {
    return 0;
  }
  
  return (2 * precision * recall) / (precision + recall);
}

/**
 * Calculate Mean Reciprocal Rank (MRR) for retrieval
 * 
 * @param {Array<{content: string, metadata?: object}>} retrievedDocuments The retrieved documents
 * @param {Array<{content: string, metadata?: object}>} relevantDocuments The relevant documents
 * @returns {number} The MRR score
 */
export function calculateMRR(retrievedDocuments, relevantDocuments) {
  if (retrievedDocuments.length === 0 || relevantDocuments.length === 0) {
    return 0;
  }
  
  const relevantContents = new Set(relevantDocuments.map(doc => doc.content));
  
  for (let i = 0; i < retrievedDocuments.length; i++) {
    if (relevantContents.has(retrievedDocuments[i].content)) {
      return 1 / (i + 1);
    }
  }
  
  return 0;
}

/**
 * Calculate Mean Average Precision (MAP) for retrieval
 * 
 * @param {Array<{content: string, metadata?: object}>} retrievedDocuments The retrieved documents
 * @param {Array<{content: string, metadata?: object}>} relevantDocuments The relevant documents
 * @returns {number} The MAP score
 */
export function calculateMAP(retrievedDocuments, relevantDocuments) {
  if (retrievedDocuments.length === 0 || relevantDocuments.length === 0) {
    return 0;
  }
  
  const relevantContents = new Set(relevantDocuments.map(doc => doc.content));
  let relevantCount = 0;
  let sum = 0;
  
  for (let i = 0; i < retrievedDocuments.length; i++) {
    if (relevantContents.has(retrievedDocuments[i].content)) {
      relevantCount++;
      sum += relevantCount / (i + 1);
    }
  }
  
  return sum / relevantDocuments.length;
}

/**
 * Calculate Normalized Discounted Cumulative Gain (NDCG) for retrieval
 * 
 * @param {Array<{content: string, metadata?: object}>} retrievedDocuments The retrieved documents
 * @param {Array<{content: string, metadata?: object}>} relevantDocuments The relevant documents
 * @returns {number} The NDCG score
 */
export function calculateNDCG(retrievedDocuments, relevantDocuments) {
  if (retrievedDocuments.length === 0 || relevantDocuments.length === 0) {
    return 0;
  }
  
  // Create a map of content to relevance score
  const relevanceMap = new Map();
  for (let i = 0; i < relevantDocuments.length; i++) {
    // Assign relevance score based on position in the relevant documents list
    relevanceMap.set(relevantDocuments[i].content, relevantDocuments.length - i);
  }
  
  // Calculate DCG
  let dcg = 0;
  for (let i = 0; i < retrievedDocuments.length; i++) {
    const relevance = relevanceMap.get(retrievedDocuments[i].content) || 0;
    dcg += (Math.pow(2, relevance) - 1) / Math.log2(i + 2);
  }
  
  // Calculate ideal DCG
  const idealRelevanceScores = Array.from(relevanceMap.values()).sort((a, b) => b - a);
  let idcg = 0;
  for (let i = 0; i < Math.min(retrievedDocuments.length, idealRelevanceScores.length); i++) {
    idcg += (Math.pow(2, idealRelevanceScores[i]) - 1) / Math.log2(i + 2);
  }
  
  return dcg / idcg;
}

/**
 * Evaluate retrieval
 * 
 * @param {string} query The query
 * @param {Array<{content: string, metadata?: object}>} retrievedDocuments The retrieved documents
 * @param {Array<{content: string, metadata?: object}>} relevantDocuments The relevant documents
 * @param {object} options The evaluation options
 * @returns {object} The evaluation result
 */
export function evaluateRetrieval(query, retrievedDocuments, relevantDocuments, options = {}) {
  const result = {
    metrics: {}
  };
  
  // Calculate precision if requested
  if (options.precision) {
    result.metrics.precision = calculatePrecision(retrievedDocuments, relevantDocuments);
  }
  
  // Calculate recall if requested
  if (options.recall) {
    result.metrics.recall = calculateRecall(retrievedDocuments, relevantDocuments);
  }
  
  // Calculate F1 score if requested
  if (options.f1) {
    result.metrics.f1 = calculateF1Score(retrievedDocuments, relevantDocuments);
  }
  
  // Calculate MRR if requested
  if (options.mrr) {
    result.metrics.mrr = calculateMRR(retrievedDocuments, relevantDocuments);
  }
  
  // Calculate MAP if requested
  if (options.map) {
    result.metrics.map = calculateMAP(retrievedDocuments, relevantDocuments);
  }
  
  // Calculate NDCG if requested
  if (options.ndcg) {
    result.metrics.ndcg = calculateNDCG(retrievedDocuments, relevantDocuments);
  }
  
  return result;
}

/**
 * Retrieval evaluator
 */
export class RetrievalEvaluator {
  /**
   * Create a new retrieval evaluator
   * 
   * @param {object} options The evaluator options
   */
  constructor(options = {}) {
    this.options = options;
  }
  
  /**
   * Evaluate retrieval
   * 
   * @param {string} query The query
   * @param {Array<{content: string, metadata?: object}>} retrievedDocuments The retrieved documents
   * @param {Array<{content: string, metadata?: object}>} relevantDocuments The relevant documents
   * @returns {object} The evaluation result
   */
  evaluate(query, retrievedDocuments, relevantDocuments) {
    return evaluateRetrieval(query, retrievedDocuments, relevantDocuments, this.options);
  }
}
