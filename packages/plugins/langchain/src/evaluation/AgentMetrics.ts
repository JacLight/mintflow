/**
 * Metrics for evaluating agent performance
 */

/**
 * Interface for agent evaluation results
 */
export interface AgentEvaluationResult {
  /**
   * The overall score of the agent
   * A value between 0 and 1, where 1 is the best
   */
  overallScore: number;
  
  /**
   * The success rate of the agent
   * The fraction of tasks that were completed successfully
   */
  successRate: number;
  
  /**
   * The accuracy of the agent
   * The fraction of tasks that were completed correctly
   */
  accuracy: number;
  
  /**
   * The efficiency of the agent
   * Measures how efficiently the agent completed the tasks
   */
  efficiency: number;
  
  /**
   * The reasoning score of the agent
   * Measures the quality of the agent's reasoning
   */
  reasoningScore: number;
  
  /**
   * The tool usage score of the agent
   * Measures how effectively the agent used tools
   */
  toolUsageScore: number;
  
  /**
   * The average number of steps taken by the agent
   */
  averageSteps: number;
  
  /**
   * The average time taken by the agent in milliseconds
   */
  averageLatencyMs: number;
  
  /**
   * Additional metrics specific to the agent
   */
  additionalMetrics?: Record<string, number>;
}

/**
 * Interface for agent step evaluation
 */
export interface AgentStepEvaluation {
  /**
   * The step number
   */
  stepNumber: number;
  
  /**
   * The action taken by the agent
   */
  action: string;
  
  /**
   * The input to the action
   */
  input: any;
  
  /**
   * The output from the action
   */
  output: any;
  
  /**
   * Whether the step was necessary
   */
  necessary: boolean;
  
  /**
   * Whether the step was correct
   */
  correct: boolean;
  
  /**
   * The reasoning quality score
   */
  reasoningScore: number;
  
  /**
   * The time taken for the step in milliseconds
   */
  latencyMs: number;
}

/**
 * Interface for agent task evaluation
 */
export interface AgentTaskEvaluation {
  /**
   * The task ID
   */
  taskId: string;
  
  /**
   * The task description
   */
  taskDescription: string;
  
  /**
   * Whether the task was completed successfully
   */
  success: boolean;
  
  /**
   * Whether the task was completed correctly
   */
  correct: boolean;
  
  /**
   * The steps taken by the agent
   */
  steps: AgentStepEvaluation[];
  
  /**
   * The total time taken for the task in milliseconds
   */
  totalLatencyMs: number;
  
  /**
   * The final answer provided by the agent
   */
  finalAnswer: string;
  
  /**
   * The expected answer for the task
   */
  expectedAnswer?: string;
  
  /**
   * The score for the task
   */
  score: number;
}

/**
 * Options for evaluating agent performance
 */
export interface AgentEvaluationOptions {
  /**
   * The expected answers for each task
   */
  expectedAnswers?: Map<string, string>;
  
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
   * Whether to evaluate reasoning
   */
  evaluateReasoning?: boolean;
  
  /**
   * Whether to evaluate tool usage
   */
  evaluateToolUsage?: boolean;
  
  /**
   * Additional options specific to the agent
   */
  additionalOptions?: Record<string, any>;
}

/**
 * Evaluate agent step
 * 
 * @param step The agent step to evaluate
 * @param options The evaluation options
 * @returns The step evaluation
 */
export function evaluateAgentStep(
  step: {
    stepNumber: number;
    action: string;
    input: any;
    output: any;
    reasoning?: string;
    latencyMs?: number;
  },
  options: AgentEvaluationOptions
): AgentStepEvaluation {
  // Determine if the step was necessary and correct
  // This is a placeholder for a more sophisticated evaluation
  const necessary = true;
  const correct = true;
  
  // Calculate reasoning score
  // This is a placeholder for a more sophisticated evaluation
  const reasoningScore = options.evaluateReasoning ? 0.8 : 1.0;
  
  // Return step evaluation
  return {
    stepNumber: step.stepNumber,
    action: step.action,
    input: step.input,
    output: step.output,
    necessary,
    correct,
    reasoningScore,
    latencyMs: step.latencyMs || 0
  };
}

/**
 * Evaluate agent task
 * 
 * @param task The agent task to evaluate
 * @param options The evaluation options
 * @returns The task evaluation
 */
export function evaluateAgentTask(
  task: {
    taskId: string;
    taskDescription: string;
    steps: Array<{
      stepNumber: number;
      action: string;
      input: any;
      output: any;
      reasoning?: string;
      latencyMs?: number;
    }>;
    finalAnswer: string;
    totalLatencyMs?: number;
  },
  options: AgentEvaluationOptions
): AgentTaskEvaluation {
  // Evaluate each step
  const stepEvaluations = task.steps.map(step => evaluateAgentStep(step, options));
  
  // Determine if the task was completed successfully
  const success = true; // Placeholder
  
  // Determine if the task was completed correctly
  let correct = true; // Default to true
  
  // If we have an expected answer, check if the final answer is correct
  if (options.expectedAnswers && options.expectedAnswers.has(task.taskId)) {
    const expectedAnswer = options.expectedAnswers.get(task.taskId);
    
    // This is a placeholder for a more sophisticated comparison
    correct = task.finalAnswer.toLowerCase().includes(expectedAnswer!.toLowerCase());
  }
  
  // Calculate the score for the task
  const score = correct ? 1.0 : 0.0;
  
  // Return task evaluation
  return {
    taskId: task.taskId,
    taskDescription: task.taskDescription,
    success,
    correct,
    steps: stepEvaluations,
    totalLatencyMs: task.totalLatencyMs || 0,
    finalAnswer: task.finalAnswer,
    expectedAnswer: options.expectedAnswers?.get(task.taskId),
    score
  };
}

/**
 * Evaluate agent performance
 * 
 * @param tasks The agent tasks to evaluate
 * @param options The evaluation options
 * @returns The evaluation results
 */
export function evaluateAgent(
  tasks: Array<{
    taskId: string;
    taskDescription: string;
    steps: Array<{
      stepNumber: number;
      action: string;
      input: any;
      output: any;
      reasoning?: string;
      latencyMs?: number;
    }>;
    finalAnswer: string;
    totalLatencyMs?: number;
  }>,
  options: AgentEvaluationOptions
): AgentEvaluationResult {
  // Evaluate each task
  const taskEvaluations = tasks.map(task => evaluateAgentTask(task, options));
  
  // Calculate success rate
  const successRate = taskEvaluations.filter(task => task.success).length / taskEvaluations.length;
  
  // Calculate accuracy
  const accuracy = taskEvaluations.filter(task => task.correct).length / taskEvaluations.length;
  
  // Calculate efficiency
  // This is a placeholder for a more sophisticated calculation
  const efficiency = 0.8;
  
  // Calculate reasoning score
  const reasoningScore = options.evaluateReasoning
    ? taskEvaluations.reduce((sum, task) => {
        return sum + task.steps.reduce((stepSum, step) => stepSum + step.reasoningScore, 0) / task.steps.length;
      }, 0) / taskEvaluations.length
    : 1.0;
  
  // Calculate tool usage score
  // This is a placeholder for a more sophisticated calculation
  const toolUsageScore = options.evaluateToolUsage ? 0.9 : 1.0;
  
  // Calculate average steps
  const averageSteps = taskEvaluations.reduce((sum, task) => sum + task.steps.length, 0) / taskEvaluations.length;
  
  // Calculate average latency
  const averageLatencyMs = options.includeLatency
    ? taskEvaluations.reduce((sum, task) => sum + task.totalLatencyMs, 0) / taskEvaluations.length
    : 0;
  
  // Calculate overall score
  const overallScore = (
    successRate * 0.3 +
    accuracy * 0.3 +
    efficiency * 0.2 +
    reasoningScore * 0.1 +
    toolUsageScore * 0.1
  );
  
  // Return evaluation results
  return {
    overallScore,
    successRate,
    accuracy,
    efficiency,
    reasoningScore,
    toolUsageScore,
    averageSteps,
    averageLatencyMs,
    additionalMetrics: options.additionalOptions
  };
}

/**
 * Class for evaluating agent performance
 */
export class AgentEvaluator {
  private options: AgentEvaluationOptions;
  
  /**
   * Create a new AgentEvaluator
   * 
   * @param options The evaluation options
   */
  constructor(options: AgentEvaluationOptions) {
    this.options = options;
  }
  
  /**
   * Evaluate agent performance
   * 
   * @param tasks The agent tasks to evaluate
   * @returns The evaluation results
   */
  evaluate(
    tasks: Array<{
      taskId: string;
      taskDescription: string;
      steps: Array<{
        stepNumber: number;
        action: string;
        input: any;
        output: any;
        reasoning?: string;
        latencyMs?: number;
      }>;
      finalAnswer: string;
      totalLatencyMs?: number;
    }>
  ): AgentEvaluationResult {
    return evaluateAgent(tasks, this.options);
  }
  
  /**
   * Evaluate a single agent task
   * 
   * @param task The agent task to evaluate
   * @returns The task evaluation
   */
  evaluateTask(
    task: {
      taskId: string;
      taskDescription: string;
      steps: Array<{
        stepNumber: number;
        action: string;
        input: any;
        output: any;
        reasoning?: string;
        latencyMs?: number;
      }>;
      finalAnswer: string;
      totalLatencyMs?: number;
    }
  ): AgentTaskEvaluation {
    return evaluateAgentTask(task, this.options);
  }
  
  /**
   * Get the options used for evaluation
   * 
   * @returns The evaluation options
   */
  getOptions(): AgentEvaluationOptions {
    return this.options;
  }
  
  /**
   * Set the options used for evaluation
   * 
   * @param options The evaluation options
   */
  setOptions(options: AgentEvaluationOptions): void {
    this.options = options;
  }
}
