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

// StripeのEventデータのような複雑な型を扱うテスト用クラス
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

class StripeEventHandler implements ResolveTarget<[StripeEvent], string, StripeEvent> {
  supports(event: StripeEvent): boolean {
    return event.type === 'payment_intent.succeeded'
  }
  
  handle(event: StripeEvent): string {
    return `Payment succeeded: ${event.data.object.amount}`
  }
}

class StripeRefundHandler implements ResolveTarget<[StripeEvent], string, StripeEvent> {
  supports(event: StripeEvent): boolean {
    return event.type === 'charge.refunded'
  }
  
  handle(event: StripeEvent): string {
    return `Refund processed: ${event.data.object.amount}`
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
    expect(() => resolver.resolve('hoge')).toThrow('Unassigned resolve target.')
  })
  it('should throw error when given unsupported type', () => {
    const resolver = new Resolver<ResolveTarget<[], string>>(new ExampleClass())
    expect(() => resolver.resolve('fuga')).toThrow('Unsupported type: fuga')
  })
})

describe('Stripe Event handling with complex types', () => {
  it('should handle Stripe payment events', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new StripeEventHandler(),
      new StripeRefundHandler()
    )
    
    const paymentEvent: StripeEvent = {
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          amount: 1000
        }
      }
    }
    
    const handler = resolver.resolve(paymentEvent)
    expect(handler.handle(paymentEvent)).toBe('Payment succeeded: 1000')
  })
  
  it('should handle Stripe refund events', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new StripeEventHandler(),
      new StripeRefundHandler()
    )
    
    const refundEvent: StripeEvent = {
      id: 'evt_456',
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_456',
          amount: 500
        }
      }
    }
    
    const handler = resolver.resolve(refundEvent)
    expect(handler.handle(refundEvent)).toBe('Refund processed: 500')
  })
  
  it('should throw error for unsupported Stripe event type', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new StripeEventHandler(),
      new StripeRefundHandler()
    )
    
    const unsupportedEvent: StripeEvent = {
      id: 'evt_789',
      type: 'customer.created',
      data: {
        object: {
          id: 'cus_789',
          amount: 0
        }
      }
    }
    
    expect(() => resolver.resolve(unsupportedEvent)).toThrow('Unsupported type: {"id":"evt_789","type":"customer.created","data":{"object":{"id":"cus_789","amount":0}}}')
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