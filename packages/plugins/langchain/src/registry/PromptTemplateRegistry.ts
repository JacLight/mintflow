/**
 * Registry for managing prompt templates
 */

import { z } from 'zod';
import { PromptTemplate } from '../adapters/PromptPlugin.js';

/**
 * Version information for a prompt template
 */
export interface TemplateVersion {
  /**
   * The version number (e.g., '1.0.0')
   */
  version: string;
  
  /**
   * The date the version was created
   */
  createdAt: Date;
  
  /**
   * The author of the version
   */
  author?: string;
  
  /**
   * Notes about the version
   */
  notes?: string;
  
  /**
   * Performance metrics for the version
   */
  metrics?: Record<string, number>;
}

/**
 * A registered prompt template with version history
 */
export interface RegisteredTemplate {
  /**
   * The ID of the template
   */
  id: string;
  
  /**
   * The name of the template
   */
  name: string;
  
  /**
   * The description of the template
   */
  description?: string;
  
  /**
   * The tags associated with the template
   */
  tags?: string[];
  
  /**
   * The current version of the template
   */
  currentVersion: string;
  
  /**
   * The versions of the template
   */
  versions: Record<string, {
    /**
     * The template
     */
    template: PromptTemplate;
    
    /**
     * The version information
     */
    versionInfo: TemplateVersion;
  }>;
  
  /**
   * The date the template was created
   */
  createdAt: Date;
  
  /**
   * The date the template was last updated
   */
  updatedAt: Date;
}

/**
 * Options for registering a template
 */
export interface RegisterTemplateOptions {
  /**
   * The ID of the template (optional, will be generated if not provided)
   */
  id?: string;
  
  /**
   * The name of the template
   */
  name: string;
  
  /**
   * The description of the template
   */
  description?: string;
  
  /**
   * The tags associated with the template
   */
  tags?: string[];
  
  /**
   * The template
   */
  template: PromptTemplate;
  
  /**
   * The version information
   */
  versionInfo?: Partial<TemplateVersion>;
}

/**
 * Options for adding a version to a template
 */
export interface AddVersionOptions {
  /**
   * The ID of the template
   */
  templateId: string;
  
  /**
   * The version number
   */
  version: string;
  
  /**
   * The template
   */
  template: PromptTemplate;
  
  /**
   * The version information
   */
  versionInfo?: Partial<TemplateVersion>;
  
  /**
   * Whether to set this version as the current version
   */
  setAsCurrent?: boolean;
}

/**
 * Options for retrieving templates
 */
export interface GetTemplatesOptions {
  /**
   * Filter by tags
   */
  tags?: string[];
  
  /**
   * Filter by name (substring match)
   */
  nameContains?: string;
  
  /**
   * Sort by field
   */
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  
  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc';
  
  /**
   * Limit the number of results
   */
  limit?: number;
  
  /**
   * Skip the first n results
   */
  skip?: number;
}

/**
 * Registry for managing prompt templates
 */
export class PromptTemplateRegistry {
  private static instance: PromptTemplateRegistry;
  private templates: Record<string, RegisteredTemplate> = {};
  
  /**
   * Get the singleton instance of the registry
   * 
   * @returns The registry instance
   */
  static getInstance(): PromptTemplateRegistry {
    if (!PromptTemplateRegistry.instance) {
      PromptTemplateRegistry.instance = new PromptTemplateRegistry();
    }
    return PromptTemplateRegistry.instance;
  }
  
  /**
   * Register a template
   * 
   * @param options Options for registering the template
   * @returns The ID of the registered template
   */
  registerTemplate(options: RegisterTemplateOptions): string {
    const id = options.id || this.generateId();
    const now = new Date();
    
    // Create version info
    const versionInfo: TemplateVersion = {
      version: '1.0.0',
      createdAt: now,
      ...options.versionInfo
    };
    
    // Create the registered template
    const registeredTemplate: RegisteredTemplate = {
      id,
      name: options.name,
      description: options.description,
      tags: options.tags,
      currentVersion: versionInfo.version,
      versions: {
        [versionInfo.version]: {
          template: options.template,
          versionInfo
        }
      },
      createdAt: now,
      updatedAt: now
    };
    
    // Add to the registry
    this.templates[id] = registeredTemplate;
    
    return id;
  }
  
  /**
   * Add a version to a template
   * 
   * @param options Options for adding the version
   * @returns The updated template
   */
  addVersion(options: AddVersionOptions): RegisteredTemplate {
    // Check if the template exists
    const template = this.templates[options.templateId];
    if (!template) {
      throw new Error(`Template with ID ${options.templateId} not found`);
    }
    
    // Check if the version already exists
    if (template.versions[options.version]) {
      throw new Error(`Version ${options.version} already exists for template ${options.templateId}`);
    }
    
    const now = new Date();
    
    // Create version info
    const versionInfo: TemplateVersion = {
      version: options.version,
      createdAt: now,
      ...options.versionInfo
    };
    
    // Add the version
    template.versions[options.version] = {
      template: options.template,
      versionInfo
    };
    
    // Update the template
    template.updatedAt = now;
    
    // Set as current version if requested
    if (options.setAsCurrent) {
      template.currentVersion = options.version;
    }
    
    return template;
  }
  
  /**
   * Get a template by ID
   * 
   * @param id The ID of the template
   * @param version The version to get (optional, defaults to current version)
   * @returns The template
   */
  getTemplate(id: string, version?: string): PromptTemplate {
    // Check if the template exists
    const template = this.templates[id];
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }
    
    // Get the version
    const versionToGet = version || template.currentVersion;
    const versionData = template.versions[versionToGet];
    if (!versionData) {
      throw new Error(`Version ${versionToGet} not found for template ${id}`);
    }
    
    return versionData.template;
  }
  
  /**
   * Get template metadata by ID
   * 
   * @param id The ID of the template
   * @returns The template metadata
   */
  getTemplateMetadata(id: string): RegisteredTemplate {
    // Check if the template exists
    const template = this.templates[id];
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }
    
    return template;
  }
  
  /**
   * Get all templates
   * 
   * @param options Options for retrieving templates
   * @returns The templates
   */
  getTemplates(options: GetTemplatesOptions = {}): RegisteredTemplate[] {
    let templates = Object.values(this.templates);
    
    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      templates = templates.filter(template => {
        if (!template.tags) return false;
        return options.tags!.some(tag => template.tags!.includes(tag));
      });
    }
    
    // Filter by name
    if (options.nameContains) {
      templates = templates.filter(template => 
        template.name.toLowerCase().includes(options.nameContains!.toLowerCase())
      );
    }
    
    // Sort
    if (options.sortBy) {
      templates.sort((a, b) => {
        const aValue = a[options.sortBy!];
        const bValue = b[options.sortBy!];
        
        if (aValue < bValue) return options.sortDirection === 'desc' ? 1 : -1;
        if (aValue > bValue) return options.sortDirection === 'desc' ? -1 : 1;
        return 0;
      });
    }
    
    // Paginate
    if (options.skip || options.limit) {
      const skip = options.skip || 0;
      const limit = options.limit || templates.length;
      templates = templates.slice(skip, skip + limit);
    }
    
    return templates;
  }
  
  /**
   * Delete a template
   * 
   * @param id The ID of the template
   * @returns True if the template was deleted, false otherwise
   */
  deleteTemplate(id: string): boolean {
    if (!this.templates[id]) {
      return false;
    }
    
    delete this.templates[id];
    return true;
  }
  
  /**
   * Delete a version of a template
   * 
   * @param templateId The ID of the template
   * @param version The version to delete
   * @returns True if the version was deleted, false otherwise
   */
  deleteVersion(templateId: string, version: string): boolean {
    // Check if the template exists
    const template = this.templates[templateId];
    if (!template) {
      return false;
    }
    
    // Check if the version exists
    if (!template.versions[version]) {
      return false;
    }
    
    // Check if it's the current version
    if (template.currentVersion === version) {
      throw new Error(`Cannot delete the current version of a template`);
    }
    
    // Delete the version
    delete template.versions[version];
    
    // Update the template
    template.updatedAt = new Date();
    
    return true;
  }
  
  /**
   * Set the current version of a template
   * 
   * @param templateId The ID of the template
   * @param version The version to set as current
   * @returns The updated template
   */
  setCurrentVersion(templateId: string, version: string): RegisteredTemplate {
    // Check if the template exists
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Check if the version exists
    if (!template.versions[version]) {
      throw new Error(`Version ${version} not found for template ${templateId}`);
    }
    
    // Set the current version
    template.currentVersion = version;
    
    // Update the template
    template.updatedAt = new Date();
    
    return template;
  }
  
  /**
   * Update template metadata
   * 
   * @param templateId The ID of the template
   * @param metadata The metadata to update
   * @returns The updated template
   */
  updateTemplateMetadata(
    templateId: string,
    metadata: {
      name?: string;
      description?: string;
      tags?: string[];
    }
  ): RegisteredTemplate {
    // Check if the template exists
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Update the metadata
    if (metadata.name) template.name = metadata.name;
    if (metadata.description !== undefined) template.description = metadata.description;
    if (metadata.tags !== undefined) template.tags = metadata.tags;
    
    // Update the template
    template.updatedAt = new Date();
    
    return template;
  }
  
  /**
   * Update version metadata
   * 
   * @param templateId The ID of the template
   * @param version The version to update
   * @param metadata The metadata to update
   * @returns The updated template
   */
  updateVersionMetadata(
    templateId: string,
    version: string,
    metadata: {
      author?: string;
      notes?: string;
      metrics?: Record<string, number>;
    }
  ): RegisteredTemplate {
    // Check if the template exists
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Check if the version exists
    const versionData = template.versions[version];
    if (!versionData) {
      throw new Error(`Version ${version} not found for template ${templateId}`);
    }
    
    // Update the metadata
    if (metadata.author !== undefined) versionData.versionInfo.author = metadata.author;
    if (metadata.notes !== undefined) versionData.versionInfo.notes = metadata.notes;
    if (metadata.metrics !== undefined) versionData.versionInfo.metrics = metadata.metrics;
    
    // Update the template
    template.updatedAt = new Date();
    
    return template;
  }
  
  /**
   * Generate a unique ID
   * 
   * @returns A unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Clear all templates
   */
  clear(): void {
    this.templates = {};
  }
}
