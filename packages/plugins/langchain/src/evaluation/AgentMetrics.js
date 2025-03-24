/**
 * Metrics for evaluating agent performance
 */

/**
 * Evaluate agent step
 * 
 * @param {string} task The task description
 * @param {object} step The agent step
 * @param {object} options The evaluation options
 * @returns {object} The evaluation result
 */
export function evaluateAgentStep(task, step, options = {}) {
  const result = {
    metrics: {}
  };
  
  // Calculate tool usage appropriateness if requested
  if (options.toolUsage) {
    result.metrics.toolUsage = calculateToolUsage(task, step);
  }
  
  // Calculate reasoning quality if requested
  if (options.reasoningQuality) {
    result.metrics.reasoningQuality = calculateReasoningQuality(task, step);
  }
  
  // Calculate action efficiency if requested
  if (options.actionEfficiency) {
    result.metrics.actionEfficiency = calculateActionEfficiency(step);
  }
  
  return result;
}

/**
 * Evaluate agent task
 * 
 * @param {string} task The task description
 * @param {Array<object>} steps The agent steps
 * @param {object} finalOutput The final output
 * @param {object} options The evaluation options
 * @returns {object} The evaluation result
 */
export function evaluateAgentTask(task, steps, finalOutput, options = {}) {
  const result = {
    metrics: {}
  };
  
  // Calculate task completion if requested
  if (options.taskCompletion) {
    result.metrics.taskCompletion = calculateTaskCompletion(task, finalOutput, options.expectedOutput);
  }
  
  // Calculate hallucination if requested
  if (options.hallucination) {
    result.metrics.hallucination = calculateHallucination(task, finalOutput);
  }
  
  // Calculate step metrics if requested
  if (options.stepMetrics) {
    result.stepMetrics = steps.map(step => evaluateAgentStep(task, step, options).metrics);
    
    // Calculate average step metrics
    result.metrics.averageToolUsage = calculateAverage(result.stepMetrics.map(m => m.toolUsage));
    result.metrics.averageReasoningQuality = calculateAverage(result.stepMetrics.map(m => m.reasoningQuality));
    result.metrics.averageActionEfficiency = calculateAverage(result.stepMetrics.map(m => m.actionEfficiency));
  }
  
  return result;
}

/**
 * Evaluate agent
 * 
 * @param {Array<object>} tasks The tasks
 * @param {object} options The evaluation options
 * @returns {object} The evaluation result
 */
export function evaluateAgent(tasks, options = {}) {
  const result = {
    metrics: {},
    taskResults: []
  };
  
  // Evaluate each task
  for (const task of tasks) {
    const taskResult = evaluateAgentTask(task.description, task.steps, task.finalOutput, options);
    result.taskResults.push(taskResult);
  }
  
  // Calculate average metrics across tasks
  result.metrics.averageTaskCompletion = calculateAverage(result.taskResults.map(r => r.metrics.taskCompletion));
  result.metrics.averageHallucination = calculateAverage(result.taskResults.map(r => r.metrics.hallucination));
  
  if (options.stepMetrics) {
    result.metrics.averageToolUsage = calculateAverage(result.taskResults.map(r => r.metrics.averageToolUsage));
    result.metrics.averageReasoningQuality = calculateAverage(result.taskResults.map(r => r.metrics.averageReasoningQuality));
    result.metrics.averageActionEfficiency = calculateAverage(result.taskResults.map(r => r.metrics.averageActionEfficiency));
  }
  
  return result;
}

/**
 * Calculate average
 * 
 * @param {Array<number>} values The values
 * @returns {number} The average
 */
function calculateAverage(values) {
  if (!values || values.length === 0) {
    return 0;
  }
  
  const validValues = values.filter(v => v !== undefined && v !== null);
  
  if (validValues.length === 0) {
    return 0;
  }
  
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

/**
 * Calculate tool usage appropriateness
 * 
 * @param {string} task The task description
 * @param {object} step The agent step
 * @returns {number} The tool usage appropriateness score
 */
function calculateToolUsage(task, step) {
  // This is a placeholder for a more sophisticated tool usage appropriateness calculation
  // In a real implementation, this would analyze the appropriateness of the tool usage
  
  // For now, we'll return a random value between 0.7 and 1
  return 0.7 + Math.random() * 0.3;
}

/**
 * Calculate reasoning quality
 * 
 * @param {string} task The task description
 * @param {object} step The agent step
 * @returns {number} The reasoning quality score
 */
function calculateReasoningQuality(task, step) {
  // This is a placeholder for a more sophisticated reasoning quality calculation
  // In a real implementation, this would analyze the quality of the reasoning
  
  // For now, we'll use a simple heuristic based on reasoning length
  if (!step.reasoning) {
    return 0;
  }
  
  const words = step.reasoning.split(/\s+/).length;
  
  // Penalize very short reasoning
  if (words < 10) {
    return 0.3;
  }
  
  // Reward longer reasoning
  return Math.min(1, 0.5 + words / 100);
}

/**
 * Calculate action efficiency
 * 
 * @param {object} step The agent step
 * @returns {number} The action efficiency score
 */
function calculateActionEfficiency(step) {
  // This is a placeholder for a more sophisticated action efficiency calculation
  // In a real implementation, this would analyze the efficiency of the action
  
  // For now, we'll return a random value between 0.5 and 1
  return 0.5 + Math.random() * 0.5;
}

/**
 * Calculate task completion
 * 
 * @param {string} task The task description
 * @param {object} finalOutput The final output
 * @param {object} expectedOutput The expected output
 * @returns {number} The task completion score
 */
function calculateTaskCompletion(task, finalOutput, expectedOutput) {
  // This is a placeholder for a more sophisticated task completion calculation
  // In a real implementation, this would analyze the completion of the task
  
  if (expectedOutput) {
    // If we have an expected output, calculate similarity
    return calculateSimilarity(finalOutput, expectedOutput);
  } else {
    // Otherwise, return a random value between 0.5 and 1
    return 0.5 + Math.random() * 0.5;
  }
}

/**
 * Calculate hallucination
 * 
 * @param {string} task The task description
 * @param {object} finalOutput The final output
 * @returns {number} The hallucination score
 */
function calculateHallucination(task, finalOutput) {
  // This is a placeholder for a more sophisticated hallucination calculation
  // In a real implementation, this would analyze the hallucination in the output
  
  // For now, we'll return a random value between 0 and 0.3
  return Math.random() * 0.3;
}

/**
 * Calculate similarity between two texts
 * 
 * @param {string} text1 The first text
 * @param {string} text2 The second text
 * @returns {number} The similarity score
 */
function calculateSimilarity(text1, text2) {
  // This is a placeholder for a more sophisticated similarity calculation
  // In a real implementation, this would use embeddings or a language model
  
  // For now, we'll use a simple Jaccard similarity
  const tokens1 = new Set(text1.toLowerCase().split(/\s+/));
  const tokens2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...tokens1].filter(token => tokens2.has(token)));
  const union = new Set([...tokens1, ...tokens2]);
  
  return intersection.size / union.size;
}

/**
 * Agent evaluator
 */
export class AgentEvaluator {
  /**
   * Create a new agent evaluator
   * 
   * @param {object} options The evaluator options
   */
  constructor(options = {}) {
    this.options = options;
  }
  
  /**
   * Evaluate agent step
   * 
   * @param {string} task The task description
   * @param {object} step The agent step
   * @returns {object} The evaluation result
   */
  evaluateStep(task, step) {
    return evaluateAgentStep(task, step, this.options);
  }
  
  /**
   * Evaluate agent task
   * 
   * @param {string} task The task description
   * @param {Array<object>} steps The agent steps
   * @param {object} finalOutput The final output
   * @returns {object} The evaluation result
   */
  evaluateTask(task, steps, finalOutput) {
    return evaluateAgentTask(task, steps, finalOutput, this.options);
  }
  
  /**
   * Evaluate agent
   * 
   * @param {Array<object>} tasks The tasks
   * @returns {object} The evaluation result
   */
  evaluate(tasks) {
    return evaluateAgent(tasks, this.options);
  }
}
