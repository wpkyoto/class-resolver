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

// Fallback機能のテストケース
describe('Fallback functionality', () => {
  // テスト用のTargetクラス
  class StringHandler implements ResolveTarget<[any], string, any> {
    supports(type: any): boolean {
      // 特定の文字列のみをサポート（fallbackテストのため）
      return typeof type === 'string' && ['hello', 'world'].includes(type);
    }
    
    handle(input: any): string {
      return `Processed: ${input}`;
    }
  }

  class NumberHandler implements ResolveTarget<[any], string, any> {
    supports(type: any): boolean {
      return typeof type === 'number' && type > 0;
    }
    
    handle(input: any): string {
      return `Number: ${input}`;
    }
  }

  class LogHandler implements ResolveTarget<[string, any, Date?], void, string> {
    supports(type: string): boolean {
      return ['INFO', 'WARN', 'ERROR'].includes(type);
    }
    
    handle(level: string, message: any, timestamp?: Date): void {
      const time = timestamp || new Date();
      console.log(`[${level}] ${message} at ${time.toISOString()}`);
    }
  }

  class UserHandler implements ResolveTarget<[{id: number, name: string}], string, string> {
    supports(type: string): boolean {
      return ['USER', 'ADMIN'].includes(type);
    }
    
    handle(user: {id: number, name: string}): string {
      return `User: ${user.name} (ID: ${user.id})`;
    }
  }

  describe('Basic fallback functionality', () => {
    it('should throw error when resolving unsupported type without fallback', () => {
      const resolver = new Resolver<ResolveTarget<[any], string, any>>(
        new StringHandler()
      );
      
      expect(() => resolver.resolve('boolean')).toThrow('Unsupported type: boolean');
    });

    it('should execute fallback handler when resolving unsupported type', () => {
      const resolver = new Resolver<ResolveTarget<[any], string, any>>(
        new StringHandler()
      );
      
      // fallbackHandlerを設定（この時点では実装されていないのでfailする）
      resolver.setFallbackHandler((input: any) => {
        return `Fallback: ${input}`;
      });
      
      const result = resolver.resolve('boolean').handle('boolean');
      expect(result).toBe('Fallback: boolean');
    });

    it('should handle different types with appropriate handlers', () => {
      // NumberHandlerを使用するテストケース
      const resolver = new Resolver<ResolveTarget<[any], string, any>>(
        new StringHandler(),
        new NumberHandler()
      );
      
      // 文字列型はStringHandlerで処理
      const stringResult = resolver.resolve('hello').handle('hello');
      expect(stringResult).toBe('Processed: hello');
      
      // 数値型はNumberHandlerで処理
      const numberResult = resolver.resolve(42 as any).handle(42);
      expect(numberResult).toBe('Number: 42');
    });
  });

  describe('Type safety validation', () => {
    it('should accept fallback handler with correct types', () => {
      const resolver = new Resolver<ResolveTarget<[any], string, any>>(
        new StringHandler()
      );
      
      // 正しい型のfallbackHandlerを設定
      resolver.setFallbackHandler((input: any) => {
        return `Fallback: ${input}`;
      });
      
      // 型エラーが発生しないことを確認
      expect(resolver).toBeDefined();
    });

    it('should handle fallback handler with correct runtime behavior', () => {
      const resolver = new Resolver<ResolveTarget<[any], string, any>>(
        new StringHandler()
      );
      
      resolver.setFallbackHandler((input: any) => {
        return `Fallback: ${input}`;
      });
      
      // 実際の動作をテスト
      const result = resolver.resolve('unsupported').handle('unsupported');
      expect(result).toBe('Fallback: unsupported');
    });
  });

  describe('Complex type fallback functionality', () => {
    it('should handle multiple arguments in fallback handler', () => {
      const resolver = new Resolver<ResolveTarget<[string, any, Date?], void, string>>(
        new LogHandler()
      );
      
      // 複数引数を持つfallbackHandlerを設定
      resolver.setFallbackHandler((level: string, message: any, timestamp?: Date) => {
        const time = timestamp || new Date();
        console.log(`[FALLBACK-${level}] ${message} at ${time.toISOString()}`);
      });
      
      // サポートされていない型でfallbackHandlerが実行される
      const result = resolver.resolve('DEBUG');
      expect(result.supports('DEBUG')).toBe(true);
    });

    it('should handle object arguments in fallback handler', () => {
      const resolver = new Resolver<ResolveTarget<[{id: number, name: string}], string, string>>(
        new UserHandler()
      );
      
      // オブジェクト型の引数を持つfallbackHandlerを設定
      resolver.setFallbackHandler((user: {id: number, name: string}) => {
        return `Fallback: User {id: ${user.id}, name: '${user.name}'}`;
      });
      
      // サポートされていない型でfallbackHandlerが実行される
      const result = resolver.resolve('UNKNOWN');
      expect(result.supports('UNKNOWN')).toBe(true);
    });
  });

  describe('Method chaining support', () => {
    it('should support method chaining with setFallbackHandler', () => {
      const resolver = new Resolver<ResolveTarget<[any], string, any>>(
        new StringHandler()
      );
      
      // メソッドチェーンが動作することを確認
      const result = resolver
        .setFallbackHandler((input: any) => `Fallback: ${input}`)
        .addUpdater(new StringHandler()); // 同じ型のHandlerを使用
      
      expect(result).toBe(resolver);
    });
  });

  describe('Existing functionality compatibility', () => {
    it('should use registered handler for supported types even when fallback is set', () => {
      const resolver = new Resolver<ResolveTarget<[any], string, any>>(
        new StringHandler()
      );
      
      resolver.setFallbackHandler((input: any) => `Fallback: ${input}`);
      
      // サポートされている型は通常のhandlerが使用される
      const result = resolver.resolve('hello').handle('hello');
      expect(result).toBe('Processed: hello');
    });

    it('should throw error when no handlers registered even with fallback set', () => {
      const resolver = new Resolver<ResolveTarget<[any], string, any>>();
      
      resolver.setFallbackHandler((input: any) => `Fallback: ${input}`);
      
      // ハンドラーが登録されていない場合はfallbackHandlerは実行されない
      expect(() => resolver.resolve('any')).toThrow('Unassigned resolve target.');
    });
  });

  describe('Edge case handling', () => {
    it('should handle null type with fallback', () => {
      // nullを扱うために型を調整
      const resolver = new Resolver<ResolveTarget<[any], string, any>>(
        new StringHandler()
      );
      
      resolver.setFallbackHandler((input: any) => {
        if (input === null) return 'Null value detected';
        return `Fallback: ${typeof input}`;
      });
      
      // nullをany型として扱う
      const result = resolver.resolve(null as any).handle(null);
      expect(result).toBe('Null value detected');
    });

    it('should handle empty array type with fallback', () => {
      // 空配列を扱うために型を調整
      const resolver = new Resolver<ResolveTarget<[any], string, any>>(
        new StringHandler()
      );
      
      resolver.setFallbackHandler((input: any) => {
        if (Array.isArray(input) && input.length === 0) return 'Empty array detected';
        return `Fallback: ${typeof input}`;
      });
      
      // 空配列をany型として扱う
      const result = resolver.resolve([] as any).handle([]);
      expect(result).toBe('Empty array detected');
    });
  });

  describe('Performance characteristics', () => {
    it('should execute fallback handler efficiently', () => {
      const resolver = new Resolver<ResolveTarget<[any], string, any>>(
        new StringHandler()
      );
      
      resolver.setFallbackHandler((input: any) => `Fallback: ${input}`);
      
      const startTime = performance.now();
      
      // 複数回実行してパフォーマンスを測定
      for (let i = 0; i < 1000; i++) {
        resolver.resolve('unsupported').handle('unsupported');
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // 1000回の実行が1秒以内に完了することを確認
      expect(executionTime).toBeLessThan(1000);
    });
  });
});