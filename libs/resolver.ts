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
   * Gets the priority of a handler
   * @param handler The handler to get priority for
   * @returns Priority value (0 if not defined)
   * @private
   */
  private getPriority(handler: TBase): number {
    return 'priority' in handler && typeof (handler as any).priority === 'number'
      ? (handler as any).priority
      : 0;
  }

  /**
   * Sorts handlers by priority (highest first), maintaining registration order for equal priorities
   * @param handlers Array of handlers to sort
   * @returns Sorted array of handlers
   * @private
   */
  private sortByPriority(handlers: TBase[]): TBase[] {
    return [...handlers].sort((a, b) => {
      const priorityA = this.getPriority(a);
      const priorityB = this.getPriority(b);
      return priorityB - priorityA; // Higher priority first
    });
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

    // Get all matching handlers and sort by priority
    const matchingHandlers = this.updaters.filter(updater => updater.supports(type));
    const sortedHandlers = this.sortByPriority(matchingHandlers);
    const target = sortedHandlers[0];

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

  /**
   * Resolves all resolver targets for the specified type
   * @param type Type to resolve
   * @returns Array of all matching resolver targets sorted by priority (highest first)
   * @throws {Error} When no resolver targets are registered
   */
  public resolveAll(type: TType): TBase[] {
    if (this.updaters.length < 1) {
      throw new Error('Unassigned resolve target.');
    }

    const targets = this.updaters.filter(updater => updater.supports(type));

    if (targets.length === 0) {
      // If fallback handler is set, return it as a single-element array
      if (this.fallbackHandler) {
        return [{
          supports: () => true,
          handle: this.fallbackHandler
        } as unknown as TBase];
      }

      // Return empty array if no handlers match
      return [];
    }

    // Sort by priority (highest first)
    return this.sortByPriority(targets);
  }

  /**
   * Executes all matching handlers for the specified type
   * @param type Type to resolve
   * @param args Arguments to pass to the handlers
   * @returns Array of results from all matching handlers
   * @throws {Error} When no resolver targets are registered
   */
  public handleAll(type: TType, ...args: Parameters<TBase['handle']>): ReturnType<TBase['handle']>[] {
    const targets = this.resolveAll(type);
    return targets.map(target => target.handle(...args));
  }

  /**
   * Executes all matching async handlers in parallel for the specified type
   * @param type Type to resolve
   * @param args Arguments to pass to the handlers
   * @returns Promise that resolves to array of results from all matching handlers
   * @throws {Error} When no resolver targets are registered
   */
  public async handleAllAsync(
    type: TType,
    ...args: Parameters<TBase['handle']>
  ): Promise<Awaited<ReturnType<TBase['handle']>>[]> {
    const targets = this.resolveAll(type);
    const promises = targets.map(target => target.handle(...args));
    return Promise.all(promises);
  }

  /**
   * Executes all matching async handlers sequentially for the specified type
   * Stops on first error
   * @param type Type to resolve
   * @param args Arguments to pass to the handlers
   * @returns Promise that resolves to array of results from all matching handlers
   * @throws {Error} When no resolver targets are registered
   * @throws {Error} When any handler throws an error
   */
  public async handleAllSequential(
    type: TType,
    ...args: Parameters<TBase['handle']>
  ): Promise<Awaited<ReturnType<TBase['handle']>>[]> {
    const targets = this.resolveAll(type);
    const results: Awaited<ReturnType<TBase['handle']>>[] = [];

    for (const target of targets) {
      const result = await target.handle(...args);
      results.push(result);
    }

    return results;
  }
}

export default Resolver;