const Resolver = require('class-resolver')

// v2.0.0 supports generics, but type information is ignored in JavaScript
// Therefore, existing JavaScript code works without changes
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

// The usage of Resolver remains the same
const resolver = new Resolver(new ExampleClass(), new ExampleClass2())
const c = resolver.resolve('hoge')
console.log(c.handle()) // Outputs 'hoge'

const c2 = resolver.resolve('fuga')
console.log(c2.handle()) // Outputs 'fuga'

// Error handling is also the same
try {
  resolver.resolve('xxx') // This will throw an error for unsupported types
} catch (e) {
  console.log(e) // Error: Unsupported type: xxx
}