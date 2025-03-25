/**
 * A/B testing framework for LLM outputs
 */

import { Feedback, FeedbackCollector } from './FeedbackCollector.js';

/**
 * Variant type
 */
export type VariantType = 'prompt' | 'model' | 'parameters' | 'custom';

/**
 * Base variant interface
 */
export interface BaseVariant {
  /**
   * The ID of the variant
   */
  id: string;
  
  /**
   * The name of the variant
   */
  name: string;
  
  /**
   * The type of variant
   */
  type: VariantType;
  
  /**
   * The description of the variant
   */
  description?: string;
  
  /**
   * The configuration of the variant
   */
  config: Record<string, any>;
}

/**
 * Prompt variant
 */
export interface PromptVariant extends BaseVariant {
  /**
   * The type of variant
   */
  type: 'prompt';
  
  /**
   * The configuration of the variant
   */
  config: {
    /**
     * The prompt template
     */
    prompt: string;
    
    /**
     * The system prompt
     */
    systemPrompt?: string;
  };
}

/**
 * Model variant
 */
export interface ModelVariant extends BaseVariant {
  /**
   * The type of variant
   */
  type: 'model';
  
  /**
   * The configuration of the variant
   */
  config: {
    /**
     * The model name
     */
    model: string;
    
    /**
     * The provider
     */
    provider?: string;
  };
}

/**
 * Parameters variant
 */
export interface ParametersVariant extends BaseVariant {
  /**
   * The type of variant
   */
  type: 'parameters';
  
  /**
   * The configuration of the variant
   */
  config: {
    /**
     * The temperature
     */
    temperature?: number;
    
    /**
     * The max tokens
     */
    maxTokens?: number;
    
    /**
     * The top p
     */
    topP?: number;
    
    /**
     * The frequency penalty
     */
    frequencyPenalty?: number;
    
    /**
     * The presence penalty
     */
    presencePenalty?: number;
  };
}

/**
 * Custom variant
 */
export interface CustomVariant extends BaseVariant {
  /**
   * The type of variant
   */
  type: 'custom';
  
  /**
   * The configuration of the variant
   */
  config: Record<string, any>;
}

/**
 * Variant
 */
export type Variant = PromptVariant | ModelVariant | ParametersVariant | CustomVariant;

/**
 * Experiment interface
 */
export interface Experiment {
  /**
   * The ID of the experiment
   */
  id: string;
  
  /**
   * The name of the experiment
   */
  name: string;
  
  /**
   * The description of the experiment
   */
  description?: string;
  
  /**
   * The variants in the experiment
   */
  variants: Variant[];
  
  /**
   * The traffic allocation for each variant
   */
  trafficAllocation: Record<string, number>;
  
  /**
   * The start date of the experiment
   */
  startDate: Date;
  
  /**
   * The end date of the experiment
   */
  endDate?: Date;
  
  /**
   * The status of the experiment
   */
  status: 'draft' | 'running' | 'paused' | 'completed';
  
  /**
   * The metrics to track
   */
  metrics: string[];
  
  /**
   * The metadata associated with the experiment
   */
  metadata?: Record<string, any>;
}

/**
 * Experiment result interface
 */
export interface ExperimentResult {
  /**
   * The ID of the experiment result
   */
  id: string;
  
  /**
   * The ID of the experiment
   */
  experimentId: string;
  
  /**
   * The ID of the variant
   */
  variantId: string;
  
  /**
   * The ID of the session
   */
  sessionId: string;
  
  /**
   * The ID of the message
   */
  messageId: string;
  
  /**
   * The metrics
   */
  metrics: Record<string, number>;
  
  /**
   * The timestamp of the experiment result
   */
  timestamp: Date;
  
  /**
   * The metadata associated with the experiment result
   */
  metadata?: Record<string, any>;
}

/**
 * Experiment storage interface
 */
export interface ExperimentStorage {
  /**
   * Save experiment
   * 
   * @param experiment The experiment to save
   * @returns A promise that resolves when the experiment is saved
   */
  saveExperiment(experiment: Experiment): Promise<void>;
  
  /**
   * Get experiment by ID
   * 
   * @param id The ID of the experiment
   * @returns A promise that resolves with the experiment
   */
  getExperiment(id: string): Promise<Experiment | null>;
  
  /**
   * Get experiments by status
   * 
   * @param status The status of the experiments
   * @returns A promise that resolves with the experiments
   */
  getExperimentsByStatus(status: 'draft' | 'running' | 'paused' | 'completed'): Promise<Experiment[]>;
  
  /**
   * Save experiment result
   * 
   * @param result The experiment result to save
   * @returns A promise that resolves when the experiment result is saved
   */
  saveExperimentResult(result: ExperimentResult): Promise<void>;
  
  /**
   * Get experiment results by experiment ID
   * 
   * @param experimentId The ID of the experiment
   * @returns A promise that resolves with the experiment results
   */
  getExperimentResults(experimentId: string): Promise<ExperimentResult[]>;
  
  /**
   * Get experiment results by variant ID
   * 
   * @param variantId The ID of the variant
   * @returns A promise that resolves with the experiment results
   */
  getExperimentResultsByVariant(variantId: string): Promise<ExperimentResult[]>;
  
  /**
   * Get experiment results by session ID
   * 
   * @param sessionId The ID of the session
   * @returns A promise that resolves with the experiment results
   */
  getExperimentResultsBySession(sessionId: string): Promise<ExperimentResult[]>;
}

/**
 * Memory experiment storage
 */
export class MemoryExperimentStorage implements ExperimentStorage {
  private experiments: Map<string, Experiment> = new Map();
  private results: Map<string, ExperimentResult> = new Map();
  private experimentIndex: Map<string, Set<string>> = new Map();
  private variantIndex: Map<string, Set<string>> = new Map();
  private sessionIndex: Map<string, Set<string>> = new Map();
  private statusIndex: Map<string, Set<string>> = new Map();
  
  /**
   * Save experiment
   * 
   * @param experiment The experiment to save
   * @returns A promise that resolves when the experiment is saved
   */
  async saveExperiment(experiment: Experiment): Promise<void> {
    this.experiments.set(experiment.id, experiment);
    
    // Update status index
    if (!this.statusIndex.has(experiment.status)) {
      this.statusIndex.set(experiment.status, new Set());
    }
    this.statusIndex.get(experiment.status)!.add(experiment.id);
  }
  
  /**
   * Get experiment by ID
   * 
   * @param id The ID of the experiment
   * @returns A promise that resolves with the experiment
   */
  async getExperiment(id: string): Promise<Experiment | null> {
    return this.experiments.get(id) || null;
  }
  
  /**
   * Get experiments by status
   * 
   * @param status The status of the experiments
   * @returns A promise that resolves with the experiments
   */
  async getExperimentsByStatus(status: 'draft' | 'running' | 'paused' | 'completed'): Promise<Experiment[]> {
    const experimentIds = this.statusIndex.get(status) || new Set();
    return Array.from(experimentIds).map(id => this.experiments.get(id)!);
  }
  
  /**
   * Save experiment result
   * 
   * @param result The experiment result to save
   * @returns A promise that resolves when the experiment result is saved
   */
  async saveExperimentResult(result: ExperimentResult): Promise<void> {
    this.results.set(result.id, result);
    
    // Update experiment index
    if (!this.experimentIndex.has(result.experimentId)) {
      this.experimentIndex.set(result.experimentId, new Set());
    }
    this.experimentIndex.get(result.experimentId)!.add(result.id);
    
    // Update variant index
    if (!this.variantIndex.has(result.variantId)) {
      this.variantIndex.set(result.variantId, new Set());
    }
    this.variantIndex.get(result.variantId)!.add(result.id);
    
    // Update session index
    if (!this.sessionIndex.has(result.sessionId)) {
      this.sessionIndex.set(result.sessionId, new Set());
    }
    this.sessionIndex.get(result.sessionId)!.add(result.id);
  }
  
  /**
   * Get experiment results by experiment ID
   * 
   * @param experimentId The ID of the experiment
   * @returns A promise that resolves with the experiment results
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResult[]> {
    const resultIds = this.experimentIndex.get(experimentId) || new Set();
    return Array.from(resultIds).map(id => this.results.get(id)!);
  }
  
  /**
   * Get experiment results by variant ID
   * 
   * @param variantId The ID of the variant
   * @returns A promise that resolves with the experiment results
   */
  async getExperimentResultsByVariant(variantId: string): Promise<ExperimentResult[]> {
    const resultIds = this.variantIndex.get(variantId) || new Set();
    return Array.from(resultIds).map(id => this.results.get(id)!);
  }
  
  /**
   * Get experiment results by session ID
   * 
   * @param sessionId The ID of the session
   * @returns A promise that resolves with the experiment results
   */
  async getExperimentResultsBySession(sessionId: string): Promise<ExperimentResult[]> {
    const resultIds = this.sessionIndex.get(sessionId) || new Set();
    return Array.from(resultIds).map(id => this.results.get(id)!);
  }
}

/**
 * Metric calculator interface
 */
export interface MetricCalculator {
  /**
   * The name of the metric
   */
  name: string;
  
  /**
   * Calculate metric
   * 
   * @param feedback The feedback to calculate the metric from
   * @param context The context for calculation
   * @returns A promise that resolves with the metric value
   */
  calculate(feedback: Feedback[], context: Record<string, any>): Promise<number>;
}

/**
 * Rating metric calculator
 */
export class RatingMetricCalculator implements MetricCalculator {
  name: string = 'rating';
  
  /**
   * Calculate metric
   * 
   * @param feedback The feedback to calculate the metric from
   * @param context The context for calculation
   * @returns A promise that resolves with the metric value
   */
  async calculate(feedback: Feedback[], context: Record<string, any>): Promise<number> {
    const ratingFeedback = feedback.filter(f => f.type === 'rating');
    
    if (ratingFeedback.length === 0) {
      return 0;
    }
    
    // Calculate average rating
    const ratings = ratingFeedback.map(f => (f as any).rating as number);
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    
    // Normalize to 0-1 range
    return averageRating / 5;
  }
}

/**
 * Completion time metric calculator
 */
export class CompletionTimeMetricCalculator implements MetricCalculator {
  name: string = 'completionTime';
  
  /**
   * Calculate metric
   * 
   * @param feedback The feedback to calculate the metric from
   * @param context The context for calculation
   * @returns A promise that resolves with the metric value
   */
  async calculate(feedback: Feedback[], context: Record<string, any>): Promise<number> {
    if (!context.startTime || !context.endTime) {
      return 0;
    }
    
    // Calculate completion time in seconds
    const startTime = new Date(context.startTime).getTime();
    const endTime = new Date(context.endTime).getTime();
    const completionTime = (endTime - startTime) / 1000;
    
    // Normalize to 0-1 range (assuming 10 seconds is the maximum)
    return Math.min(1, 10 / completionTime);
  }
}

/**
 * Correction metric calculator
 */
export class CorrectionMetricCalculator implements MetricCalculator {
  name: string = 'correction';
  
  /**
   * Calculate metric
   * 
   * @param feedback The feedback to calculate the metric from
   * @param context The context for calculation
   * @returns A promise that resolves with the metric value
   */
  async calculate(feedback: Feedback[], context: Record<string, any>): Promise<number> {
    const correctionFeedback = feedback.filter(f => f.type === 'correction');
    
    if (correctionFeedback.length === 0) {
      return 1; // No corrections means perfect score
    }
    
    // Calculate correction ratio
    const correctionRatio = correctionFeedback.length / feedback.length;
    
    // Normalize to 0-1 range (inverted, so fewer corrections is better)
    return 1 - Math.min(1, correctionRatio);
  }
}

/**
 * A/B testing options
 */
export interface ABTestingOptions {
  /**
   * The feedback collector to use
   */
  feedbackCollector: FeedbackCollector;
  
  /**
   * The experiment storage to use
   */
  storage?: ExperimentStorage;
  
  /**
   * The metric calculators to use
   */
  metricCalculators?: MetricCalculator[];
  
  /**
   * The callback to call when an experiment result is generated
   */
  onResult?: (result: ExperimentResult) => void;
}

/**
 * A/B testing framework for LLM outputs
 */
export class ABTesting {
  private feedbackCollector: FeedbackCollector;
  private storage: ExperimentStorage;
  private metricCalculators: Map<string, MetricCalculator> = new Map();
  private onResult?: (result: ExperimentResult) => void;
  
  /**
   * Create a new A/B testing framework
   * 
   * @param options The options for the A/B testing framework
   */
  constructor(options: ABTestingOptions) {
    this.feedbackCollector = options.feedbackCollector;
    this.storage = options.storage || new MemoryExperimentStorage();
    this.onResult = options.onResult;
    
    // Register default metric calculators if none are provided
    if (!options.metricCalculators || options.metricCalculators.length === 0) {
      this.registerMetricCalculator(new RatingMetricCalculator());
      this.registerMetricCalculator(new CompletionTimeMetricCalculator());
      this.registerMetricCalculator(new CorrectionMetricCalculator());
    } else {
      // Register provided metric calculators
      for (const calculator of options.metricCalculators) {
        this.registerMetricCalculator(calculator);
      }
    }
  }
  
  /**
   * Register a metric calculator
   * 
   * @param calculator The calculator to register
   */
  registerMetricCalculator(calculator: MetricCalculator): void {
    this.metricCalculators.set(calculator.name, calculator);
  }
  
  /**
   * Create an experiment
   * 
   * @param name The name of the experiment
   * @param variants The variants in the experiment
   * @param metrics The metrics to track
   * @param options Additional options
   * @returns A promise that resolves with the experiment
   */
  async createExperiment(
    name: string,
    variants: Variant[],
    metrics: string[],
    options: {
      description?: string;
      trafficAllocation?: Record<string, number>;
      startDate?: Date;
      status?: 'draft' | 'running' | 'paused';
      metadata?: Record<string, any>;
    } = {}
  ): Promise<Experiment> {
    // Validate variants
    if (variants.length < 2) {
      throw new Error('Experiment must have at least two variants');
    }
    
    // Validate metrics
    for (const metric of metrics) {
      if (!this.metricCalculators.has(metric)) {
        throw new Error(`Unknown metric: ${metric}`);
      }
    }
    
    // Create traffic allocation if not provided
    const trafficAllocation = options.trafficAllocation || {};
    
    // Distribute traffic evenly if not specified
    let remainingTraffic = 1;
    let unallocatedVariants = 0;
    
    for (const variant of variants) {
      if (trafficAllocation[variant.id] === undefined) {
        unallocatedVariants++;
      } else {
        remainingTraffic -= trafficAllocation[variant.id];
      }
    }
    
    if (unallocatedVariants > 0) {
      const trafficPerVariant = remainingTraffic / unallocatedVariants;
      
      for (const variant of variants) {
        if (trafficAllocation[variant.id] === undefined) {
          trafficAllocation[variant.id] = trafficPerVariant;
        }
      }
    }
    
    // Create experiment
    const experiment: Experiment = {
      id: this.generateId(),
      name,
      description: options.description,
      variants,
      trafficAllocation,
      startDate: options.startDate || new Date(),
      status: options.status || 'draft',
      metrics,
      metadata: options.metadata
    };
    
    // Save experiment
    await this.storage.saveExperiment(experiment);
    
    return experiment;
  }
  
  /**
   * Start an experiment
   * 
   * @param experimentId The ID of the experiment
   * @returns A promise that resolves with the experiment
   */
  async startExperiment(experimentId: string): Promise<Experiment> {
    const experiment = await this.storage.getExperiment(experimentId);
    
    if (!experiment) {
      throw new Error(`Unknown experiment: ${experimentId}`);
    }
    
    // Update experiment status
    experiment.status = 'running';
    experiment.startDate = new Date();
    
    // Save experiment
    await this.storage.saveExperiment(experiment);
    
    return experiment;
  }
  
  /**
   * Pause an experiment
   * 
   * @param experimentId The ID of the experiment
   * @returns A promise that resolves with the experiment
   */
  async pauseExperiment(experimentId: string): Promise<Experiment> {
    const experiment = await this.storage.getExperiment(experimentId);
    
    if (!experiment) {
      throw new Error(`Unknown experiment: ${experimentId}`);
    }
    
    // Update experiment status
    experiment.status = 'paused';
    
    // Save experiment
    await this.storage.saveExperiment(experiment);
    
    return experiment;
  }
  
  /**
   * Complete an experiment
   * 
   * @param experimentId The ID of the experiment
   * @returns A promise that resolves with the experiment
   */
  async completeExperiment(experimentId: string): Promise<Experiment> {
    const experiment = await this.storage.getExperiment(experimentId);
    
    if (!experiment) {
      throw new Error(`Unknown experiment: ${experimentId}`);
    }
    
    // Update experiment status
    experiment.status = 'completed';
    experiment.endDate = new Date();
    
    // Save experiment
    await this.storage.saveExperiment(experiment);
    
    return experiment;
  }
  
  /**
   * Get a variant for a session
   * 
   * @param experimentId The ID of the experiment
   * @param sessionId The ID of the session
   * @returns A promise that resolves with the variant
   */
  async getVariantForSession(experimentId: string, sessionId: string): Promise<Variant> {
    const experiment = await this.storage.getExperiment(experimentId);
    
    if (!experiment) {
      throw new Error(`Unknown experiment: ${experimentId}`);
    }
    
    if (experiment.status !== 'running') {
      throw new Error(`Experiment is not running: ${experimentId}`);
    }
    
    // Check if the session already has a variant assigned
    const results = await this.storage.getExperimentResultsBySession(sessionId);
    const existingResult = results.find(r => r.experimentId === experimentId);
    
    if (existingResult) {
      // Return the variant that was already assigned
      const variant = experiment.variants.find(v => v.id === existingResult.variantId);
      
      if (!variant) {
        throw new Error(`Unknown variant: ${existingResult.variantId}`);
      }
      
      return variant;
    }
    
    // Assign a variant based on traffic allocation
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const variant of experiment.variants) {
      cumulativeProbability += experiment.trafficAllocation[variant.id] || 0;
      
      if (random < cumulativeProbability) {
        return variant;
      }
    }
    
    // Fallback to the last variant
    return experiment.variants[experiment.variants.length - 1];
  }
  
  /**
   * Record an experiment result
   * 
   * @param experimentId The ID of the experiment
   * @param variantId The ID of the variant
   * @param sessionId The ID of the session
   * @param messageId The ID of the message
   * @param context The context for calculation
   * @returns A promise that resolves with the experiment result
   */
  async recordResult(
    experimentId: string,
    variantId: string,
    sessionId: string,
    messageId: string,
    context: Record<string, any>
  ): Promise<ExperimentResult> {
    const experiment = await this.storage.getExperiment(experimentId);
    
    if (!experiment) {
      throw new Error(`Unknown experiment: ${experimentId}`);
    }
    
    // Get feedback for the message
    const feedback = await this.feedbackCollector.getFeedbackByMessage(messageId);
    
    // Calculate metrics
    const metrics: Record<string, number> = {};
    
    for (const metricName of experiment.metrics) {
      const calculator = this.metricCalculators.get(metricName);
      
      if (calculator) {
        metrics[metricName] = await calculator.calculate(feedback, context);
      }
    }
    
    // Create experiment result
    const result: ExperimentResult = {
      id: this.generateId(),
      experimentId,
      variantId,
      sessionId,
      messageId,
      metrics,
      timestamp: new Date(),
      metadata: {
        feedbackCount: feedback.length,
        context
      }
    };
    
    // Save experiment result
    await this.storage.saveExperimentResult(result);
    
    // Call the callback
    if (this.onResult) {
      this.onResult(result);
    }
    
    return result;
  }
  
  /**
   * Get experiment results
   * 
   * @param experimentId The ID of the experiment
   * @returns A promise that resolves with the experiment results
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResult[]> {
    return this.storage.getExperimentResults(experimentId);
  }
  
  /**
   * Analyze experiment results
   * 
   * @param experimentId The ID of the experiment
   * @returns A promise that resolves with the analysis
   */
  async analyzeExperiment(experimentId: string): Promise<{
    experiment: Experiment;
    results: ExperimentResult[];
    metrics: Record<string, Record<string, number>>;
    winner?: Variant;
    winningMetrics?: Record<string, number>;
  }> {
    const experiment = await this.storage.getExperiment(experimentId);
    
    if (!experiment) {
      throw new Error(`Unknown experiment: ${experimentId}`);
    }
    
    // Get experiment results
    const results = await this.storage.getExperimentResults(experimentId);
    
    // Calculate metrics for each variant
    const metrics: Record<string, Record<string, number>> = {};
    
    for (const variant of experiment.variants) {
      metrics[variant.id] = {};
      
      // Get results for this variant
      const variantResults = results.filter(r => r.variantId === variant.id);
      
      if (variantResults.length === 0) {
        continue;
      }
      
      // Calculate average metrics
      for (const metricName of experiment.metrics) {
        const metricValues = variantResults.map(r => r.metrics[metricName] || 0);
        const averageMetric = metricValues.reduce((sum, value) => sum + value, 0) / metricValues.length;
        
        metrics[variant.id][metricName] = averageMetric;
      }
    }
    
    // Determine the winner
    let winner: Variant | undefined;
    let winningMetrics: Record<string, number> | undefined;
    let highestScore = -Infinity;
    
    for (const variant of experiment.variants) {
      // Calculate overall score
      const variantMetrics = metrics[variant.id];
      
      if (!variantMetrics) {
        continue;
      }
      
      const score = Object.values(variantMetrics).reduce((sum, value) => sum + value, 0);
      
      if (score > highestScore) {
        highestScore = score;
        winner = variant;
        winningMetrics = variantMetrics;
      }
    }
    
    return {
      experiment,
      results,
      metrics,
      winner,
      winningMetrics
    };
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
