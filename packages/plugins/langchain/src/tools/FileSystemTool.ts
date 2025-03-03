import { BaseTool } from './Tool.js';

/**
 * Options for FileSystemTool
 */
export interface FileSystemToolOptions {
  /**
   * The root directory to operate in
   * All file operations will be relative to this directory
   */
  rootDir: string;
  
  /**
   * Optional list of allowed operations
   * If not provided, all operations are allowed
   */
  allowedOperations?: Array<'read' | 'write' | 'list' | 'exists' | 'delete'>;
  
  /**
   * Optional list of allowed file extensions
   * If not provided, all file extensions are allowed
   */
  allowedExtensions?: string[];
  
  /**
   * Optional callback to call before executing a file operation
   */
  onOperation?: (operation: string, path: string) => void;
  
  /**
   * Optional callback to call after executing a file operation
   */
  onResult?: (operation: string, path: string, result: any) => void;
  
  /**
   * Optional flag to allow operations outside the root directory
   * Default is false for security
   */
  allowOutsideRoot?: boolean;
}

/**
 * A tool that performs file system operations
 */
export class FileSystemTool extends BaseTool {
  private rootDir: string;
  private allowedOperations: Array<'read' | 'write' | 'list' | 'exists' | 'delete'>;
  private allowedExtensions: string[];
  private onOperation?: (operation: string, path: string) => void;
  private onResult?: (operation: string, path: string, result: any) => void;
  private allowOutsideRoot: boolean;
  
  /**
   * Create a new FileSystemTool
   * 
   * @param options Options for the tool
   */
  constructor(options: FileSystemToolOptions) {
    super(
      'file_system',
      'Perform file system operations. Use this when you need to read, write, list, check existence, or delete files.',
      {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            description: 'The operation to perform: read, write, list, exists, or delete'
          },
          path: {
            type: 'string',
            description: 'The path to the file or directory, relative to the root directory'
          },
          content: {
            type: 'string',
            description: 'The content to write to the file (only for write operation)'
          }
        },
        required: ['operation', 'path']
      }
    );
    
    this.rootDir = options.rootDir;
    this.allowedOperations = options.allowedOperations || ['read', 'write', 'list', 'exists', 'delete'];
    this.allowedExtensions = options.allowedExtensions || [];
    this.onOperation = options.onOperation;
    this.onResult = options.onResult;
    this.allowOutsideRoot = options.allowOutsideRoot || false;
  }
  
  /**
   * Execute the tool with the given input
   * 
   * @param input The input for the file system operation
   * @returns The result of the operation
   */
  async execute(input: string): Promise<string> {
    try {
      // Parse the input as JSON
      const parsedInput = JSON.parse(input);
      
      // Extract the operation and path
      const { operation, path, content } = parsedInput;
      
      // Validate the operation
      if (!operation || !this.allowedOperations.includes(operation)) {
        return `Error: Operation "${operation}" is not allowed. Allowed operations are: ${this.allowedOperations.join(', ')}`;
      }
      
      // Validate the path
      if (!path) {
        return 'Error: Path is required';
      }
      
      // Validate the path is within the root directory
      if (!this.allowOutsideRoot && !this.isPathWithinRoot(path)) {
        return 'Error: Path must be within the root directory';
      }
      
      // Validate the file extension if allowed extensions are specified
      if (this.allowedExtensions.length > 0 && !this.hasAllowedExtension(path)) {
        return `Error: File extension is not allowed. Allowed extensions are: ${this.allowedExtensions.join(', ')}`;
      }
      
      // Call the onOperation callback if provided
      if (this.onOperation) {
        this.onOperation(operation, path);
      }
      
      // Perform the operation
      const result = await this.performOperation(operation, path, content);
      
      // Call the onResult callback if provided
      if (this.onResult) {
        this.onResult(operation, path, result);
      }
      
      // Return the result
      return result;
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  /**
   * Check if a path is within the root directory
   * 
   * @param path The path to check
   * @returns Whether the path is within the root directory
   */
  private isPathWithinRoot(path: string): boolean {
    // Normalize the path to prevent directory traversal attacks
    const normalizedPath = this.normalizePath(path);
    
    // Check if the path starts with the root directory
    return !normalizedPath.startsWith('..');
  }
  
  /**
   * Normalize a path to prevent directory traversal attacks
   * 
   * @param path The path to normalize
   * @returns The normalized path
   */
  private normalizePath(path: string): string {
    // Remove leading and trailing slashes
    let normalizedPath = path.replace(/^\/+|\/+$/g, '');
    
    // Split the path into components
    const components = normalizedPath.split('/');
    
    // Process each component
    const result: string[] = [];
    for (const component of components) {
      if (component === '..') {
        // Go up one directory
        result.pop();
      } else if (component !== '.' && component !== '') {
        // Add the component to the result
        result.push(component);
      }
    }
    
    // Join the components back together
    return result.join('/');
  }
  
  /**
   * Check if a path has an allowed file extension
   * 
   * @param path The path to check
   * @returns Whether the path has an allowed file extension
   */
  private hasAllowedExtension(path: string): boolean {
    // If no allowed extensions are specified, all extensions are allowed
    if (this.allowedExtensions.length === 0) {
      return true;
    }
    
    // Get the file extension
    const extension = path.split('.').pop() || '';
    
    // Check if the extension is allowed
    return this.allowedExtensions.includes(extension);
  }
  
  /**
   * Perform a file system operation
   * 
   * @param operation The operation to perform
   * @param path The path to the file or directory
   * @param content The content to write to the file (only for write operation)
   * @returns The result of the operation
   */
  private async performOperation(operation: string, path: string, content?: string): Promise<string> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Get the full path
    const fullPath = `${this.rootDir}/${normalizedPath}`;
    
    // In a real implementation, this would perform actual file system operations
    // For now, we'll simulate the operations with mock results
    
    // Simulate operation delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Perform the operation
    switch (operation) {
      case 'read':
        return `Simulated file content for ${fullPath}. In a real implementation, this would be the actual content of the file.`;
      
      case 'write':
        if (!content) {
          return 'Error: Content is required for write operation';
        }
        return `Successfully wrote ${content.length} characters to ${fullPath}`;
      
      case 'list':
        return `Simulated directory listing for ${fullPath}:\n- file1.txt\n- file2.txt\n- directory1/\n- directory2/`;
      
      case 'exists':
        return `File ${fullPath} exists: true`;
      
      case 'delete':
        return `Successfully deleted ${fullPath}`;
      
      default:
        return `Unknown operation: ${operation}`;
    }
  }
}

/**
 * Factory for creating FileSystemTool instances
 */
export class FileSystemToolFactory {
  /**
   * Create a new FileSystemTool
   * 
   * @param options Options for the tool
   * @returns A new FileSystemTool instance
   */
  static create(options: FileSystemToolOptions): FileSystemTool {
    return new FileSystemTool(options);
  }
  
  /**
   * Create a new FileSystemTool with read-only access
   * 
   * @param rootDir The root directory to operate in
   * @returns A new FileSystemTool instance with read-only access
   */
  static readOnly(rootDir: string): FileSystemTool {
    return new FileSystemTool({
      rootDir,
      allowedOperations: ['read', 'list', 'exists']
    });
  }
  
  /**
   * Create a new FileSystemTool with restricted file types
   * 
   * @param rootDir The root directory to operate in
   * @param allowedExtensions The allowed file extensions
   * @returns A new FileSystemTool instance with restricted file types
   */
  static restrictedTypes(rootDir: string, allowedExtensions: string[]): FileSystemTool {
    return new FileSystemTool({
      rootDir,
      allowedExtensions
    });
  }
}
