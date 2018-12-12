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
console.log(Resolver)
const resolver = new Resolver(new ExampleClass(), new ExampleClass2())
const c = resolver.resolve('hoge')
console.log(c.handle())
const c2 = resolver.resolve('fuga')
console.log(c2.handle())

try {
  resolver.resolve('xxx')
} catch (e) {
  console.log(e)
}