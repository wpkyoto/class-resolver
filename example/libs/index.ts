import Resolver, { type ResolveTarget } from '../../dist/index';

// Using generics to specify return value type
class Test implements ResolveTarget<[], string> {
  supports(str: string): boolean {
    return false;
  }
  handle(): string {
    return 'test';
  }
}

// Using generics to specify return value type
class Test2 implements ResolveTarget<[], string> {
  supports(str: string): boolean {
    return true;
  }
  handle(): string {
    return 'test2';
  }
}

// Specifying type parameters for Resolver
const r = new Resolver<ResolveTarget<[], string>>(new Test(), new Test2());

const t = r.resolve('test');
// Type-safe return value
const result: string = t.handle();
console.log(result);
