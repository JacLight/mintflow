// Component registry for LangChain.js components
export interface ComponentFactory<T = any> {
  create(config: any): T | Promise<T>;
}

export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, ComponentFactory> = new Map();
  
  private constructor() {}
  
  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }
  
  registerComponent(type: string, factory: ComponentFactory): void {
    this.components.set(type, factory);
  }
  
  getComponentFactory(type: string): ComponentFactory {
    const factory = this.components.get(type);
    if (!factory) {
      throw new Error(`Component type not registered: ${type}`);
    }
    return factory;
  }
  
  getRegisteredTypes(): string[] {
    return Array.from(this.components.keys());
  }
}
