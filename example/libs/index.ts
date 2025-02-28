import Resolver, { ResolveTarget } from '../../dist/index'

// ジェネリクスを使用して戻り値の型を指定
class Test implements ResolveTarget<[], string> {
  supports(str: string): boolean {
    return false
  }
  handle(): string {
    return 'test'
  }
}

// ジェネリクスを使用して戻り値の型を指定
class Test2 implements ResolveTarget<[], string> {
  supports(str: string): boolean {
    return true
  }
  handle(): string {
    return 'test2'
  }
}

// Resolverにも型パラメータを指定
const r = new Resolver<ResolveTarget<[], string>>(
  new Test(),
  new Test2()
)

const t = r.resolve('test')
// 型安全な戻り値
const result: string = t.handle()
console.log(result)