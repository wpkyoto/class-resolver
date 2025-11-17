/**
 * Interface that classes which are targets for the resolver should implement
 */
export interface ResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> {
  /**
   * Determines whether the specified type is supported
   * @param type The type to check for support
   * @returns true if supported, false otherwise
   */
  supports(type: TType): boolean;

  /**
   * Handles the request
   * @param args Arguments needed for processing
   * @returns Processing result
   */
  handle(...args: TArgs): TReturn;
}

// Maintain namespace for backward compatibility
export namespace interfaces {
  export interface ResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> {
    supports(type: TType): boolean;
    handle(...args: TArgs): TReturn;
  }
}
