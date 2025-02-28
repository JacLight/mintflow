/**
 * Utility functions for the Qdrant plugin
 * @module utils
 */

/**
 * Decodes embeddings from various formats into Float32Array arrays
 * @param embeddingsData - The embeddings data as Buffer, string, or array
 * @returns Array of Float32Array embeddings
 */
export const decodeEmbeddings = (embeddingsData: Buffer | string | any[]): Float32Array[] => {
  let embeddings: string[] | number[][] | number[] | string;
  
  // Convert Buffer to string if needed
  if (Buffer.isBuffer(embeddingsData)) {
    embeddings = embeddingsData.toString('utf-8') as any;
  } else {
    embeddings = embeddingsData as any;
  }
  
  // Parse JSON string if needed
  if (typeof embeddings === 'string' && embeddings[0] === '[') {
    try {
      embeddings = JSON.parse(embeddings);
    } catch {
      // Ignore parsing errors
    }
  }
  
  // Handle single vector case (convert to array of vectors)
  if (
    Array.isArray(embeddings) && 
    (typeof embeddings[0] === 'number' || 
     (typeof embeddings[0] === 'string' && embeddings[0].length === 1))
  ) {
    embeddings = [embeddings] as string[] | number[][];
  }
  
  // Validate embeddings
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('Embeddings must contain at least one element');
  }
  
  // Convert to Float32Array based on input type
  if (typeof embeddings[0] === 'string') {
    // Handle base64 encoded embeddings
    return (embeddings as string[]).map(
      (embedding) => new Float32Array(
        new Uint8Array(Buffer.from(embedding, 'base64')).buffer
      )
    );
  } else {
    // Handle numeric embeddings
    return (embeddings as number[][]).map(
      (embedding) => new Float32Array(embedding)
    );
  }
};

/**
 * Converts filter objects to Qdrant filter format
 * @param filter - The filter object with must and must_not conditions
 * @returns Qdrant filter object
 */
export const convertToFilter = (filter: { 
  must?: Record<string, any>; 
  must_not?: Record<string, any>; 
}): { 
  must: any[]; 
  must_not: any[]; 
} => {
  const result = { 
    must: [] as any[], 
    must_not: [] as any[] 
  };
  
  // Process each filter section (must, must_not)
  for (const section of ['must', 'must_not'] as const) {
    const filterSection = filter[section];
    if (!filterSection) continue;
    
    // Process each condition in the section
    for (const [key, value] of Object.entries(filterSection)) {
      let processedValue = value;
      
      // Try to parse JSON strings
      if (typeof value === 'string' && ['[', '{'].includes(value[0])) {
        try {
          processedValue = JSON.parse(value);
        } catch {
          // Keep original value if parsing fails
        }
      }
      
      // Handle ID filters
      if (['id', 'ids'].includes(key.toLowerCase())) {
        result[section].push({
          has_id: Array.isArray(processedValue) ? processedValue : [processedValue]
        });
        continue;
      }
      
      // Handle array values
      if (Array.isArray(processedValue)) {
        result[section].push({
          key,
          match: { any: processedValue }
        });
        continue;
      }
      
      // Handle regular values
      result[section].push({ 
        key, 
        match: { value: processedValue } 
      });
    }
  }
  
  return result;
};
