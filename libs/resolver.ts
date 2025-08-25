import { ResolveTarget } from './interface'

/**
 * Resolver class implementing the Chain of Responsibility pattern
 * Resolves handlers for specific types
 */
class Resolver<TBase extends ResolveTarget<any[], any, any> = ResolveTarget<any[], any, any>, TType = string> {
  /**
   * Array of registered resolver targets
   * @private
   */
  private updaters: TBase[] = [];

  /**
   * Fallback handler function
   * @private
   */
  private fallbackHandler?: (...args: Parameters<TBase['handle']>) => ReturnType<TBase['handle']>;

  /**
   * Initializes the resolver
   * @param args Initial resolver targets
   */
  constructor(...args: TBase[]) {
    if (args.length > 0) {
      this.set(args);
    }
  }

  /**
   * Processes an array of arguments
   * @param args Array of resolver targets
   * @returns Processed array
   * @private
   */
  private getArgs(args: TBase[]): TBase[] {
    return [...args];
  }

  /**
   * Sets resolver targets
   * @param updaters Array of resolver targets
   */
  public set(updaters: TBase[]): void {
    this.updaters = updaters;
  }

  /**
   * Sets resolver targets (variadic version)
   * @param args Resolver targets
   */
  public setUpdaters(...args: TBase[]): void {
    this.set(this.getArgs(args));
  }

  /**
   * Adds a resolver target
   * @param updater Resolver target to add
   */
  public addUpdater(updater: TBase): this {
    this.updaters.push(updater);
    return this;
  }

  /**
   * Sets a fallback handler for unsupported types
   * @param handler Fallback handler function
   * @returns This resolver instance for method chaining
   */
  public setFallbackHandler(
    handler: (...args: Parameters<TBase['handle']>) => ReturnType<TBase['handle']>
  ): this {
    this.fallbackHandler = handler;
    return this;
  }

  /**
   * Resolves a resolver target for the specified type
   * @param type Type to resolve
   * @returns Resolved resolver target
   * @throws {Error} When no resolver targets are registered
   * @throws {Error} When no resolver target supporting the specified type is found and no fallback is set
   */
  public resolve(type: TType): TBase {
    if (this.updaters.length < 1) {
      throw new Error('Unassigned resolve target.');
    }
    
    const target = this.updaters.find(updater => updater.supports(type));
    
    if (!target) {
      // If fallback handler is set, create a temporary target that uses it
      if (this.fallbackHandler) {
        return {
          supports: () => true,
          handle: this.fallbackHandler
        } as unknown as TBase;
      }
      
      // Determine the string representation of the unsupported type
      // If it's a non-null object, use JSON.stringify for detailed output
      // Otherwise, use String() for basic conversion
      const typeString = typeof type === 'object' && type !== null ? JSON.stringify(type) : String(type);
      throw new Error(`Unsupported type: ${typeString}`);
    }
    
    return target;
  }
}

export default Resolver;