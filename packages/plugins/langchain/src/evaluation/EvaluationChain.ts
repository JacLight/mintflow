/**
 * Evaluation chain for LLM outputs
 */

import { z } from 'zod';
import { RetrievalMetrics } from './metrics/RetrievalMetrics.js';
import { GenerationMetrics } from './metrics/GenerationMetrics.js';
import { AgentMetrics } from './metrics/AgentMetrics.js';

/**
 * Type of evaluation
 */
export type EvaluationType = 'retrieval' | 'generation' | 'agent';

/**
 * Base evaluation parameters
 */
export interface BaseEvaluationParams {
  /**
   * The type of evaluation
   */
  type: EvaluationType;
  
  /**
   * The model to use for evaluation
   */
  model?: string;
  
  /**
   * The metrics to evaluate
   */
  metrics?: string[];
}

/**
 * Retrieval evaluation parameters
 */
export interface RetrievalEvaluationParams extends BaseEvaluationParams {
  /**
   * The type of evaluation
   */
  type: 'retrieval';
  
  /**
   * The query
   */
  query: string;
  
  /**
   * The retrieved documents
   */
  retrievedDocuments: Array<{
    /**
     * The document content
     */
    content: string;
    
    /**
     * The document metadata
     */
    metadata?: Record<string, any>;
  }>;
  
  /**
   * The relevant documents (ground truth)
   */
  relevantDocuments?: Array<{
    /**
     * The document content
     */
    content: string;
    
    /**
     * The document metadata
     */
    metadata?: Record<string, any>;
  }>;
}

/**
 * Generation evaluation parameters
 */
export interface GenerationEvaluationParams extends BaseEvaluationParams {
  /**
   * The type of evaluation
   */
  type: 'generation';
  
  /**
   * The prompt
   */
  prompt: string;
  
  /**
   * The generated text
   */
  generatedText: string;
  
  /**
   * The reference text (ground truth)
   */
  referenceText?: string;
}

/**
 * Agent evaluation parameters
 */
export interface AgentEvaluationParams extends BaseEvaluationParams {
  /**
   * The type of evaluation
   */
  type: 'agent';
  
  /**
   * The task
   */
  task: string;
  
  /**
   * The agent's response
   */
  agentResponse: string;
  
  /**
   * The agent's reasoning
   */
  agentReasoning?: string;
  
  /**
   * The agent's actions
   */
  agentActions?: Array<{
    /**
     * The action name
     */
    action: string;
    
    /**
     * The action input
     */
    input: Record<string, any>;
    
    /**
     * The action output
     */
    output: any;
  }>;
  
  /**
   * The expected response (ground truth)
   */
  expectedResponse?: string;
}

/**
 * Evaluation parameters
 */
export type EvaluationParams = RetrievalEvaluationParams | GenerationEvaluationParams | AgentEvaluationParams;

/**
 * Evaluation result
 */
export interface EvaluationResult {
  /**
   * The type of evaluation
   */
  type: EvaluationType;
  
  /**
   * The metrics
   */
  metrics: Record<string, number>;
  
  /**
   * The overall score
   */
  overallScore: number;
  
  /**
   * The detailed results
   */
  details: Record<string, any>;
  
  /**
   * The feedback
   */
  feedback: string;
}

/**
 * Evaluation chain for LLM outputs
 */
export class EvaluationChain {
  private retrievalMetrics: RetrievalMetrics;
  private generationMetrics: GenerationMetrics;
  private agentMetrics: AgentMetrics;
  
  /**
   * Create a new evaluation chain
   */
  constructor() {
    this.retrievalMetrics = new RetrievalMetrics();
    this.generationMetrics = new GenerationMetrics();
    this.agentMetrics = new AgentMetrics();
  }
  
  /**
   * Evaluate LLM outputs
   * 
   * @param params The evaluation parameters
   * @returns The evaluation result
   */
  async evaluate(params: EvaluationParams): Promise<EvaluationResult> {
    switch (params.type) {
      case 'retrieval':
        return this.evaluateRetrieval(params);
      case 'generation':
        return this.evaluateGeneration(params);
      case 'agent':
        return this.evaluateAgent(params);
      default:
        throw new Error(`Unknown evaluation type: ${(params as any).type}`);
    }
  }
  
  /**
   * Evaluate retrieval
   * 
   * @param params The retrieval evaluation parameters
   * @returns The evaluation result
   */
  private async evaluateRetrieval(params: RetrievalEvaluationParams): Promise<EvaluationResult> {
    const { query, retrievedDocuments, relevantDocuments, metrics = [] } = params;
    
    // Calculate metrics
    const metricsResults: Record<string, number> = {};
    
    // Calculate precision if requested
    if (metrics.includes('precision') && relevantDocuments) {
      metricsResults.precision = this.retrievalMetrics.calculatePrecision(retrievedDocuments, relevantDocuments);
    }
    
    // Calculate recall if requested
    if (metrics.includes('recall') && relevantDocuments) {
      metricsResults.recall = this.retrievalMetrics.calculateRecall(retrievedDocuments, relevantDocuments);
    }
    
    // Calculate F1 score if requested
    if (metrics.includes('f1') && relevantDocuments) {
      metricsResults.f1 = this.retrievalMetrics.calculateF1Score(retrievedDocuments, relevantDocuments);
    }
    
    // Calculate MRR if requested
    if (metrics.includes('mrr') && relevantDocuments) {
      metricsResults.mrr = this.retrievalMetrics.calculateMRR(retrievedDocuments, relevantDocuments);
    }
    
    // Calculate relevance if requested
    if (metrics.includes('relevance')) {
      metricsResults.relevance = await this.retrievalMetrics.calculateRelevance(query, retrievedDocuments);
    }
    
    // Calculate diversity if requested
    if (metrics.includes('diversity')) {
      metricsResults.diversity = this.retrievalMetrics.calculateDiversity(retrievedDocuments);
    }
    
    // Calculate overall score
    const overallScore = Object.values(metricsResults).reduce((sum, value) => sum + value, 0) / Object.values(metricsResults).length;
    
    // Generate feedback
    const feedback = this.generateRetrievalFeedback(metricsResults, retrievedDocuments, relevantDocuments);
    
    return {
      type: 'retrieval',
      metrics: metricsResults,
      overallScore,
      details: {
        query,
        retrievedDocuments,
        relevantDocuments
      },
      feedback
    };
  }
  
  /**
   * Evaluate generation
   * 
   * @param params The generation evaluation parameters
   * @returns The evaluation result
   */
  private async evaluateGeneration(params: GenerationEvaluationParams): Promise<EvaluationResult> {
    const { prompt, generatedText, referenceText, metrics = [] } = params;
    
    // Calculate metrics
    const metricsResults: Record<string, number> = {};
    
    // Calculate relevance if requested
    if (metrics.includes('relevance')) {
      metricsResults.relevance = await this.generationMetrics.calculateRelevance(prompt, generatedText);
    }
    
    // Calculate coherence if requested
    if (metrics.includes('coherence')) {
      metricsResults.coherence = await this.generationMetrics.calculateCoherence(generatedText);
    }
    
    // Calculate fluency if requested
    if (metrics.includes('fluency')) {
      metricsResults.fluency = this.generationMetrics.calculateFluency(generatedText);
    }
    
    // Calculate groundedness if requested
    if (metrics.includes('groundedness') && referenceText) {
      metricsResults.groundedness = await this.generationMetrics.calculateGroundedness(generatedText, referenceText);
    }
    
    // Calculate toxicity if requested
    if (metrics.includes('toxicity')) {
      metricsResults.toxicity = this.generationMetrics.calculateToxicity(generatedText);
    }
    
    // Calculate BLEU score if requested
    if (metrics.includes('bleu') && referenceText) {
      metricsResults.bleu = this.generationMetrics.calculateBLEU(generatedText, referenceText);
    }
    
    // Calculate ROUGE score if requested
    if (metrics.includes('rouge') && referenceText) {
      metricsResults.rouge = this.generationMetrics.calculateROUGE(generatedText, referenceText);
    }
    
    // Calculate overall score
    const overallScore = Object.values(metricsResults).reduce((sum, value) => sum + value, 0) / Object.values(metricsResults).length;
    
    // Generate feedback
    const feedback = this.generateGenerationFeedback(metricsResults, generatedText, referenceText);
    
    return {
      type: 'generation',
      metrics: metricsResults,
      overallScore,
      details: {
        prompt,
        generatedText,
        referenceText
      },
      feedback
    };
  }
  
  /**
   * Evaluate agent
   * 
   * @param params The agent evaluation parameters
   * @returns The evaluation result
   */
  private async evaluateAgent(params: AgentEvaluationParams): Promise<EvaluationResult> {
    const { task, agentResponse, agentReasoning, agentActions, expectedResponse, metrics = [] } = params;
    
    // Calculate metrics
    const metricsResults: Record<string, number> = {};
    
    // Calculate task completion if requested
    if (metrics.includes('taskCompletion')) {
      metricsResults.taskCompletion = await this.agentMetrics.calculateTaskCompletion(task, agentResponse, expectedResponse);
    }
    
    // Calculate reasoning quality if requested
    if (metrics.includes('reasoningQuality') && agentReasoning) {
      metricsResults.reasoningQuality = await this.agentMetrics.calculateReasoningQuality(task, agentReasoning);
    }
    
    // Calculate action efficiency if requested
    if (metrics.includes('actionEfficiency') && agentActions) {
      metricsResults.actionEfficiency = this.agentMetrics.calculateActionEfficiency(agentActions);
    }
    
    // Calculate tool usage if requested
    if (metrics.includes('toolUsage') && agentActions) {
      metricsResults.toolUsage = this.agentMetrics.calculateToolUsage(agentActions);
    }
    
    // Calculate hallucination if requested
    if (metrics.includes('hallucination')) {
      metricsResults.hallucination = await this.agentMetrics.calculateHallucination(task, agentResponse);
    }
    
    // Calculate overall score
    const overallScore = Object.values(metricsResults).reduce((sum, value) => sum + value, 0) / Object.values(metricsResults).length;
    
    // Generate feedback
    const feedback = this.generateAgentFeedback(metricsResults, task, agentResponse, agentReasoning, agentActions);
    
    return {
      type: 'agent',
      metrics: metricsResults,
      overallScore,
      details: {
        task,
        agentResponse,
        agentReasoning,
        agentActions,
        expectedResponse
      },
      feedback
    };
  }
  
  /**
   * Generate feedback for retrieval evaluation
   * 
   * @param metrics The metrics
   * @param retrievedDocuments The retrieved documents
   * @param relevantDocuments The relevant documents
   * @returns The feedback
   */
  private generateRetrievalFeedback(
    metrics: Record<string, number>,
    retrievedDocuments: Array<{ content: string; metadata?: Record<string, any> }>,
    relevantDocuments?: Array<{ content: string; metadata?: Record<string, any> }>
  ): string {
    let feedback = 'Retrieval Evaluation Feedback:\n\n';
    
    // Add metrics feedback
    feedback += 'Metrics:\n';
    for (const [metric, value] of Object.entries(metrics)) {
      feedback += `- ${metric}: ${value.toFixed(2)}\n`;
    }
    
    // Add precision feedback
    if (metrics.precision !== undefined) {
      if (metrics.precision >= 0.8) {
        feedback += '\nPrecision is excellent. Most retrieved documents are relevant.\n';
      } else if (metrics.precision >= 0.5) {
        feedback += '\nPrecision is good, but there is room for improvement. Some retrieved documents are not relevant.\n';
      } else {
        feedback += '\nPrecision is low. Many retrieved documents are not relevant.\n';
      }
    }
    
    // Add recall feedback
    if (metrics.recall !== undefined) {
      if (metrics.recall >= 0.8) {
        feedback += 'Recall is excellent. Most relevant documents were retrieved.\n';
      } else if (metrics.recall >= 0.5) {
        feedback += 'Recall is good, but there is room for improvement. Some relevant documents were not retrieved.\n';
      } else {
        feedback += 'Recall is low. Many relevant documents were not retrieved.\n';
      }
    }
    
    // Add relevance feedback
    if (metrics.relevance !== undefined) {
      if (metrics.relevance >= 0.8) {
        feedback += 'Relevance is excellent. The retrieved documents are highly relevant to the query.\n';
      } else if (metrics.relevance >= 0.5) {
        feedback += 'Relevance is good, but there is room for improvement. Some retrieved documents are not very relevant to the query.\n';
      } else {
        feedback += 'Relevance is low. Many retrieved documents are not relevant to the query.\n';
      }
    }
    
    // Add diversity feedback
    if (metrics.diversity !== undefined) {
      if (metrics.diversity >= 0.8) {
        feedback += 'Diversity is excellent. The retrieved documents cover a wide range of information.\n';
      } else if (metrics.diversity >= 0.5) {
        feedback += 'Diversity is good, but there is room for improvement. The retrieved documents could cover a wider range of information.\n';
      } else {
        feedback += 'Diversity is low. The retrieved documents are too similar to each other.\n';
      }
    }
    
    // Add overall feedback
    const overallScore = Object.values(metrics).reduce((sum, value) => sum + value, 0) / Object.values(metrics).length;
    if (overallScore >= 0.8) {
      feedback += '\nOverall, the retrieval performance is excellent.\n';
    } else if (overallScore >= 0.5) {
      feedback += '\nOverall, the retrieval performance is good, but there is room for improvement.\n';
    } else {
      feedback += '\nOverall, the retrieval performance is poor and needs significant improvement.\n';
    }
    
    return feedback;
  }
  
  /**
   * Generate feedback for generation evaluation
   * 
   * @param metrics The metrics
   * @param generatedText The generated text
   * @param referenceText The reference text
   * @returns The feedback
   */
  private generateGenerationFeedback(
    metrics: Record<string, number>,
    generatedText: string,
    referenceText?: string
  ): string {
    let feedback = 'Generation Evaluation Feedback:\n\n';
    
    // Add metrics feedback
    feedback += 'Metrics:\n';
    for (const [metric, value] of Object.entries(metrics)) {
      feedback += `- ${metric}: ${value.toFixed(2)}\n`;
    }
    
    // Add relevance feedback
    if (metrics.relevance !== undefined) {
      if (metrics.relevance >= 0.8) {
        feedback += '\nRelevance is excellent. The generated text is highly relevant to the prompt.\n';
      } else if (metrics.relevance >= 0.5) {
        feedback += '\nRelevance is good, but there is room for improvement. The generated text could be more relevant to the prompt.\n';
      } else {
        feedback += '\nRelevance is low. The generated text is not very relevant to the prompt.\n';
      }
    }
    
    // Add coherence feedback
    if (metrics.coherence !== undefined) {
      if (metrics.coherence >= 0.8) {
        feedback += 'Coherence is excellent. The generated text is well-structured and flows logically.\n';
      } else if (metrics.coherence >= 0.5) {
        feedback += 'Coherence is good, but there is room for improvement. The generated text could be more structured and logical.\n';
      } else {
        feedback += 'Coherence is low. The generated text lacks structure and logical flow.\n';
      }
    }
    
    // Add fluency feedback
    if (metrics.fluency !== undefined) {
      if (metrics.fluency >= 0.8) {
        feedback += 'Fluency is excellent. The generated text reads naturally and smoothly.\n';
      } else if (metrics.fluency >= 0.5) {
        feedback += 'Fluency is good, but there is room for improvement. The generated text could read more naturally and smoothly.\n';
      } else {
        feedback += 'Fluency is low. The generated text does not read naturally or smoothly.\n';
      }
    }
    
    // Add groundedness feedback
    if (metrics.groundedness !== undefined) {
      if (metrics.groundedness >= 0.8) {
        feedback += 'Groundedness is excellent. The generated text is well-grounded in the reference text.\n';
      } else if (metrics.groundedness >= 0.5) {
        feedback += 'Groundedness is good, but there is room for improvement. The generated text could be more grounded in the reference text.\n';
      } else {
        feedback += 'Groundedness is low. The generated text is not well-grounded in the reference text.\n';
      }
    }
    
    // Add toxicity feedback
    if (metrics.toxicity !== undefined) {
      if (metrics.toxicity <= 0.2) {
        feedback += 'Toxicity is very low. The generated text is not toxic.\n';
      } else if (metrics.toxicity <= 0.5) {
        feedback += 'Toxicity is moderate. The generated text contains some potentially toxic content.\n';
      } else {
        feedback += 'Toxicity is high. The generated text contains toxic content.\n';
      }
    }
    
    // Add BLEU feedback
    if (metrics.bleu !== undefined) {
      if (metrics.bleu >= 0.8) {
        feedback += 'BLEU score is excellent. The generated text is very similar to the reference text.\n';
      } else if (metrics.bleu >= 0.5) {
        feedback += 'BLEU score is good, but there is room for improvement. The generated text could be more similar to the reference text.\n';
      } else {
        feedback += 'BLEU score is low. The generated text is not very similar to the reference text.\n';
      }
    }
    
    // Add ROUGE feedback
    if (metrics.rouge !== undefined) {
      if (metrics.rouge >= 0.8) {
        feedback += 'ROUGE score is excellent. The generated text captures the key information from the reference text.\n';
      } else if (metrics.rouge >= 0.5) {
        feedback += 'ROUGE score is good, but there is room for improvement. The generated text could capture more key information from the reference text.\n';
      } else {
        feedback += 'ROUGE score is low. The generated text does not capture much key information from the reference text.\n';
      }
    }
    
    // Add overall feedback
    const overallScore = Object.values(metrics).reduce((sum, value) => sum + value, 0) / Object.values(metrics).length;
    if (overallScore >= 0.8) {
      feedback += '\nOverall, the generation quality is excellent.\n';
    } else if (overallScore >= 0.5) {
      feedback += '\nOverall, the generation quality is good, but there is room for improvement.\n';
    } else {
      feedback += '\nOverall, the generation quality is poor and needs significant improvement.\n';
    }
    
    return feedback;
  }
  
  /**
   * Generate feedback for agent evaluation
   * 
   * @param metrics The metrics
   * @param task The task
   * @param agentResponse The agent's response
   * @param agentReasoning The agent's reasoning
   * @param agentActions The agent's actions
   * @returns The feedback
   */
  private generateAgentFeedback(
    metrics: Record<string, number>,
    task: string,
    agentResponse: string,
    agentReasoning?: string,
    agentActions?: Array<{ action: string; input: Record<string, any>; output: any }>
  ): string {
    let feedback = 'Agent Evaluation Feedback:\n\n';
    
    // Add metrics feedback
    feedback += 'Metrics:\n';
    for (const [metric, value] of Object.entries(metrics)) {
      feedback += `- ${metric}: ${value.toFixed(2)}\n`;
    }
    
    // Add task completion feedback
    if (metrics.taskCompletion !== undefined) {
      if (metrics.taskCompletion >= 0.8) {
        feedback += '\nTask completion is excellent. The agent successfully completed the task.\n';
      } else if (metrics.taskCompletion >= 0.5) {
        feedback += '\nTask completion is good, but there is room for improvement. The agent partially completed the task.\n';
      } else {
        feedback += '\nTask completion is poor. The agent did not complete the task successfully.\n';
      }
    }
    
    // Add reasoning quality feedback
    if (metrics.reasoningQuality !== undefined) {
      if (metrics.reasoningQuality >= 0.8) {
        feedback += 'Reasoning quality is excellent. The agent\'s reasoning is clear, logical, and thorough.\n';
      } else if (metrics.reasoningQuality >= 0.5) {
        feedback += 'Reasoning quality is good, but there is room for improvement. The agent\'s reasoning could be clearer, more logical, or more thorough.\n';
      } else {
        feedback += 'Reasoning quality is poor. The agent\'s reasoning is unclear, illogical, or incomplete.\n';
      }
    }
    
    // Add action efficiency feedback
    if (metrics.actionEfficiency !== undefined) {
      if (metrics.actionEfficiency >= 0.8) {
        feedback += 'Action efficiency is excellent. The agent used an optimal number of actions to complete the task.\n';
      } else if (metrics.actionEfficiency >= 0.5) {
        feedback += 'Action efficiency is good, but there is room for improvement. The agent could have used fewer actions to complete the task.\n';
      } else {
        feedback += 'Action efficiency is poor. The agent used too many actions or unnecessary actions.\n';
      }
    }
    
    // Add tool usage feedback
    if (metrics.toolUsage !== undefined) {
      if (metrics.toolUsage >= 0.8) {
        feedback += 'Tool usage is excellent. The agent used the appropriate tools effectively.\n';
      } else if (metrics.toolUsage >= 0.5) {
        feedback += 'Tool usage is good, but there is room for improvement. The agent could have used more appropriate tools or used them more effectively.\n';
      } else {
        feedback += 'Tool usage is poor. The agent did not use the appropriate tools or used them ineffectively.\n';
      }
    }
    
    // Add hallucination feedback
    if (metrics.hallucination !== undefined) {
      if (metrics.hallucination <= 0.2) {
        feedback += 'Hallucination is very low. The agent\'s response is well-grounded and factual.\n';
      } else if (metrics.hallucination <= 0.5) {
        feedback += 'Hallucination is moderate. The agent\'s response contains some potentially hallucinated content.\n';
      } else {
        feedback += 'Hallucination is high. The agent\'s response contains significant hallucinated content.\n';
      }
    }
    
    // Add overall feedback
    const overallScore = Object.values(metrics).reduce((sum, value) => sum + value, 0) / Object.values(metrics).length;
    if (overallScore >= 0.8) {
      feedback += '\nOverall, the agent\'s performance is excellent.\n';
    } else if (overallScore >= 0.5) {
      feedback += '\nOverall, the agent\'s performance is good, but there is room for improvement.\n';
    } else {
      feedback += '\nOverall, the agent\'s performance is poor and needs significant improvement.\n';
    }
    
    return feedback;
  }
}
