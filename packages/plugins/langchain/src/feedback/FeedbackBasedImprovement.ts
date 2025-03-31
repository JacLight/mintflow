/**
 * Feedback-based improvement for LLM outputs
 */

import { Feedback, FeedbackCollector } from './FeedbackCollector.js';

/**
 * Improvement strategy
 */
export type ImprovementStrategy = 'prompt-refinement' | 'model-selection' | 'parameter-tuning' | 'ensemble' | 'custom';

/**
 * Improvement action
 */
export interface ImprovementAction {
  /**
   * The ID of the improvement action
   */
  id: string;
  
  /**
   * The strategy used for improvement
   */
  strategy: ImprovementStrategy;
  
  /**
   * The description of the improvement action
   */
  description: string;
  
  /**
   * The changes made by the improvement action
   */
  changes: Record<string, any>;
  
  /**
   * The timestamp of the improvement action
   */
  timestamp: Date;
  
  /**
   * The feedback that triggered the improvement action
   */
  triggeringFeedback: string[];
  
  /**
   * The metadata associated with the improvement action
   */
  metadata?: Record<string, any>;
}

/**
 * Improvement result
 */
export interface ImprovementResult {
  /**
   * The ID of the improvement result
   */
  id: string;
  
  /**
   * The ID of the improvement action
   */
  actionId: string;
  
  /**
   * Whether the improvement was successful
   */
  success: boolean;
  
  /**
   * The metrics before the improvement
   */
  metricsBefore: Record<string, number>;
  
  /**
   * The metrics after the improvement
   */
  metricsAfter: Record<string, number>;
  
  /**
   * The timestamp of the improvement result
   */
  timestamp: Date;
  
  /**
   * The metadata associated with the improvement result
   */
  metadata?: Record<string, any>;
}

/**
 * Improvement storage interface
 */
export interface ImprovementStorage {
  /**
   * Save improvement action
   * 
   * @param action The improvement action to save
   * @returns A promise that resolves when the improvement action is saved
   */
  saveAction(action: ImprovementAction): Promise<void>;
  
  /**
   * Get improvement action by ID
   * 
   * @param id The ID of the improvement action
   * @returns A promise that resolves with the improvement action
   */
  getAction(id: string): Promise<ImprovementAction | null>;
  
  /**
   * Get improvement actions by strategy
   * 
   * @param strategy The strategy used for improvement
   * @returns A promise that resolves with the improvement actions
   */
  getActionsByStrategy(strategy: ImprovementStrategy): Promise<ImprovementAction[]>;
  
  /**
   * Save improvement result
   * 
   * @param result The improvement result to save
   * @returns A promise that resolves when the improvement result is saved
   */
  saveResult(result: ImprovementResult): Promise<void>;
  
  /**
   * Get improvement result by ID
   * 
   * @param id The ID of the improvement result
   * @returns A promise that resolves with the improvement result
   */
  getResult(id: string): Promise<ImprovementResult | null>;
  
  /**
   * Get improvement results by action ID
   * 
   * @param actionId The ID of the improvement action
   * @returns A promise that resolves with the improvement results
   */
  getResultsByAction(actionId: string): Promise<ImprovementResult[]>;
}

/**
 * Memory improvement storage
 */
export class MemoryImprovementStorage implements ImprovementStorage {
  private actions: Map<string, ImprovementAction> = new Map();
  private results: Map<string, ImprovementResult> = new Map();
  private strategyIndex: Map<ImprovementStrategy, Set<string>> = new Map();
  private actionIndex: Map<string, Set<string>> = new Map();
  
  /**
   * Save improvement action
   * 
   * @param action The improvement action to save
   * @returns A promise that resolves when the improvement action is saved
   */
  async saveAction(action: ImprovementAction): Promise<void> {
    this.actions.set(action.id, action);
    
    // Update strategy index
    if (!this.strategyIndex.has(action.strategy)) {
      this.strategyIndex.set(action.strategy, new Set());
    }
    this.strategyIndex.get(action.strategy)!.add(action.id);
  }
  
  /**
   * Get improvement action by ID
   * 
   * @param id The ID of the improvement action
   * @returns A promise that resolves with the improvement action
   */
  async getAction(id: string): Promise<ImprovementAction | null> {
    return this.actions.get(id) || null;
  }
  
  /**
   * Get improvement actions by strategy
   * 
   * @param strategy The strategy used for improvement
   * @returns A promise that resolves with the improvement actions
   */
  async getActionsByStrategy(strategy: ImprovementStrategy): Promise<ImprovementAction[]> {
    const actionIds = this.strategyIndex.get(strategy) || new Set();
    return Array.from(actionIds).map(id => this.actions.get(id)!);
  }
  
  /**
   * Save improvement result
   * 
   * @param result The improvement result to save
   * @returns A promise that resolves when the improvement result is saved
   */
  async saveResult(result: ImprovementResult): Promise<void> {
    this.results.set(result.id, result);
    
    // Update action index
    if (!this.actionIndex.has(result.actionId)) {
      this.actionIndex.set(result.actionId, new Set());
    }
    this.actionIndex.get(result.actionId)!.add(result.id);
  }
  
  /**
   * Get improvement result by ID
   * 
   * @param id The ID of the improvement result
   * @returns A promise that resolves with the improvement result
   */
  async getResult(id: string): Promise<ImprovementResult | null> {
    return this.results.get(id) || null;
  }
  
  /**
   * Get improvement results by action ID
   * 
   * @param actionId The ID of the improvement action
   * @returns A promise that resolves with the improvement results
   */
  async getResultsByAction(actionId: string): Promise<ImprovementResult[]> {
    const resultIds = this.actionIndex.get(actionId) || new Set();
    return Array.from(resultIds).map(id => this.results.get(id)!);
  }
}

/**
 * Improvement strategy interface
 */
export interface ImprovementStrategyHandler {
  /**
   * The strategy name
   */
  strategy: ImprovementStrategy;
  
  /**
   * Generate improvement action
   * 
   * @param feedback The feedback to use for improvement
   * @param context The context for improvement
   * @returns A promise that resolves with the improvement action
   */
  generateAction(feedback: Feedback[], context: Record<string, any>): Promise<ImprovementAction>;
  
  /**
   * Apply improvement action
   * 
   * @param action The improvement action to apply
   * @param context The context for improvement
   * @returns A promise that resolves with the updated context
   */
  applyAction(action: ImprovementAction, context: Record<string, any>): Promise<Record<string, any>>;
  
  /**
   * Evaluate improvement
   * 
   * @param action The improvement action to evaluate
   * @param contextBefore The context before improvement
   * @param contextAfter The context after improvement
   * @returns A promise that resolves with the improvement result
   */
  evaluateImprovement(
    action: ImprovementAction,
    contextBefore: Record<string, any>,
    contextAfter: Record<string, any>
  ): Promise<ImprovementResult>;
}

/**
 * Prompt refinement strategy
 */
export class PromptRefinementStrategy implements ImprovementStrategyHandler {
  strategy: ImprovementStrategy = 'prompt-refinement';
  
  /**
   * Generate improvement action
   * 
   * @param feedback The feedback to use for improvement
   * @param context The context for improvement
   * @returns A promise that resolves with the improvement action
   */
  async generateAction(feedback: Feedback[], context: Record<string, any>): Promise<ImprovementAction> {
    // This is a placeholder for a more sophisticated prompt refinement strategy
    // In a real implementation, this would analyze the feedback and generate a refined prompt
    
    const originalPrompt = context.prompt || '';
    let refinedPrompt = originalPrompt;
    
    // Simple example: Add specific instructions based on feedback
    for (const item of feedback) {
      if (item.type === 'correction') {
        const correctionFeedback = item as any; // Type assertion for simplicity
        refinedPrompt += `\n\nPlease avoid: "${correctionFeedback.originalText}"`;
        refinedPrompt += `\nInstead use: "${correctionFeedback.correctedText}"`;
      } else if (item.type === 'comment' && (item as any).sentiment === 'negative') {
        refinedPrompt += `\n\nPlease note: "${(item as any).comment}"`;
      }
    }
    
    return {
      id: this.generateId(),
      strategy: this.strategy,
      description: 'Refined prompt based on user feedback',
      changes: {
        originalPrompt,
        refinedPrompt
      },
      timestamp: new Date(),
      triggeringFeedback: feedback.map(f => f.id),
      metadata: {
        feedbackCount: feedback.length,
        promptLengthBefore: originalPrompt.length,
        promptLengthAfter: refinedPrompt.length
      }
    };
  }
  
  /**
   * Apply improvement action
   * 
   * @param action The improvement action to apply
   * @param context The context for improvement
   * @returns A promise that resolves with the updated context
   */
  async applyAction(action: ImprovementAction, context: Record<string, any>): Promise<Record<string, any>> {
    // Apply the refined prompt to the context
    return {
      ...context,
      prompt: action.changes.refinedPrompt
    };
  }
  
  /**
   * Evaluate improvement
   * 
   * @param action The improvement action to evaluate
   * @param contextBefore The context before improvement
   * @param contextAfter The context after improvement
   * @returns A promise that resolves with the improvement result
   */
  async evaluateImprovement(
    action: ImprovementAction,
    contextBefore: Record<string, any>,
    contextAfter: Record<string, any>
  ): Promise<ImprovementResult> {
    // This is a placeholder for a more sophisticated evaluation
    // In a real implementation, this would evaluate the improvement using metrics
    
    // Simple example: Calculate metrics based on prompt length and complexity
    const promptBefore = contextBefore.prompt || '';
    const promptAfter = contextAfter.prompt || '';
    
    const metricsBefore = {
      promptLength: promptBefore.length,
      promptComplexity: this.calculateComplexity(promptBefore)
    };
    
    const metricsAfter = {
      promptLength: promptAfter.length,
      promptComplexity: this.calculateComplexity(promptAfter)
    };
    
    // Determine success based on metrics
    const success = metricsAfter.promptComplexity > metricsBefore.promptComplexity;
    
    return {
      id: this.generateId(),
      actionId: action.id,
      success,
      metricsBefore,
      metricsAfter,
      timestamp: new Date(),
      metadata: {
        promptLengthDiff: metricsAfter.promptLength - metricsBefore.promptLength,
        promptComplexityDiff: metricsAfter.promptComplexity - metricsBefore.promptComplexity
      }
    };
  }
  
  /**
   * Calculate complexity of a prompt
   * 
   * @param prompt The prompt to calculate complexity for
   * @returns The complexity score
   */
  private calculateComplexity(prompt: string): number {
    // This is a placeholder for a more sophisticated complexity calculation
    // In a real implementation, this would calculate the complexity of the prompt
    
    // Simple example: Calculate complexity based on word count and unique words
    const words = prompt.split(/\s+/);
    const uniqueWords = new Set(words);
    
    return words.length * 0.5 + uniqueWords.size * 0.5;
  }
  
  /**
   * Generate a unique ID
   * 
   * @returns A unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Model selection strategy
 */
export class ModelSelectionStrategy implements ImprovementStrategyHandler {
  strategy: ImprovementStrategy = 'model-selection';
  
  /**
   * Generate improvement action
   * 
   * @param feedback The feedback to use for improvement
   * @param context The context for improvement
   * @returns A promise that resolves with the improvement action
   */
  async generateAction(feedback: Feedback[], context: Record<string, any>): Promise<ImprovementAction> {
    // This is a placeholder for a more sophisticated model selection strategy
    // In a real implementation, this would analyze the feedback and select a better model
    
    const originalModel = context.model || 'gpt-3.5-turbo';
    let selectedModel = originalModel;
    
    // Simple example: Select a more powerful model based on feedback
    const negativeRatings = feedback.filter(f => f.type === 'rating' && (f as any).rating < 3).length;
    const totalRatings = feedback.filter(f => f.type === 'rating').length;
    
    if (totalRatings > 0 && negativeRatings / totalRatings > 0.5) {
      // If more than half of the ratings are negative, select a more powerful model
      if (originalModel === 'gpt-3.5-turbo') {
        selectedModel = 'gpt-4';
      } else if (originalModel === 'gpt-4') {
        selectedModel = 'gpt-4-turbo';
      }
    }
    
    return {
      id: this.generateId(),
      strategy: this.strategy,
      description: 'Selected a different model based on user feedback',
      changes: {
        originalModel,
        selectedModel
      },
      timestamp: new Date(),
      triggeringFeedback: feedback.map(f => f.id),
      metadata: {
        feedbackCount: feedback.length,
        negativeRatings,
        totalRatings
      }
    };
  }
  
  /**
   * Apply improvement action
   * 
   * @param action The improvement action to apply
   * @param context The context for improvement
   * @returns A promise that resolves with the updated context
   */
  async applyAction(action: ImprovementAction, context: Record<string, any>): Promise<Record<string, any>> {
    // Apply the selected model to the context
    return {
      ...context,
      model: action.changes.selectedModel
    };
  }
  
  /**
   * Evaluate improvement
   * 
   * @param action The improvement action to evaluate
   * @param contextBefore The context before improvement
   * @param contextAfter The context after improvement
   * @returns A promise that resolves with the improvement result
   */
  async evaluateImprovement(
    action: ImprovementAction,
    contextBefore: Record<string, any>,
    contextAfter: Record<string, any>
  ): Promise<ImprovementResult> {
    // This is a placeholder for a more sophisticated evaluation
    // In a real implementation, this would evaluate the improvement using metrics
    
    // Simple example: Calculate metrics based on model capabilities
    const modelBefore = contextBefore.model || '';
    const modelAfter = contextAfter.model || '';
    
    const metricsBefore = {
      modelCapability: this.calculateModelCapability(modelBefore)
    };
    
    const metricsAfter = {
      modelCapability: this.calculateModelCapability(modelAfter)
    };
    
    // Determine success based on metrics
    const success = metricsAfter.modelCapability > metricsBefore.modelCapability;
    
    return {
      id: this.generateId(),
      actionId: action.id,
      success,
      metricsBefore,
      metricsAfter,
      timestamp: new Date(),
      metadata: {
        modelBefore,
        modelAfter,
        modelCapabilityDiff: metricsAfter.modelCapability - metricsBefore.modelCapability
      }
    };
  }
  
  /**
   * Calculate capability of a model
   * 
   * @param model The model to calculate capability for
   * @returns The capability score
   */
  private calculateModelCapability(model: string): number {
    // This is a placeholder for a more sophisticated capability calculation
    // In a real implementation, this would calculate the capability of the model
    
    // Simple example: Assign capability scores based on model name
    if (model === 'gpt-4-turbo') {
      return 0.9;
    } else if (model === 'gpt-4') {
      return 0.8;
    } else if (model === 'gpt-3.5-turbo') {
      return 0.7;
    } else {
      return 0.5;
    }
  }
  
  /**
   * Generate a unique ID
   * 
   * @returns A unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Parameter tuning strategy
 */
export class ParameterTuningStrategy implements ImprovementStrategyHandler {
  strategy: ImprovementStrategy = 'parameter-tuning';
  
  /**
   * Generate improvement action
   * 
   * @param feedback The feedback to use for improvement
   * @param context The context for improvement
   * @returns A promise that resolves with the improvement action
   */
  async generateAction(feedback: Feedback[], context: Record<string, any>): Promise<ImprovementAction> {
    // This is a placeholder for a more sophisticated parameter tuning strategy
    // In a real implementation, this would analyze the feedback and tune the parameters
    
    const originalTemperature = context.temperature || 0.7;
    const originalMaxTokens = context.maxTokens || 1000;
    
    let temperature = originalTemperature;
    let maxTokens = originalMaxTokens;
    
    // Simple example: Tune parameters based on feedback
    const creativityFeedback = feedback.filter(f => 
      (f.type === 'comment' && (f as any).comment.toLowerCase().includes('creative')) ||
      (f.type === 'correction' && (f as any).reason?.toLowerCase().includes('creative'))
    ).length;
    
    const lengthFeedback = feedback.filter(f => 
      (f.type === 'comment' && (f as any).comment.toLowerCase().includes('longer')) ||
      (f.type === 'correction' && (f as any).reason?.toLowerCase().includes('longer'))
    ).length;
    
    // Adjust temperature based on creativity feedback
    if (creativityFeedback > 0) {
      temperature = Math.min(1.0, originalTemperature + 0.1 * creativityFeedback);
    }
    
    // Adjust max tokens based on length feedback
    if (lengthFeedback > 0) {
      maxTokens = Math.min(4000, originalMaxTokens + 500 * lengthFeedback);
    }
    
    return {
      id: this.generateId(),
      strategy: this.strategy,
      description: 'Tuned parameters based on user feedback',
      changes: {
        originalTemperature,
        temperature,
        originalMaxTokens,
        maxTokens
      },
      timestamp: new Date(),
      triggeringFeedback: feedback.map(f => f.id),
      metadata: {
        feedbackCount: feedback.length,
        creativityFeedback,
        lengthFeedback
      }
    };
  }
  
  /**
   * Apply improvement action
   * 
   * @param action The improvement action to apply
   * @param context The context for improvement
   * @returns A promise that resolves with the updated context
   */
  async applyAction(action: ImprovementAction, context: Record<string, any>): Promise<Record<string, any>> {
    // Apply the tuned parameters to the context
    return {
      ...context,
      temperature: action.changes.temperature,
      maxTokens: action.changes.maxTokens
    };
  }
  
  /**
   * Evaluate improvement
   * 
   * @param action The improvement action to evaluate
   * @param contextBefore The context before improvement
   * @param contextAfter The context after improvement
   * @returns A promise that resolves with the improvement result
   */
  async evaluateImprovement(
    action: ImprovementAction,
    contextBefore: Record<string, any>,
    contextAfter: Record<string, any>
  ): Promise<ImprovementResult> {
    // This is a placeholder for a more sophisticated evaluation
    // In a real implementation, this would evaluate the improvement using metrics
    
    // Simple example: Calculate metrics based on parameter changes
    const temperatureBefore = contextBefore.temperature || 0.7;
    const temperatureAfter = contextAfter.temperature || 0.7;
    const maxTokensBefore = contextBefore.maxTokens || 1000;
    const maxTokensAfter = contextAfter.maxTokens || 1000;
    
    const metricsBefore = {
      temperature: temperatureBefore,
      maxTokens: maxTokensBefore,
      creativity: this.calculateCreativity(temperatureBefore),
      thoroughness: this.calculateThoroughness(maxTokensBefore)
    };
    
    const metricsAfter = {
      temperature: temperatureAfter,
      maxTokens: maxTokensAfter,
      creativity: this.calculateCreativity(temperatureAfter),
      thoroughness: this.calculateThoroughness(maxTokensAfter)
    };
    
    // Determine success based on metrics
    const success = metricsAfter.creativity > metricsBefore.creativity || metricsAfter.thoroughness > metricsBefore.thoroughness;
    
    return {
      id: this.generateId(),
      actionId: action.id,
      success,
      metricsBefore,
      metricsAfter,
      timestamp: new Date(),
      metadata: {
        temperatureDiff: temperatureAfter - temperatureBefore,
        maxTokensDiff: maxTokensAfter - maxTokensBefore,
        creativityDiff: metricsAfter.creativity - metricsBefore.creativity,
        thoroughnessDiff: metricsAfter.thoroughness - metricsBefore.thoroughness
      }
    };
  }
  
  /**
   * Calculate creativity based on temperature
   * 
   * @param temperature The temperature to calculate creativity for
   * @returns The creativity score
   */
  private calculateCreativity(temperature: number): number {
    // This is a placeholder for a more sophisticated creativity calculation
    // In a real implementation, this would calculate the creativity based on temperature
    
    // Simple example: Linear relationship between temperature and creativity
    return temperature;
  }
  
  /**
   * Calculate thoroughness based on max tokens
   * 
   * @param maxTokens The max tokens to calculate thoroughness for
   * @returns The thoroughness score
   */
  private calculateThoroughness(maxTokens: number): number {
    // This is a placeholder for a more sophisticated thoroughness calculation
    // In a real implementation, this would calculate the thoroughness based on max tokens
    
    // Simple example: Logarithmic relationship between max tokens and thoroughness
    return Math.log10(maxTokens) / 4; // Normalize to 0-1 range
  }
  
  /**
   * Generate a unique ID
   * 
   * @returns A unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Feedback-based improvement options
 */
export interface FeedbackBasedImprovementOptions {
  /**
   * The feedback collector to use
   */
  feedbackCollector: FeedbackCollector;
  
  /**
   * The improvement storage to use
   */
  storage?: ImprovementStorage;
  
  /**
   * The improvement strategies to use
   */
  strategies?: ImprovementStrategyHandler[];
  
  /**
   * The callback to call when an improvement action is generated
   */
  onAction?: (action: ImprovementAction) => void;
  
  /**
   * The callback to call when an improvement result is generated
   */
  onResult?: (result: ImprovementResult) => void;
}

/**
 * Feedback-based improvement for LLM outputs
 */
export class FeedbackBasedImprovement {
  private feedbackCollector: FeedbackCollector;
  private storage: ImprovementStorage;
  private strategies: Map<ImprovementStrategy, ImprovementStrategyHandler> = new Map();
  private onAction?: (action: ImprovementAction) => void;
  private onResult?: (result: ImprovementResult) => void;
  
  /**
   * Create a new feedback-based improvement
   * 
   * @param options The options for the feedback-based improvement
   */
  constructor(options: FeedbackBasedImprovementOptions) {
    this.feedbackCollector = options.feedbackCollector;
    this.storage = options.storage || new MemoryImprovementStorage();
    this.onAction = options.onAction;
    this.onResult = options.onResult;
    
    // Register default strategies if none are provided
    if (!options.strategies || options.strategies.length === 0) {
      this.registerStrategy(new PromptRefinementStrategy());
      this.registerStrategy(new ModelSelectionStrategy());
      this.registerStrategy(new ParameterTuningStrategy());
    } else {
      // Register provided strategies
      for (const strategy of options.strategies) {
        this.registerStrategy(strategy);
      }
    }
  }
  
  /**
   * Register an improvement strategy
   * 
   * @param strategy The strategy to register
   */
  registerStrategy(strategy: ImprovementStrategyHandler): void {
    this.strategies.set(strategy.strategy, strategy);
  }
  
  /**
   * Generate improvement action
   * 
   * @param sessionId The ID of the session
   * @param strategy The strategy to use for improvement
   * @param context The context for improvement
   * @returns A promise that resolves with the improvement action
   */
  async generateAction(
    sessionId: string,
    strategy: ImprovementStrategy,
    context: Record<string, any>
  ): Promise<ImprovementAction> {
    // Get the strategy handler
    const strategyHandler = this.strategies.get(strategy);
    if (!strategyHandler) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }
    
    // Get feedback for the session
    const feedback = await this.feedbackCollector.getFeedbackBySession(sessionId);
    
    // Generate the improvement action
    const action = await strategyHandler.generateAction(feedback, context);
    
    // Save the action
    await this.storage.saveAction(action);
    
    // Call the callback
    if (this.onAction) {
      this.onAction(action);
    }
    
    return action;
  }
  
  /**
   * Apply improvement action
   * 
   * @param actionId The ID of the improvement action
   * @param context The context for improvement
   * @returns A promise that resolves with the updated context
   */
  async applyAction(
    actionId: string,
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    // Get the action
    const action = await this.storage.getAction(actionId);
    if (!action) {
      throw new Error(`Unknown action: ${actionId}`);
    }
    
    // Get the strategy handler
    const strategyHandler = this.strategies.get(action.strategy);
    if (!strategyHandler) {
      throw new Error(`Unknown strategy: ${action.strategy}`);
    }
    
    // Apply the action
    return strategyHandler.applyAction(action, context);
  }
  
  /**
   * Evaluate improvement
   * 
   * @param actionId The ID of the improvement action
   * @param contextBefore The context before improvement
   * @param contextAfter The context after improvement
   * @returns A promise that resolves with the improvement result
   */
  async evaluateImprovement(
    actionId: string,
    contextBefore: Record<string, any>,
    contextAfter: Record<string, any>
  ): Promise<ImprovementResult> {
    // Get the action
    const action = await this.storage.getAction(actionId);
    if (!action) {
      throw new Error(`Unknown action: ${actionId}`);
    }
    
    // Get the strategy handler
    const strategyHandler = this.strategies.get(action.strategy);
    if (!strategyHandler) {
      throw new Error(`Unknown strategy: ${action.strategy}`);
    }
    
    // Evaluate the improvement
    const result = await strategyHandler.evaluateImprovement(action, contextBefore, contextAfter);
    
    // Save the result
    await this.storage.saveResult(result);
    
    // Call the callback
    if (this.onResult) {
      this.onResult(result);
    }
    
    return result;
  }
  
  /**
   * Get improvement action by ID
   * 
   * @param id The ID of the improvement action
   * @returns A promise that resolves with the improvement action
   */
  async getAction(id: string): Promise<ImprovementAction | null> {
    return this.storage.getAction(id);
  }
  
  /**
   * Get improvement actions by strategy
   * 
   * @param strategy The strategy used for improvement
   * @returns A promise that resolves with the improvement actions
   */
  async getActionsByStrategy(strategy: ImprovementStrategy): Promise<ImprovementAction[]> {
    return this.storage.getActionsByStrategy(strategy);
  }
  
  /**
   * Get improvement result by ID
   * 
   * @param id The ID of the improvement result
   * @returns A promise that resolves with the improvement result
   */
  async getResult(id: string): Promise<ImprovementResult | null> {
    return this.storage.getResult(id);
  }
  
  /**
   * Get improvement results by action ID
   * 
   * @param actionId The ID of the improvement action
   * @returns A promise that resolves with the improvement results
   */
  async getResultsByAction(actionId: string): Promise<ImprovementResult[]> {
    return this.storage.getResultsByAction(actionId);
  }
}
