# Simple Class resolver

A lightweight TypeScript/JavaScript library for implementing the Chain of Responsibility pattern with class-based resolvers.

## Features

- Simple and intuitive API for handling different types of requests
- Type-safe implementation with TypeScript support
- Flexible resolver registration (constructor, setUpdaters, addUpdater)
- Support for multiple resolvers with different handling logic
- Clear error handling for unsupported types

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

class MessageFormatter implements ResolveTarget {
  supports(type: string): boolean {
    return type === 'greeting'
  }
  
  handle(name: string, count: number): string {
    return `Hello ${name}, this is message #${count}!`
  }
}

class ErrorFormatter implements ResolveTarget {
  supports(type: string): boolean {
    return type === 'error'
  }
  
  handle(message: string, code: number): string {
    return `Error ${code}: ${message}`
  }
}

const resolver = new Resolver(new MessageFormatter(), new ErrorFormatter())

// Using the greeting formatter
const greeting = resolver.resolve('greeting')
console.log(greeting.handle('John', 1)) // Output: Hello John, this is message #1!

// Using the error formatter
const error = resolver.resolve('error')
console.log(error.handle('Not Found', 404)) // Output: Error 404: Not Found
```

### Dynamic Resolver Registration

```typescript
const resolver = new Resolver()

// Add resolvers after initialization
resolver.setUpdaters(new MessageFormatter(), new ErrorFormatter())

// Or add them one by one
resolver.addUpdater(new MessageFormatter())
resolver.addUpdater(new ErrorFormatter())
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