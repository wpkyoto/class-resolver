# Class Resolver Example

This directory contains examples of using the class-resolver library.

## Setup

```bash
# Install dependencies
npm install

# Run build
npm run build

# Run tests
npm test
```

## JavaScript Example

The `index.js` file contains basic usage examples in JavaScript.

```bash
node index.js
```

## TypeScript Example

The `libs/index.ts` file contains examples of using TypeScript. From v2.0.0, it supports generics for improved type safety.

### New Features in v2.0.0

- Improved type safety with generics
- `ResolveTarget<TArgs, TReturn>` interface allows specifying argument and return value types
- `Resolver<TBase>` class allows specifying the type of targets to handle

### TypeScript Example

```typescript
import Resolver, { ResolveTarget } from 'class-resolver';

// Using generics to specify argument and return value types
class StringFormatter implements ResolveTarget<[string], string> {
  supports(type: string): boolean {
    return type === 'string-format';
  }
  
  handle(input: string): string {
    return input.toUpperCase();
  }
}

// Specifying type parameters for Resolver as well
const resolver = new Resolver<ResolveTarget<[string], string>>(new StringFormatter());
const formatter = resolver.resolve('string-format');
const result = formatter.handle('hello'); // result is typed as string
console.log(result); // "HELLO"
```

## Notes

- JavaScript users can continue to use existing code without changes
- TypeScript users can leverage generics to improve type safety

## Test Results

```bash
$ npm test

> example@1.0.0 test
> npm run build && node dist/index.js && node index.js

> example@1.0.0 build
> tsc

test2
hoge
fuga
Error: Unsupported type: xxx
```