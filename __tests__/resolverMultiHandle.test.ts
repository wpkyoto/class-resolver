import Resolver from '../libs/resolver';
import { ResolveTarget } from '../libs/interface'

class ExampleClass implements ResolveTarget<[string, number], string> {
  supports(type: string): boolean {
    return type === 'hoge'
  }
  handle(text1: string, count: number): string {
    return `[class1]${text1}: ${count}`
  }
}
class ExampleClass2 implements ResolveTarget<[string, number], string> {
  supports(type: string) {
    return type === 'fuga'
  }
  handle(text1: string, count: number): string {
    return `[class2]${text1}: ${count}`
  }
}

describe('constructor', () => {
  it('should resolved multipile target', () => {
    const resolver = new Resolver<ResolveTarget<[string, number], string>>(new ExampleClass(), new ExampleClass2())
    const c = resolver.resolve('hoge')
    expect(c.handle('hello', 10)).toBe('[class1]hello: 10')
    const c2 = resolver.resolve('fuga')
    expect(c2.handle('hello', 10)).toBe('[class2]hello: 10')
  })
})
