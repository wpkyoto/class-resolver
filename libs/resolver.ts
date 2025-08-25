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
  public addUpdater(updater: TBase): void {
    this.updaters.push(updater);
  }

  /**
   * Resolves a resolver target for the specified type
   * @param type Type to resolve
   * @returns Resolved resolver target
   * @throws {Error} When no resolver targets are registered
   * @throws {Error} When no resolver target supporting the specified type is found
   */
  public resolve(type: TType): TBase {
    if (this.updaters.length < 1) {
      throw new Error('Unassigned resolve target.');
    }
    
    const target = this.updaters.find(updater => updater.supports(type));
    
    if (!target) {
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