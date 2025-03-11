import Resolver from '../libs/resolver';
import { ResolveTarget } from '../libs/interface'

class ExampleClass implements ResolveTarget<[], string> {
  supports(type: string) {
    return type === 'hoge'
  }
  handle(): string {
    return 'fuga'
  }
}
class ExampleClass2 implements ResolveTarget<[], string> {
  supports(type: string) {
    return type === 'fuga'
  }
  handle(): string {
    return 'hoge'
  }
}

describe('constructor', () => {
  it('should resolved', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>(new ExampleClass(), new ExampleClass2())
    const c = resolver.resolve('hoge')
    expect(c.handle()).toBe('fuga')
  })
  it('should resolved multipile target', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>(new ExampleClass(), new ExampleClass2())
    const c = resolver.resolve('hoge')
    expect(c.handle()).toBe('fuga')
    const c2 = resolver.resolve('fuga')
    expect(c2.handle()).toBe('hoge')
  })
  it('should throw error when unregistered', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>()
    expect(() => resolver.resolve('hoge')).toThrow('Unasigned resolve target.')
  })
  it('should throw error when given unsupported type', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>(new ExampleClass())
    expect(() => resolver.resolve('fuga')).toThrow('Unsupported type: fuga')
  })
})
describe('setUpdater()', () => {
  it('should resolved', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>()
    resolver.setUpdaters(new ExampleClass())
    const c = resolver.resolve('hoge')
    expect(c.handle()).toBe('fuga')
  })
  it('should resolved multipile target', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>()
    resolver.setUpdaters(new ExampleClass(), new ExampleClass2())
    const c = resolver.resolve('hoge')
    expect(c.handle()).toBe('fuga')
    const c2 = resolver.resolve('fuga')
    expect(c2.handle()).toBe('hoge')
  })
  it('should throw error when given unsupported type', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>()
    resolver.setUpdaters(new ExampleClass())
    expect(() => resolver.resolve('fuga')).toThrow('Unsupported type: fuga')
  })
})
describe('addUpdater()', () => {
  it('should resolved', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>()
    resolver.addUpdater(new ExampleClass())
    const c = resolver.resolve('hoge')
    expect(c.handle()).toBe('fuga')
  })
  it('should resolved multipile target', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>()
    resolver.addUpdater(new ExampleClass())
    resolver.addUpdater(new ExampleClass2())
    const c = resolver.resolve('hoge')
    expect(c.handle()).toBe('fuga')
    const c2 = resolver.resolve('fuga')
    expect(c2.handle()).toBe('hoge')
  })
  it('should throw error when given unsupported type', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>()
    resolver.addUpdater(new ExampleClass())
    expect(() => resolver.resolve('fuga')).toThrow('Unsupported type: fuga')
  })
})