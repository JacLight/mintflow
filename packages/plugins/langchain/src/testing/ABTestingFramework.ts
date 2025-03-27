import { PromptTemplateRegistry } from '../registry/PromptTemplateRegistry.js';
import { PromptTemplate } from '../adapters/PromptPlugin.js';
import { TemplateVersion } from '../adapters/PromptPlugin.js';

/**
 * Test result for a single template
 */
export interface TemplateTestResult {
  templateId: string;
  templateVersion: TemplateVersion;
  metrics: Record<string, number>;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * A/B test configuration
 */
export interface ABTestConfig {
  id: string;
  name: string;
  description?: string;
  templateA: {
    id: string;
    version?: TemplateVersion;
  };
  templateB: {
    id: string;
    version?: TemplateVersion;
  };
  metrics: string[];
  trafficSplit?: number; // 0-1, default 0.5 (50/50 split)
  active: boolean;
  startDate?: Date;
  endDate?: Date;
  sampleSize?: number;
  metadata?: Record<string, any>;
}

/**
 * A/B test result
 */
export interface ABTestResult {
  testId: string;
  templateAResults: TemplateTestResult[];
  templateBResults: TemplateTestResult[];
  winner?: 'A' | 'B' | 'tie';
  confidence?: number;
  summary?: Record<string, {
    templateA: number;
    templateB: number;
    difference: number;
    percentImprovement: number;
  }>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Framework for A/B testing prompt templates
 */
export class ABTestingFramework {
  private static instance: ABTestingFramework;
  private registry = PromptTemplateRegistry.getInstance();
  private tests: Map<string, ABTestConfig> = new Map();
  private results: Map<string, ABTestResult> = new Map();
  
  private constructor() {}
  
  /**
   * Get the singleton instance of the ABTestingFramework
   * 
   * @returns The ABTestingFramework instance
   */
  static getInstance(): ABTestingFramework {
    if (!ABTestingFramework.instance) {
      ABTestingFramework.instance = new ABTestingFramework();
    }
    return ABTestingFramework.instance;
  }
  
  /**
   * Create a new A/B test
   * 
   * @param config Test configuration
   * @returns The created test configuration
   */
  createTest(config: Omit<ABTestConfig, 'active' | 'startDate'>): ABTestConfig {
    // Validate templates exist
    const templateA = this.registry.getTemplate(config.templateA.id, config.templateA.version);
    const templateB = this.registry.getTemplate(config.templateB.id, config.templateB.version);
    
    if (!templateA) {
      throw new Error(`Template A (${config.templateA.id}) not found`);
    }
    
    if (!templateB) {
      throw new Error(`Template B (${config.templateB.id}) not found`);
    }
    
    // Create test config
    const testConfig: ABTestConfig = {
      ...config,
      active: true,
      startDate: new Date(),
      trafficSplit: config.trafficSplit ?? 0.5
    };
    
    // Store test
    this.tests.set(config.id, testConfig);
    
    // Initialize results
    this.results.set(config.id, {
      testId: config.id,
      templateAResults: [],
      templateBResults: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return testConfig;
  }
  
  /**
   * Get a test configuration
   * 
   * @param id Test ID
   * @returns The test configuration or undefined if not found
   */
  getTest(id: string): ABTestConfig | undefined {
    return this.tests.get(id);
  }
  
  /**
   * List all tests
   * 
   * @param activeOnly Whether to only return active tests
   * @returns Array of test configurations
   */
  listTests(activeOnly: boolean = false): ABTestConfig[] {
    const tests = Array.from(this.tests.values());
    
    if (activeOnly) {
      return tests.filter(test => test.active);
    }
    
    return tests;
  }
  
  /**
   * Start a test
   * 
   * @param id Test ID
   * @returns The updated test configuration or undefined if not found
   */
  startTest(id: string): ABTestConfig | undefined {
    const test = this.tests.get(id);
    
    if (!test) {
      return undefined;
    }
    
    test.active = true;
    test.startDate = new Date();
    
    return test;
  }
  
  /**
   * Stop a test
   * 
   * @param id Test ID
   * @returns The updated test configuration or undefined if not found
   */
  stopTest(id: string): ABTestConfig | undefined {
    const test = this.tests.get(id);
    
    if (!test) {
      return undefined;
    }
    
    test.active = false;
    test.endDate = new Date();
    
    return test;
  }
  
  /**
   * Delete a test
   * 
   * @param id Test ID
   * @returns True if the test was deleted, false otherwise
   */
  deleteTest(id: string): boolean {
    const deleted = this.tests.delete(id);
    this.results.delete(id);
    return deleted;
  }
  
  /**
   * Get a template for testing based on the traffic split
   * 
   * @param testId Test ID
   * @returns The template to use or undefined if the test doesn't exist
   */
  getTestTemplate(testId: string): PromptTemplate | undefined {
    const test = this.tests.get(testId);
    
    if (!test || !test.active) {
      return undefined;
    }
    
    // Determine which template to use based on traffic split
    const useTemplateA = Math.random() < (test.trafficSplit ?? 0.5);
    
    if (useTemplateA) {
      return this.registry.getTemplate(test.templateA.id, test.templateA.version);
    } else {
      return this.registry.getTemplate(test.templateB.id, test.templateB.version);
    }
  }
  
  /**
   * Record a test result
   * 
   * @param testId Test ID
   * @param templateId Template ID
   * @param templateVersion Template version
   * @param metrics Metrics to record
   * @param metadata Optional metadata
   * @returns The updated test result or undefined if the test doesn't exist
   */
  recordResult(
    testId: string,
    templateId: string,
    templateVersion: TemplateVersion,
    metrics: Record<string, number>,
    metadata?: Record<string, any>
  ): ABTestResult | undefined {
    const test = this.tests.get(testId);
    const result = this.results.get(testId);
    
    if (!test || !result) {
      return undefined;
    }
    
    // Create test result
    const testResult: TemplateTestResult = {
      templateId,
      templateVersion,
      metrics,
      metadata,
      timestamp: new Date()
    };
    
    // Add result to the appropriate array
    if (templateId === test.templateA.id) {
      result.templateAResults.push(testResult);
    } else if (templateId === test.templateB.id) {
      result.templateBResults.push(testResult);
    } else {
      throw new Error(`Template ${templateId} is not part of test ${testId}`);
    }
    
    // Update result
    result.updatedAt = new Date();
    
    // Check if we've reached the sample size
    if (test.sampleSize && 
        result.templateAResults.length + result.templateBResults.length >= test.sampleSize) {
      // Automatically stop the test
      this.stopTest(testId);
      
      // Calculate results
      this._calculateResults(testId);
    }
    
    return result;
  }
  
  /**
   * Get test results
   * 
   * @param testId Test ID
   * @returns The test results or undefined if the test doesn't exist
   */
  getResults(testId: string): ABTestResult | undefined {
    return this.results.get(testId);
  }
  
  /**
   * Calculate test results
   * 
   * @param testId Test ID
   * @returns The calculated test results or undefined if the test doesn't exist
   */
  private _calculateResults(testId: string): ABTestResult | undefined {
    const test = this.tests.get(testId);
    const result = this.results.get(testId);
    
    if (!test || !result) {
      return undefined;
    }
    
    // Calculate summary for each metric
    const summary: Record<string, {
      templateA: number;
      templateB: number;
      difference: number;
      percentImprovement: number;
    }> = {};
    
    for (const metric of test.metrics) {
      // Calculate average for template A
      const templateAValues = result.templateAResults
        .map(r => r.metrics[metric])
        .filter(v => v !== undefined);
      
      const templateAAvg = templateAValues.length > 0
        ? templateAValues.reduce((sum, val) => sum + val, 0) / templateAValues.length
        : 0;
      
      // Calculate average for template B
      const templateBValues = result.templateBResults
        .map(r => r.metrics[metric])
        .filter(v => v !== undefined);
      
      const templateBAvg = templateBValues.length > 0
        ? templateBValues.reduce((sum, val) => sum + val, 0) / templateBValues.length
        : 0;
      
      // Calculate difference and percent improvement
      const difference = templateBAvg - templateAAvg;
      const percentImprovement = templateAAvg !== 0
        ? (difference / Math.abs(templateAAvg)) * 100
        : difference !== 0 ? 100 : 0;
      
      summary[metric] = {
        templateA: templateAAvg,
        templateB: templateBAvg,
        difference,
        percentImprovement
      };
    }
    
    // Determine winner based on primary metric (first in the list)
    const primaryMetric = test.metrics[0];
    if (primaryMetric && summary[primaryMetric]) {
      const { templateA, templateB } = summary[primaryMetric];
      
      if (templateA > templateB) {
        result.winner = 'A';
      } else if (templateB > templateA) {
        result.winner = 'B';
      } else {
        result.winner = 'tie';
      }
      
      // Simple confidence calculation based on sample size
      // In a real implementation, this would use statistical significance tests
      const totalSamples = result.templateAResults.length + result.templateBResults.length;
      result.confidence = Math.min(0.5 + (totalSamples / 100) * 0.5, 0.99);
    }
    
    // Update result
    result.summary = summary;
    result.updatedAt = new Date();
    
    return result;
  }
  
  /**
   * Calculate results for all tests
   * 
   * @returns Map of test IDs to results
   */
  calculateAllResults(): Map<string, ABTestResult> {
    for (const testId of this.tests.keys()) {
      this._calculateResults(testId);
    }
    
    return this.results;
  }
  
  /**
   * Get the winning template for a test
   * 
   * @param testId Test ID
   * @returns The winning template or undefined if there's no winner yet
   */
  getWinningTemplate(testId: string): PromptTemplate | undefined {
    const test = this.tests.get(testId);
    const result = this.results.get(testId);
    
    if (!test || !result || !result.winner || result.winner === 'tie') {
      return undefined;
    }
    
    // Get the winning template
    const templateId = result.winner === 'A' ? test.templateA.id : test.templateB.id;
    const templateVersion = result.winner === 'A' ? test.templateA.version : test.templateB.version;
    
    return this.registry.getTemplate(templateId, templateVersion);
  }
}
