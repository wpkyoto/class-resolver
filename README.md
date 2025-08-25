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
interface ResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> {
  supports(type: TType): boolean;
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

### Advanced Type Support

You can now use any type for the `supports` method, not just strings. This is particularly useful for handling complex objects like Stripe events:

```typescript
// Define a complex event type
interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      amount: number;
    };
  };
}

// Create handlers for specific event types
class PaymentEventHandler implements ResolveTarget<[StripeEvent], string, StripeEvent> {
  supports(event: StripeEvent): boolean {
    return event.type === 'payment_intent.succeeded';
  }
  
  handle(event: StripeEvent): string {
    return `Payment succeeded: ${event.data.object.amount}`;
  }
}

class RefundEventHandler implements ResolveTarget<[StripeEvent], string, StripeEvent> {
  supports(event: StripeEvent): boolean {
    return event.type === 'charge.refunded';
  }
  
  handle(event: StripeEvent): string {
    return `Refund processed: ${event.data.object.amount}`;
  }
}

// Create a resolver that handles StripeEvent types
const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
  new PaymentEventHandler(),
  new RefundEventHandler()
);

// Handle different event types
const paymentEvent: StripeEvent = {
  id: 'evt_123',
  type: 'payment_intent.succeeded',
  data: { object: { id: 'pi_123', amount: 1000 } }
};

const handler = resolver.resolve(paymentEvent);
console.log(handler.handle(paymentEvent)); // Output: Payment succeeded: 1000
```

This advanced type support allows you to:
- Use complex objects as type identifiers instead of simple strings
- Maintain full type safety throughout the resolution process
- Handle domain-specific objects like Stripe events, database records, or custom business objects
- Create more expressive and type-safe event handling systems

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
   interface ResolveTarget<TArgs extends any[] = any[], TReturn = any, TType = string> {
     supports(type: TType): boolean;
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
   class Resolver<TBase extends ResolveTarget<any[], any, any> = ResolveTarget<any[], any, any>, TType = string> {
     // ...
   }
   ```

3. **New in 2.0.0**: You can now specify custom types for the `supports` method:
   ```typescript
   // Use custom types instead of strings
   interface CustomEvent {
     type: string;
     data: any;
   }
   
   class CustomHandler implements ResolveTarget<[CustomEvent], string, CustomEvent> {
     supports(event: CustomEvent): boolean {
       return event.type === 'custom-type';
     }
     
     handle(event: CustomEvent): string {
       return `Handled: ${event.type}`;
     }
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