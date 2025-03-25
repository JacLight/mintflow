/**
 * Evaluation module for LangChain
 */

// Export evaluation chain
export { EvaluationChain } from './EvaluationChain.js';
export type {
  EvaluationType,
  BaseEvaluationParams,
  RetrievalEvaluationParams,
  GenerationEvaluationParams,
  AgentEvaluationParams,
  EvaluationParams,
  EvaluationResult
} from './EvaluationChain.js';

// Export metrics
export { RetrievalMetrics } from './metrics/RetrievalMetrics.js';
export { GenerationMetrics } from './metrics/GenerationMetrics.js';
export { AgentMetrics } from './metrics/AgentMetrics.js';

// Export metrics functions from RetrievalMetrics.js
export {
  calculatePrecision,
  calculateRecall,
  calculateF1Score,
  calculateMRR,
  calculateMAP,
  calculateNDCG,
  evaluateRetrieval,
  RetrievalEvaluator
} from './RetrievalMetrics.js';

// Export metrics functions from GenerationMetrics.js
export {
  calculateBLEU,
  calculateROUGEL,
  calculateSemanticSimilarity,
  calculatePerplexity,
  evaluateGeneration,
  GenerationEvaluator
} from './GenerationMetrics.js';

// Export metrics functions from AgentMetrics.js
export {
  evaluateAgentStep,
  evaluateAgentTask,
  evaluateAgent,
  AgentEvaluator
} from './AgentMetrics.js';

// Export types from metrics files
export type {
  RetrievalEvaluationResult,
  RetrievalEvaluationOptions
} from './RetrievalMetrics.js';

export type {
  GenerationEvaluationResult,
  GenerationEvaluationOptions
} from './GenerationMetrics.js';

export type {
  AgentEvaluationResult,
  AgentEvaluationOptions,
  AgentStepEvaluation,
  AgentTaskEvaluation
} from './AgentMetrics.js';
