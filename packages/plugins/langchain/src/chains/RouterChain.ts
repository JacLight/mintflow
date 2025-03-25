import { Chain } from './SequentialChain.js';
import { LLM } from './LLMChain.js';
import { OutputParser } from '../parsers/index.js';

/**
 * Type for a routing function
 */
export type RouterFunction = (input: Record<string, any>) => Promise<string> | string;

/**
 * Interface for a route
 */
export interface Route {
  /**
   * The name of the route
   */
  name: string;
  
  /**
   * The chain to use for this route
   */
  chain: Chain;
  
  /**
   * Optional description of the route
   */
  description?: string;
  
  /**
   * Optional input mapping function
   * Maps the input to the chain's expected input format
   */
  inputMapping?: (input: Record<string, any>) => Record<string, any>;
  
  /**
   * Optional output mapping function
   * Maps the chain's output to the expected output format
   */
  outputMapping?: (output: any) => any;
}

/**
 * Options for RouterChain
 */
export interface RouterChainOptions {
  /**
   * The routes to use
   */
  routes: Route[];
  
  /**
   * The routing function to use
   * If not provided, an LLM-based router will be used
   */
  routerFunction?: RouterFunction;
  
  /**
   * The LLM to use for routing
   * Only used if routerFunction is not provided
   */
  llm?: LLM;
  
  /**
   * Optional prompt template for the LLM-based router
   * Only used if routerFunction is not provided
   * The template should include {input} and {routes} variables
   */
  routerPromptTemplate?: string;
  
  /**
   * Optional output parser for the LLM-based router
   * Only used if routerFunction is not provided
   */
  routerOutputParser?: OutputParser;
  
  /**
   * Optional default route to use if no route is matched
   * If not provided, an error will be thrown if no route is matched
   */
  defaultRoute?: string;
  
  /**
   * Optional callback to call before routing
   */
  onRouting?: (input: Record<string, any>) => void;
  
  /**
   * Optional callback to call after routing
   */
  onRouted?: (routeName: string, input: Record<string, any>) => void;
  
  /**
   * Optional callback to call before running a chain
   */
  onChainStart?: (routeName: string, input: Record<string, any>) => void;
  
  /**
   * Optional callback to call after running a chain
   */
  onChainEnd?: (routeName: string, output: any) => void;
}

/**
 * A chain that routes inputs to different chains based on a routing function
 */
export class RouterChain implements Chain {
  private routes: Map<string, Route>;
  private routerFunction: RouterFunction;
  private defaultRoute?: string;
  private onRouting?: (input: Record<string, any>) => void;
  private onRouted?: (routeName: string, input: Record<string, any>) => void;
  private onChainStart?: (routeName: string, input: Record<string, any>) => void;
  private onChainEnd?: (routeName: string, output: any) => void;
  
  /**
   * Create a new RouterChain
   * 
   * @param options Options for the chain
   */
  constructor(options: RouterChainOptions) {
    // Initialize the routes map
    this.routes = new Map();
    for (const route of options.routes) {
      this.routes.set(route.name, route);
    }
    
    // Set the router function
    if (options.routerFunction) {
      this.routerFunction = options.routerFunction;
    } else if (options.llm) {
      this.routerFunction = this.createLLMRouter(
        options.llm,
        options.routerPromptTemplate,
        options.routerOutputParser
      );
    } else {
      throw new Error('Either routerFunction or llm must be provided');
    }
    
    // Set the default route
    this.defaultRoute = options.defaultRoute;
    
    // Set the callbacks
    this.onRouting = options.onRouting;
    this.onRouted = options.onRouted;
    this.onChainStart = options.onChainStart;
    this.onChainEnd = options.onChainEnd;
  }
  
  /**
   * Create an LLM-based router function
   * 
   * @param llm The LLM to use
   * @param promptTemplate Optional prompt template
   * @param outputParser Optional output parser
   * @returns A router function
   */
  private createLLMRouter(
    llm: LLM,
    promptTemplate?: string,
    outputParser?: OutputParser
  ): RouterFunction {
    // Set the default prompt template if not provided
    const template = promptTemplate || 
      "Given the following input, select the most appropriate route from the options below:\n\nInput: {input}\n\nRoutes:\n{routes}\n\nSelected route:";
    
    return async (input: Record<string, any>): Promise<string> => {
      // Format the routes as a string
      const routesString = Array.from(this.routes.values())
        .map(route => {
          const description = route.description || '';
          return `- ${route.name}${description ? `: ${description}` : ''}`;
        })
        .join('\n');
      
      // Format the input as a string
      const inputString = JSON.stringify(input, null, 2);
      
      // Format the prompt
      const prompt = template
        .replace('{input}', inputString)
        .replace('{routes}', routesString);
      
      // Run the LLM
      let output = await llm.complete(prompt);
      
      // Parse the output if a parser is provided
      if (outputParser) {
        output = outputParser.parse(output);
      }
      
      // Extract the route name from the output
      const routeName = output.trim();
      
      return routeName;
    };
  }
  
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the chain
   * @param options Optional parameters for the chain
   * @returns The output of the selected chain
   */
  async run(input: Record<string, any>, options?: any): Promise<any> {
    // Call the onRouting callback if provided
    if (this.onRouting) {
      this.onRouting(input);
    }
    
    // Determine the route to use
    const routeName = await this.routerFunction(input);
    
    // Call the onRouted callback if provided
    if (this.onRouted) {
      this.onRouted(routeName, input);
    }
    
    // Get the route
    const route = this.routes.get(routeName);
    
    // If the route doesn't exist, use the default route or throw an error
    if (!route) {
      if (this.defaultRoute) {
        const defaultRoute = this.routes.get(this.defaultRoute);
        if (!defaultRoute) {
          throw new Error(`Default route "${this.defaultRoute}" not found`);
        }
        return this.runRoute(this.defaultRoute, defaultRoute, input, options);
      } else {
        throw new Error(`Route "${routeName}" not found and no default route is set`);
      }
    }
    
    // Run the route
    return this.runRoute(routeName, route, input, options);
  }
  
  /**
   * Run a specific route
   * 
   * @param routeName The name of the route
   * @param route The route to run
   * @param input Input values for the chain
   * @param options Optional parameters for the chain
   * @returns The output of the chain
   */
  private async runRoute(
    routeName: string,
    route: Route,
    input: Record<string, any>,
    options?: any
  ): Promise<any> {
    // Map the input if an input mapping is provided
    const chainInput = route.inputMapping ? route.inputMapping(input) : input;
    
    // Call the onChainStart callback if provided
    if (this.onChainStart) {
      this.onChainStart(routeName, chainInput);
    }
    
    // Run the chain
    const chainOutput = await route.chain.run(chainInput, options);
    
    // Call the onChainEnd callback if provided
    if (this.onChainEnd) {
      this.onChainEnd(routeName, chainOutput);
    }
    
    // Map the output if an output mapping is provided
    const output = route.outputMapping ? route.outputMapping(chainOutput) : chainOutput;
    
    return output;
  }
  
  /**
   * Run the chain with the given input values and return the output with additional metadata
   * 
   * @param input Input values for the chain
   * @param options Optional parameters for the chain
   * @returns The output of the selected chain with additional metadata
   */
  async call(input: Record<string, any>, options?: any): Promise<{
    output: any;
    routeName: string;
    isDefaultRoute: boolean;
  }> {
    // Call the onRouting callback if provided
    if (this.onRouting) {
      this.onRouting(input);
    }
    
    // Determine the route to use
    const routeName = await this.routerFunction(input);
    
    // Call the onRouted callback if provided
    if (this.onRouted) {
      this.onRouted(routeName, input);
    }
    
    // Get the route
    const route = this.routes.get(routeName);
    
    // If the route doesn't exist, use the default route or throw an error
    if (!route) {
      if (this.defaultRoute) {
        const defaultRoute = this.routes.get(this.defaultRoute);
        if (!defaultRoute) {
          throw new Error(`Default route "${this.defaultRoute}" not found`);
        }
        const output = await this.runRoute(this.defaultRoute, defaultRoute, input, options);
        return {
          output,
          routeName: this.defaultRoute,
          isDefaultRoute: true
        };
      } else {
        throw new Error(`Route "${routeName}" not found and no default route is set`);
      }
    }
    
    // Run the route
    const output = await this.runRoute(routeName, route, input, options);
    
    return {
      output,
      routeName,
      isDefaultRoute: false
    };
  }
}

/**
 * Factory for creating RouterChain instances
 */
export class RouterChainFactory {
  /**
   * Create a new RouterChain
   * 
   * @param options Options for the chain
   * @returns A new RouterChain instance
   */
  static create(options: RouterChainOptions): RouterChain {
    return new RouterChain(options);
  }
  
  /**
   * Create a new RouterChain with an LLM-based router
   * 
   * @param llm The LLM to use for routing
   * @param routes The routes to use
   * @param defaultRoute Optional default route to use if no route is matched
   * @returns A new RouterChain instance
   */
  static fromLLM(
    llm: LLM,
    routes: Route[],
    defaultRoute?: string
  ): RouterChain {
    return new RouterChain({
      llm,
      routes,
      defaultRoute
    });
  }
  
  /**
   * Create a new RouterChain with a custom router function
   * 
   * @param routerFunction The routing function to use
   * @param routes The routes to use
   * @param defaultRoute Optional default route to use if no route is matched
   * @returns A new RouterChain instance
   */
  static fromFunction(
    routerFunction: RouterFunction,
    routes: Route[],
    defaultRoute?: string
  ): RouterChain {
    return new RouterChain({
      routerFunction,
      routes,
      defaultRoute
    });
  }
  
  /**
   * Create a new RouterChain with a keyword-based router
   * 
   * @param keywordMap A map of keywords to route names
   * @param routes The routes to use
   * @param defaultRoute Optional default route to use if no route is matched
   * @returns A new RouterChain instance
   */
  static fromKeywords(
    keywordMap: Record<string, string[]>,
    routes: Route[],
    defaultRoute?: string
  ): RouterChain {
    // Create a router function that matches keywords in the input
    const routerFunction = (input: Record<string, any>): string => {
      // Convert the input to a string
      const inputString = JSON.stringify(input).toLowerCase();
      
      // Check each route for matching keywords
      for (const [routeName, keywords] of Object.entries(keywordMap)) {
        for (const keyword of keywords) {
          if (inputString.includes(keyword.toLowerCase())) {
            return routeName;
          }
        }
      }
      
      // If no route is matched, return the default route or an empty string
      return defaultRoute || '';
    };
    
    return new RouterChain({
      routerFunction,
      routes,
      defaultRoute
    });
  }
}
