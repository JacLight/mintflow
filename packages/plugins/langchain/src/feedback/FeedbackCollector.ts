/**
 * Feedback collector for LLM outputs
 */

/**
 * Feedback source
 */
export type FeedbackSource = 'user' | 'system' | 'model' | 'external';

/**
 * Feedback type
 */
export type FeedbackType = 'rating' | 'comment' | 'correction' | 'preference' | 'comparison';

/**
 * Feedback rating
 */
export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

/**
 * Base feedback interface
 */
export interface BaseFeedback {
  /**
   * The ID of the feedback
   */
  id: string;
  
  /**
   * The ID of the session
   */
  sessionId: string;
  
  /**
   * The ID of the message
   */
  messageId: string;
  
  /**
   * The source of the feedback
   */
  source: FeedbackSource;
  
  /**
   * The type of feedback
   */
  type: FeedbackType;
  
  /**
   * The timestamp of the feedback
   */
  timestamp: Date;
  
  /**
   * The tags associated with the feedback
   */
  tags?: string[];
  
  /**
   * The metadata associated with the feedback
   */
  metadata?: Record<string, any>;
}

/**
 * Rating feedback
 */
export interface RatingFeedback extends BaseFeedback {
  /**
   * The type of feedback
   */
  type: 'rating';
  
  /**
   * The rating value
   */
  rating: FeedbackRating;
  
  /**
   * The aspect being rated
   */
  aspect?: string;
  
  /**
   * The comment associated with the rating
   */
  comment?: string;
}

/**
 * Comment feedback
 */
export interface CommentFeedback extends BaseFeedback {
  /**
   * The type of feedback
   */
  type: 'comment';
  
  /**
   * The comment text
   */
  comment: string;
  
  /**
   * The sentiment of the comment
   */
  sentiment?: 'positive' | 'negative' | 'neutral';
}

/**
 * Correction feedback
 */
export interface CorrectionFeedback extends BaseFeedback {
  /**
   * The type of feedback
   */
  type: 'correction';
  
  /**
   * The original text
   */
  originalText: string;
  
  /**
   * The corrected text
   */
  correctedText: string;
  
  /**
   * The reason for the correction
   */
  reason?: string;
}

/**
 * Preference feedback
 */
export interface PreferenceFeedback extends BaseFeedback {
  /**
   * The type of feedback
   */
  type: 'preference';
  
  /**
   * The preferred option
   */
  preferredOption: string;
  
  /**
   * The options
   */
  options: string[];
  
  /**
   * The reason for the preference
   */
  reason?: string;
}

/**
 * Comparison feedback
 */
export interface ComparisonFeedback extends BaseFeedback {
  /**
   * The type of feedback
   */
  type: 'comparison';
  
  /**
   * The winner of the comparison
   */
  winner: string;
  
  /**
   * The loser of the comparison
   */
  loser: string;
  
  /**
   * The reason for the comparison result
   */
  reason?: string;
}

/**
 * Feedback
 */
export type Feedback = RatingFeedback | CommentFeedback | CorrectionFeedback | PreferenceFeedback | ComparisonFeedback;

/**
 * Feedback storage interface
 */
export interface FeedbackStorage {
  /**
   * Save feedback
   * 
   * @param feedback The feedback to save
   * @returns A promise that resolves when the feedback is saved
   */
  saveFeedback(feedback: Feedback): Promise<void>;
  
  /**
   * Get feedback by ID
   * 
   * @param id The ID of the feedback
   * @returns A promise that resolves with the feedback
   */
  getFeedback(id: string): Promise<Feedback | null>;
  
  /**
   * Get feedback by session ID
   * 
   * @param sessionId The ID of the session
   * @returns A promise that resolves with the feedback
   */
  getFeedbackBySession(sessionId: string): Promise<Feedback[]>;
  
  /**
   * Get feedback by message ID
   * 
   * @param messageId The ID of the message
   * @returns A promise that resolves with the feedback
   */
  getFeedbackByMessage(messageId: string): Promise<Feedback[]>;
  
  /**
   * Delete feedback by ID
   * 
   * @param id The ID of the feedback
   * @returns A promise that resolves when the feedback is deleted
   */
  deleteFeedback(id: string): Promise<void>;
}

/**
 * Memory feedback storage
 */
export class MemoryFeedbackStorage implements FeedbackStorage {
  private feedback: Map<string, Feedback> = new Map();
  private sessionIndex: Map<string, Set<string>> = new Map();
  private messageIndex: Map<string, Set<string>> = new Map();
  
  /**
   * Save feedback
   * 
   * @param feedback The feedback to save
   * @returns A promise that resolves when the feedback is saved
   */
  async saveFeedback(feedback: Feedback): Promise<void> {
    this.feedback.set(feedback.id, feedback);
    
    // Update session index
    if (!this.sessionIndex.has(feedback.sessionId)) {
      this.sessionIndex.set(feedback.sessionId, new Set());
    }
    this.sessionIndex.get(feedback.sessionId)!.add(feedback.id);
    
    // Update message index
    if (!this.messageIndex.has(feedback.messageId)) {
      this.messageIndex.set(feedback.messageId, new Set());
    }
    this.messageIndex.get(feedback.messageId)!.add(feedback.id);
  }
  
  /**
   * Get feedback by ID
   * 
   * @param id The ID of the feedback
   * @returns A promise that resolves with the feedback
   */
  async getFeedback(id: string): Promise<Feedback | null> {
    return this.feedback.get(id) || null;
  }
  
  /**
   * Get feedback by session ID
   * 
   * @param sessionId The ID of the session
   * @returns A promise that resolves with the feedback
   */
  async getFeedbackBySession(sessionId: string): Promise<Feedback[]> {
    const feedbackIds = this.sessionIndex.get(sessionId) || new Set();
    return Array.from(feedbackIds).map(id => this.feedback.get(id)!);
  }
  
  /**
   * Get feedback by message ID
   * 
   * @param messageId The ID of the message
   * @returns A promise that resolves with the feedback
   */
  async getFeedbackByMessage(messageId: string): Promise<Feedback[]> {
    const feedbackIds = this.messageIndex.get(messageId) || new Set();
    return Array.from(feedbackIds).map(id => this.feedback.get(id)!);
  }
  
  /**
   * Delete feedback by ID
   * 
   * @param id The ID of the feedback
   * @returns A promise that resolves when the feedback is deleted
   */
  async deleteFeedback(id: string): Promise<void> {
    const feedback = this.feedback.get(id);
    if (feedback) {
      // Remove from session index
      const sessionFeedback = this.sessionIndex.get(feedback.sessionId);
      if (sessionFeedback) {
        sessionFeedback.delete(id);
      }
      
      // Remove from message index
      const messageFeedback = this.messageIndex.get(feedback.messageId);
      if (messageFeedback) {
        messageFeedback.delete(id);
      }
      
      // Remove from feedback map
      this.feedback.delete(id);
    }
  }
}

/**
 * Feedback collector options
 */
export interface FeedbackCollectorOptions {
  /**
   * The storage to use for feedback
   */
  storage?: FeedbackStorage;
  
  /**
   * The default source for feedback
   */
  defaultSource?: FeedbackSource;
  
  /**
   * Whether to automatically generate IDs for feedback
   */
  autoGenerateIds?: boolean;
  
  /**
   * The callback to call when feedback is collected
   */
  onFeedback?: (feedback: Feedback) => void;
}

/**
 * Feedback collector for LLM outputs
 */
export class FeedbackCollector {
  private storage: FeedbackStorage;
  private defaultSource: FeedbackSource;
  private autoGenerateIds: boolean;
  private onFeedback?: (feedback: Feedback) => void;
  
  /**
   * Create a new feedback collector
   * 
   * @param options The options for the feedback collector
   */
  constructor(options: FeedbackCollectorOptions = {}) {
    this.storage = options.storage || new MemoryFeedbackStorage();
    this.defaultSource = options.defaultSource || 'user';
    this.autoGenerateIds = options.autoGenerateIds !== false;
    this.onFeedback = options.onFeedback;
  }
  
  /**
   * Generate a unique ID
   * 
   * @returns A unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Collect rating feedback
   * 
   * @param sessionId The ID of the session
   * @param messageId The ID of the message
   * @param rating The rating value
   * @param options Additional options
   * @returns A promise that resolves with the feedback
   */
  async collectRating(
    sessionId: string,
    messageId: string,
    rating: FeedbackRating,
    options: {
      id?: string;
      source?: FeedbackSource;
      aspect?: string;
      comment?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<RatingFeedback> {
    const feedback: RatingFeedback = {
      id: options.id || (this.autoGenerateIds ? this.generateId() : ''),
      sessionId,
      messageId,
      source: options.source || this.defaultSource,
      type: 'rating',
      timestamp: new Date(),
      rating,
      aspect: options.aspect,
      comment: options.comment,
      tags: options.tags,
      metadata: options.metadata
    };
    
    await this.storage.saveFeedback(feedback);
    
    if (this.onFeedback) {
      this.onFeedback(feedback);
    }
    
    return feedback;
  }
  
  /**
   * Collect comment feedback
   * 
   * @param sessionId The ID of the session
   * @param messageId The ID of the message
   * @param comment The comment text
   * @param options Additional options
   * @returns A promise that resolves with the feedback
   */
  async collectComment(
    sessionId: string,
    messageId: string,
    comment: string,
    options: {
      id?: string;
      source?: FeedbackSource;
      sentiment?: 'positive' | 'negative' | 'neutral';
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<CommentFeedback> {
    const feedback: CommentFeedback = {
      id: options.id || (this.autoGenerateIds ? this.generateId() : ''),
      sessionId,
      messageId,
      source: options.source || this.defaultSource,
      type: 'comment',
      timestamp: new Date(),
      comment,
      sentiment: options.sentiment,
      tags: options.tags,
      metadata: options.metadata
    };
    
    await this.storage.saveFeedback(feedback);
    
    if (this.onFeedback) {
      this.onFeedback(feedback);
    }
    
    return feedback;
  }
  
  /**
   * Collect correction feedback
   * 
   * @param sessionId The ID of the session
   * @param messageId The ID of the message
   * @param originalText The original text
   * @param correctedText The corrected text
   * @param options Additional options
   * @returns A promise that resolves with the feedback
   */
  async collectCorrection(
    sessionId: string,
    messageId: string,
    originalText: string,
    correctedText: string,
    options: {
      id?: string;
      source?: FeedbackSource;
      reason?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<CorrectionFeedback> {
    const feedback: CorrectionFeedback = {
      id: options.id || (this.autoGenerateIds ? this.generateId() : ''),
      sessionId,
      messageId,
      source: options.source || this.defaultSource,
      type: 'correction',
      timestamp: new Date(),
      originalText,
      correctedText,
      reason: options.reason,
      tags: options.tags,
      metadata: options.metadata
    };
    
    await this.storage.saveFeedback(feedback);
    
    if (this.onFeedback) {
      this.onFeedback(feedback);
    }
    
    return feedback;
  }
  
  /**
   * Collect preference feedback
   * 
   * @param sessionId The ID of the session
   * @param messageId The ID of the message
   * @param preferredOption The preferred option
   * @param options The options
   * @param additionalOptions Additional options
   * @returns A promise that resolves with the feedback
   */
  async collectPreference(
    sessionId: string,
    messageId: string,
    preferredOption: string,
    options: string[],
    additionalOptions: {
      id?: string;
      source?: FeedbackSource;
      reason?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<PreferenceFeedback> {
    const feedback: PreferenceFeedback = {
      id: additionalOptions.id || (this.autoGenerateIds ? this.generateId() : ''),
      sessionId,
      messageId,
      source: additionalOptions.source || this.defaultSource,
      type: 'preference',
      timestamp: new Date(),
      preferredOption,
      options,
      reason: additionalOptions.reason,
      tags: additionalOptions.tags,
      metadata: additionalOptions.metadata
    };
    
    await this.storage.saveFeedback(feedback);
    
    if (this.onFeedback) {
      this.onFeedback(feedback);
    }
    
    return feedback;
  }
  
  /**
   * Collect comparison feedback
   * 
   * @param sessionId The ID of the session
   * @param messageId The ID of the message
   * @param winner The winner of the comparison
   * @param loser The loser of the comparison
   * @param options Additional options
   * @returns A promise that resolves with the feedback
   */
  async collectComparison(
    sessionId: string,
    messageId: string,
    winner: string,
    loser: string,
    options: {
      id?: string;
      source?: FeedbackSource;
      reason?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<ComparisonFeedback> {
    const feedback: ComparisonFeedback = {
      id: options.id || (this.autoGenerateIds ? this.generateId() : ''),
      sessionId,
      messageId,
      source: options.source || this.defaultSource,
      type: 'comparison',
      timestamp: new Date(),
      winner,
      loser,
      reason: options.reason,
      tags: options.tags,
      metadata: options.metadata
    };
    
    await this.storage.saveFeedback(feedback);
    
    if (this.onFeedback) {
      this.onFeedback(feedback);
    }
    
    return feedback;
  }
  
  /**
   * Get feedback by ID
   * 
   * @param id The ID of the feedback
   * @returns A promise that resolves with the feedback
   */
  async getFeedback(id: string): Promise<Feedback | null> {
    return this.storage.getFeedback(id);
  }
  
  /**
   * Get feedback by session ID
   * 
   * @param sessionId The ID of the session
   * @returns A promise that resolves with the feedback
   */
  async getFeedbackBySession(sessionId: string): Promise<Feedback[]> {
    return this.storage.getFeedbackBySession(sessionId);
  }
  
  /**
   * Get feedback by message ID
   * 
   * @param messageId The ID of the message
   * @returns A promise that resolves with the feedback
   */
  async getFeedbackByMessage(messageId: string): Promise<Feedback[]> {
    return this.storage.getFeedbackByMessage(messageId);
  }
  
  /**
   * Delete feedback by ID
   * 
   * @param id The ID of the feedback
   * @returns A promise that resolves when the feedback is deleted
   */
  async deleteFeedback(id: string): Promise<void> {
    return this.storage.deleteFeedback(id);
  }
}
