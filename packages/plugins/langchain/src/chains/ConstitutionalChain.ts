import { Chain } from './SequentialChain.js';
import { LLM } from './LLMChain.js';
import { OutputParser } from '../parsers/index.js';

/**
 * Interface for a constitutional principle
 */
export interface ConstitutionalPrinciple {
  /**
   * The name of the principle
   */
  name: string;
  
  /**
   * The description of the principle
   */
  description: string;
  
  /**
   * Optional critique prompt template
   * If not provided, a default template will be used
   * The template should include {input}, {output}, and {principle} variables
   */
  critiquePromptTemplate?: string;
  
  /**
   * Optional revision prompt template
   * If not provided, a default template will be used
   * The template should include {input}, {output}, {critique}, and {principle} variables
   */
  revisionPromptTemplate?: string;
}

/**
 * Options for ConstitutionalChain
 */
export interface ConstitutionalChainOptions {
  /**
   * The chain to apply constitutional principles to
   */
  chain: Chain;
  
  /**
   * The LLM to use for critiquing and revising
   */
  llm: LLM;
  
  /**
   * The constitutional principles to apply
   */
  principles: ConstitutionalPrinciple[];
  
  /**
   * Optional output parser to parse the LLM output for critiques
   */
  critiqueOutputParser?: OutputParser;
  
  /**
   * Optional output parser to parse the LLM output for revisions
   */
  revisionOutputParser?: OutputParser;
  
  /**
   * Optional callback to call before critiquing
   */
  onCritiqueStart?: (principle: ConstitutionalPrinciple, output: any) => void;
  
  /**
   * Optional callback to call after critiquing
   */
  onCritiqueEnd?: (principle: ConstitutionalPrinciple, critique: string) => void;
  
  /**
   * Optional callback to call before revising
   */
  onRevisionStart?: (principle: ConstitutionalPrinciple, critique: string) => void;
  
  /**
   * Optional callback to call after revising
   */
  onRevisionEnd?: (principle: ConstitutionalPrinciple, revision: any) => void;
  
  /**
   * Optional flag to return the critiques and revisions
   * If true, the critiques and revisions will be included in the output
   */
  returnIntermediateSteps?: boolean;
}

/**
 * A chain that applies constitutional principles to the output of another chain
 */
export class ConstitutionalChain implements Chain {
  private chain: Chain;
  private llm: LLM;
  private principles: ConstitutionalPrinciple[];
  private critiqueOutputParser?: OutputParser;
  private revisionOutputParser?: OutputParser;
  private onCritiqueStart?: (principle: ConstitutionalPrinciple, output: any) => void;
  private onCritiqueEnd?: (principle: ConstitutionalPrinciple, critique: string) => void;
  private onRevisionStart?: (principle: ConstitutionalPrinciple, critique: string) => void;
  private onRevisionEnd?: (principle: ConstitutionalPrinciple, revision: any) => void;
  private returnIntermediateSteps: boolean;
  
  /**
   * Create a new ConstitutionalChain
   * 
   * @param options Options for the chain
   */
  constructor(options: ConstitutionalChainOptions) {
    this.chain = options.chain;
    this.llm = options.llm;
    this.principles = options.principles;
    this.critiqueOutputParser = options.critiqueOutputParser;
    this.revisionOutputParser = options.revisionOutputParser;
    this.onCritiqueStart = options.onCritiqueStart;
    this.onCritiqueEnd = options.onCritiqueEnd;
    this.onRevisionStart = options.onRevisionStart;
    this.onRevisionEnd = options.onRevisionEnd;
    this.returnIntermediateSteps = options.returnIntermediateSteps || false;
  }
  
  /**
   * Format the critique prompt with the given input, output, and principle
   * 
   * @param input The input to the chain
   * @param output The output of the chain
   * @param principle The constitutional principle
   * @returns The formatted prompt
   */
  private formatCritiquePrompt(
    input: Record<string, any>,
    output: any,
    principle: ConstitutionalPrinciple
  ): string {
    const template = principle.critiquePromptTemplate || 
      "You are evaluating a response based on a specific principle. Your job is to critique the response and identify any violations of the principle.\n\nPrinciple: {principle}\n\nInput: {input}\n\nResponse: {output}\n\nCritique:";
    
    return template
      .replace('{principle}', principle.description)
      .replace('{input}', JSON.stringify(input, null, 2))
      .replace('{output}', typeof output === 'string' ? output : JSON.stringify(output, null, 2));
  }
  
  /**
   * Format the revision prompt with the given input, output, critique, and principle
   * 
   * @param input The input to the chain
   * @param output The output of the chain
   * @param critique The critique of the output
   * @param principle The constitutional principle
   * @returns The formatted prompt
   */
  private formatRevisionPrompt(
    input: Record<string, any>,
    output: any,
    critique: string,
    principle: ConstitutionalPrinciple
  ): string {
    const template = principle.revisionPromptTemplate || 
      "You are revising a response based on a critique. Your job is to address the issues identified in the critique while maintaining the helpful intent of the original response.\n\nPrinciple: {principle}\n\nInput: {input}\n\nOriginal Response: {output}\n\nCritique: {critique}\n\nRevised Response:";
    
    return template
      .replace('{principle}', principle.description)
      .replace('{input}', JSON.stringify(input, null, 2))
      .replace('{output}', typeof output === 'string' ? output : JSON.stringify(output, null, 2))
      .replace('{critique}', critique);
  }
  
  /**
   * Critique the output based on a constitutional principle
   * 
   * @param input The input to the chain
   * @param output The output of the chain
   * @param principle The constitutional principle
   * @returns The critique of the output
   */
  private async critique(
    input: Record<string, any>,
    output: any,
    principle: ConstitutionalPrinciple
  ): Promise<string> {
    // Call the onCritiqueStart callback if provided
    if (this.onCritiqueStart) {
      this.onCritiqueStart(principle, output);
    }
    
    // Format the prompt
    const prompt = this.formatCritiquePrompt(input, output, principle);
    
    // Run the LLM
    let critique = await this.llm.complete(prompt);
    
    // Parse the output if a parser is provided
    if (this.critiqueOutputParser) {
      critique = this.critiqueOutputParser.parse(critique);
    }
    
    // Call the onCritiqueEnd callback if provided
    if (this.onCritiqueEnd) {
      this.onCritiqueEnd(principle, critique);
    }
    
    return critique;
  }
  
  /**
   * Revise the output based on a critique and a constitutional principle
   * 
   * @param input The input to the chain
   * @param output The output of the chain
   * @param critique The critique of the output
   * @param principle The constitutional principle
   * @returns The revised output
   */
  private async revise(
    input: Record<string, any>,
    output: any,
    critique: string,
    principle: ConstitutionalPrinciple
  ): Promise<any> {
    // Call the onRevisionStart callback if provided
    if (this.onRevisionStart) {
      this.onRevisionStart(principle, critique);
    }
    
    // Format the prompt
    const prompt = this.formatRevisionPrompt(input, output, critique, principle);
    
    // Run the LLM
    let revision = await this.llm.complete(prompt);
    
    // Parse the output if a parser is provided
    if (this.revisionOutputParser) {
      revision = this.revisionOutputParser.parse(revision);
    }
    
    // Call the onRevisionEnd callback if provided
    if (this.onRevisionEnd) {
      this.onRevisionEnd(principle, revision);
    }
    
    return revision;
  }
  
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the chain
   * @param options Optional parameters for the chain
   * @returns The output of the chain after applying constitutional principles
   */
  async run(input: Record<string, any>, options?: any): Promise<any> {
    // Run the original chain
    let output = await this.chain.run(input, options);
    
    // Apply each principle in sequence
    for (const principle of this.principles) {
      // Critique the output
      const critique = await this.critique(input, output, principle);
      
      // Revise the output
      output = await this.revise(input, output, critique, principle);
    }
    
    return output;
  }
  
  /**
   * Run the chain with the given input values and return the output with additional metadata
   * 
   * @param input Input values for the chain
   * @param options Optional parameters for the chain
   * @returns The output of the chain after applying constitutional principles with additional metadata
   */
  async call(input: Record<string, any>, options?: any): Promise<{
    output: any;
    originalOutput: any;
    steps?: Array<{
      principle: ConstitutionalPrinciple;
      critique: string;
      revision: any;
    }>;
  }> {
    // Run the original chain
    let output = await this.chain.run(input, options);
    const originalOutput = output;
    
    // Store the steps if returnIntermediateSteps is true
    const steps: Array<{
      principle: ConstitutionalPrinciple;
      critique: string;
      revision: any;
    }> = [];
    
    // Apply each principle in sequence
    for (const principle of this.principles) {
      // Critique the output
      const critique = await this.critique(input, output, principle);
      
      // Revise the output
      const revision = await this.revise(input, output, critique, principle);
      
      // Store the step if returnIntermediateSteps is true
      if (this.returnIntermediateSteps) {
        steps.push({
          principle,
          critique,
          revision
        });
      }
      
      // Update the output
      output = revision;
    }
    
    return {
      output,
      originalOutput,
      steps: this.returnIntermediateSteps ? steps : undefined
    };
  }
}

/**
 * Factory for creating ConstitutionalChain instances
 */
export class ConstitutionalChainFactory {
  /**
   * Create a new ConstitutionalChain
   * 
   * @param options Options for the chain
   * @returns A new ConstitutionalChain instance
   */
  static create(options: ConstitutionalChainOptions): ConstitutionalChain {
    return new ConstitutionalChain(options);
  }
  
  /**
   * Create a new ConstitutionalChain with a simple configuration
   * 
   * @param chain The chain to apply constitutional principles to
   * @param llm The LLM to use for critiquing and revising
   * @param principles The constitutional principles to apply
   * @returns A new ConstitutionalChain instance
   */
  static fromChainAndLLM(
    chain: Chain,
    llm: LLM,
    principles: ConstitutionalPrinciple[]
  ): ConstitutionalChain {
    return new ConstitutionalChain({
      chain,
      llm,
      principles
    });
  }
  
  /**
   * Create a new ConstitutionalChain with a single principle
   * 
   * @param chain The chain to apply the constitutional principle to
   * @param llm The LLM to use for critiquing and revising
   * @param principle The constitutional principle to apply
   * @returns A new ConstitutionalChain instance
   */
  static withPrinciple(
    chain: Chain,
    llm: LLM,
    principle: ConstitutionalPrinciple
  ): ConstitutionalChain {
    return new ConstitutionalChain({
      chain,
      llm,
      principles: [principle]
    });
  }
  
  /**
   * Create a new ConstitutionalChain with common ethical principles
   * 
   * @param chain The chain to apply constitutional principles to
   * @param llm The LLM to use for critiquing and revising
   * @returns A new ConstitutionalChain instance
   */
  static withEthicalPrinciples(
    chain: Chain,
    llm: LLM
  ): ConstitutionalChain {
    const principles: ConstitutionalPrinciple[] = [
      {
        name: "Ethical Principle: Do No Harm",
        description: "The response should not encourage, promote, or assist in causing harm to individuals or groups."
      },
      {
        name: "Ethical Principle: Respect Privacy",
        description: "The response should respect privacy and not encourage invasive or surveillance activities without proper consent and safeguards."
      },
      {
        name: "Ethical Principle: Fairness and Non-Discrimination",
        description: "The response should be fair and not discriminate against individuals or groups based on protected characteristics such as race, gender, religion, etc."
      }
    ];
    
    return new ConstitutionalChain({
      chain,
      llm,
      principles
    });
  }
}
