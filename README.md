# Simple Class resolver

A lightweight TypeScript/JavaScript library for implementing the Chain of Responsibility pattern with class-based resolvers.

## Features

- Simple and intuitive API for handling different types of requests
- Type-safe implementation with TypeScript support
- Flexible resolver registration (constructor, setUpdaters, addUpdater)
- Support for multiple resolvers with different handling logic
- Clear error handling for unsupported types
- Generic type support for better type safety

## Installation

```bash
npm install class-resolver
# or
yarn add class-resolver
```

## Basic Usage

```typescript
const Resolver = require('class-resolver')

class ExampleClass {
  supports(type) {
    return type === 'hoge'
  }
  handle() {
    return 'hoge'
  }
}
class ExampleClass2 {
  supports(type) {
    return type === 'fuga'
  }
  handle() {
    return 'fuga'
  }
}

const resolver = new Resolver(new ExampleClass(), new ExampleClass2())
const c = resolver.resolve('hoge')
console.log(c.handle()) // Output: hoge

const c2 = resolver.resolve('fuga')
console.log(c2.handle()) // Output: fuga

try {
  resolver.resolve('xxx') // This will throw an error
} catch (e) {
  console.log(e) // Error: Unsupported type: xxx
}
```

## Advanced Usage

### With TypeScript and Parameters

```typescript
import Resolver from 'class-resolver';
import { ResolveTarget } from 'class-resolver';

// Using generics for better type safety
class MessageFormatter implements ResolveTarget<[string, number], string> {
  supports(type: string): boolean {
    return type === 'greeting'
  }
  
  handle(name: string, count: number): string {
    return `Hello ${name}, this is message #${count}!`
  }
}

class ErrorFormatter implements ResolveTarget<[string, number], string> {
  supports(type: string): boolean {
    return type === 'error'
  }
  
  handle(message: string, code: number): string {
    return `Error ${code}: ${message}`
  }
}

// Specify the generic type for better type safety
const resolver = new Resolver<ResolveTarget<[string, number], string>>(
  new MessageFormatter(), 
  new ErrorFormatter()
)

// Using the greeting formatter
const greeting = resolver.resolve('greeting')
console.log(greeting.handle('John', 1)) // Output: Hello John, this is message #1!

// Using the error formatter
const error = resolver.resolve('error')
console.log(error.handle('Not Found', 404)) // Output: Error 404: Not Found
```

### Dynamic Resolver Registration

```typescript
// Specify the generic type for better type safety
const resolver = new Resolver<ResolveTarget<[string, number], string>>()

// Add resolvers after initialization
resolver.setUpdaters(new MessageFormatter(), new ErrorFormatter())

// Or add them one by one
resolver.addUpdater(new MessageFormatter())
resolver.addUpdater(new ErrorFormatter())
```

## Generic Type Support

From version 2.0.0, class-resolver supports generic types for better type safety:

```typescript
// Define the interface with generics
interface ResolveTarget<TArgs extends any[] = any[], TReturn = any> {
  supports(type: string): boolean;
  handle(...args: TArgs): TReturn;
}

// Define a class that implements the interface with specific types
class StringFormatter implements ResolveTarget<[string], string> {
  supports(type: string): boolean {
    return type === 'string-format';
  }
  
  handle(input: string): string {
    return input.toUpperCase();
  }
}

// Create a resolver with the specific type
const resolver = new Resolver<ResolveTarget<[string], string>>(new StringFormatter());
const formatter = resolver.resolve('string-format');
const result = formatter.handle('hello'); // result is typed as string
```

## Use Cases

1. **Command Pattern Implementation**: Handle different types of commands with specific handlers
2. **Format Conversion**: Convert data between different formats based on type
3. **Request Processing**: Process different types of requests with dedicated handlers
4. **Plugin System**: Implement a plugin system where different plugins handle specific types of operations
5. **Message Formatting**: Format different types of messages with specific formatters

## Error Handling

The resolver will throw errors in the following cases:
- When no resolvers are registered: `"Unasigned resolve target."`
- When trying to resolve an unsupported type: `"Unsupported type: xxx"`

## Upgrade Guide

### Upgrading from 1.x to 2.0.0

Version 2.0.0 introduces generic type support for better type safety. This change is backward compatible for JavaScript users, but TypeScript users may need to update their code.

#### Changes for TypeScript Users

1. The `ResolveTarget` interface now supports generics:
   ```typescript
   // Before (1.x)
   interface ResolveTarget {
     supports(type: string): boolean;
     handle(...args: any[]): any;
   }
   
   // After (2.0.0)
   interface ResolveTarget<TArgs extends any[] = any[], TReturn = any> {
     supports(type: string): boolean;
     handle(...args: TArgs): TReturn;
   }
   ```

2. The `Resolver` class now supports generics:
   ```typescript
   // Before (1.x)
   class Resolver {
     // ...
   }
   
   // After (2.0.0)
   class Resolver<TBase extends ResolveTarget = ResolveTarget> {
     // ...
   }
   ```

#### Migration Steps

1. If you're using TypeScript with default `any` types, your code should continue to work without changes.

2. To take advantage of the improved type safety, update your class implementations:
   ```typescript
   // Before (1.x)
   class MyHandler implements ResolveTarget {
     supports(type: string): boolean {
       return type === 'my-type';
     }
     handle(name: string): string {
       return `Hello ${name}`;
     }
   }
   
   // After (2.0.0)
   class MyHandler implements ResolveTarget<[string], string> {
     supports(type: string): boolean {
       return type === 'my-type';
     }
     handle(name: string): string {
       return `Hello ${name}`;
     }
   }
   ```

3. When creating a new Resolver, specify the generic type:
   ```typescript
   // Before (1.x)
   const resolver = new Resolver(new MyHandler());
   
   // After (2.0.0)
   const resolver = new Resolver<ResolveTarget<[string], string>>(new MyHandler());
   ```

4. If you have mixed handler types, you can use a union type or keep using the default `any` type:
   ```typescript
   // Using union type
   type MyHandlers = ResolveTarget<[string], string> | ResolveTarget<[number], boolean>;
   const resolver = new Resolver<MyHandlers>(new StringHandler(), new NumberHandler());
   
   // Or keep using the default any type
   const resolver = new Resolver(new StringHandler(), new NumberHandler());
   ```

## Contributing

```bash
$ npm install
$ git checkout -b YOUR_TOPIC_BRANCH
$ npm test
$ npm run build
$ git add ./
$ git commit -m "YOUR UPDATE DESCRIPTION"
$ git push YOUR_ORIGIN YOUR_TOPIC_BRANCH
```

## License

MIT