const Resolver = require('class-resolver')

// v2.0.0ではジェネリクスをサポートしていますが、JavaScriptでは型情報は無視されます
// そのため、既存のJavaScriptコードは変更なしで動作します
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

// Resolverの使用方法は変わりません
const resolver = new Resolver(new ExampleClass(), new ExampleClass2())
const c = resolver.resolve('hoge')
console.log(c.handle()) // 'hoge'が出力されます

const c2 = resolver.resolve('fuga')
console.log(c2.handle()) // 'fuga'が出力されます

// エラーハンドリングも同じです
try {
  resolver.resolve('xxx') // サポートされていない型を指定するとエラーが発生します
} catch (e) {
  console.log(e) // Error: Unsupported type: xxx
}