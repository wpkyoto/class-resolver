/**
 * Base interface for type matching
 * Extracted to reduce code duplication across sync and async targets
 */
export interface SupportsType<TType = string> {
  /**
   * Determines whether the specified type is supported
   * @param type The type to check for support
   * @returns true if supported, false otherwise
   */
  supports(type: TType): boolean
}

/**
 * Interface for prioritized handlers
 * Higher priority values are executed first
 */
export interface HasPriority {
  /**
   * Priority for this handler (higher values execute first)
   * Default is 0 if not specified
   */
  priority?: number
}

/**
 * Interface that classes which are targets for the resolver should implement
 */
export interface ResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> extends SupportsType<TType> {
  /**
   * Handles the request
   * @param args Arguments needed for processing
   * @returns Processing result
   */
  handle(...args: TArgs): TReturn
}

/**
 * Interface for resolver targets with priority support
 * Higher priority values are executed first
 */
export interface PrioritizedResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> extends ResolveTarget<TArgs, TReturn, TType>, HasPriority {}

/**
 * Interface for async resolver targets
 * Handle method returns a Promise
 */
export interface AsyncResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> extends SupportsType<TType> {
  /**
   * Handles the request asynchronously
   * @param args Arguments needed for processing
   * @returns Promise with processing result
   */
  handle(...args: TArgs): Promise<TReturn>
}

/**
 * Interface for async resolver targets with priority support
 * Higher priority values are executed first
 */
export interface PrioritizedAsyncResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> extends AsyncResolveTarget<TArgs, TReturn, TType>, HasPriority {}

// Maintain namespace for backward compatibility
export namespace interfaces {
  export interface ResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> {
    supports(type: TType): boolean
    handle(...args: TArgs): TReturn
  }

  export interface PrioritizedResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> extends ResolveTarget<TArgs, TReturn, TType> {
    priority?: number
  }

  export interface AsyncResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> {
    supports(type: TType): boolean
    handle(...args: TArgs): Promise<TReturn>
  }

  export interface PrioritizedAsyncResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> extends AsyncResolveTarget<TArgs, TReturn, TType> {
    priority?: number
  }
}
