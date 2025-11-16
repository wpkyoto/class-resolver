import Resolver from '../libs/resolver';
import { AsyncResolveTarget, PrioritizedAsyncResolveTarget } from '../libs/interface';

interface PaymentEvent {
  type: string;
  amount: number;
  customerId: string;
}

// 非同期ハンドラー: データベース保存
class SaveToDBHandler implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
  supports(event: PaymentEvent): boolean {
    return event.type === 'payment.succeeded';
  }

  async handle(event: PaymentEvent): Promise<string> {
    // DBへの保存をシミュレート
    await new Promise(resolve => setTimeout(resolve, 10));
    return `DB: Saved payment ${event.amount} for customer ${event.customerId}`;
  }
}

// 非同期ハンドラー: 外部API呼び出し
class SendWebhookHandler implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
  supports(event: PaymentEvent): boolean {
    return event.type === 'payment.succeeded';
  }

  async handle(event: PaymentEvent): Promise<string> {
    // 外部APIへのwebhookをシミュレート
    await new Promise(resolve => setTimeout(resolve, 20));
    return `Webhook: Sent notification for payment ${event.amount}`;
  }
}

// 非同期ハンドラー: メール送信
class SendEmailHandler implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
  supports(event: PaymentEvent): boolean {
    return event.type === 'payment.succeeded';
  }

  async handle(event: PaymentEvent): Promise<string> {
    // メール送信をシミュレート
    await new Promise(resolve => setTimeout(resolve, 15));
    return `Email: Sent receipt to customer ${event.customerId}`;
  }
}

// 優先度付き非同期ハンドラー
class ValidationHandler implements PrioritizedAsyncResolveTarget<[PaymentEvent], boolean, PaymentEvent> {
  priority = 100;

  supports(event: PaymentEvent): boolean {
    return event.type === 'payment.succeeded';
  }

  async handle(event: PaymentEvent): Promise<boolean> {
    // バリデーションをシミュレート
    await new Promise(resolve => setTimeout(resolve, 5));
    return event.amount > 0;
  }
}

class ProcessPaymentHandler implements PrioritizedAsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
  priority = 50;

  supports(event: PaymentEvent): boolean {
    return event.type === 'payment.succeeded';
  }

  async handle(event: PaymentEvent): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 10));
    return `Processed payment ${event.amount}`;
  }
}

describe('Async Handler Resolution - handleAllAsync()', () => {
  it('should execute all async handlers in parallel and return results', async () => {
    const resolver = new Resolver<AsyncResolveTarget<[PaymentEvent], string, PaymentEvent>, PaymentEvent>(
      new SaveToDBHandler(),
      new SendWebhookHandler(),
      new SendEmailHandler()
    );

    const event: PaymentEvent = {
      type: 'payment.succeeded',
      amount: 1000,
      customerId: 'cus_123'
    };

    const startTime = Date.now();
    const results = await resolver.handleAllAsync(event, event);
    const duration = Date.now() - startTime;

    expect(results).toHaveLength(3);
    expect(results).toContain('DB: Saved payment 1000 for customer cus_123');
    expect(results).toContain('Webhook: Sent notification for payment 1000');
    expect(results).toContain('Email: Sent receipt to customer cus_123');

    // 並列実行なので、最も遅いハンドラー(20ms)程度で完了するはず
    expect(duration).toBeLessThan(100); // 余裕を持たせて100ms
  });

  it('should return empty array when no handlers match', async () => {
    const resolver = new Resolver<AsyncResolveTarget<[PaymentEvent], string, PaymentEvent>, PaymentEvent>(
      new SaveToDBHandler()
    );

    const event: PaymentEvent = {
      type: 'refund.processed',
      amount: 500,
      customerId: 'cus_456'
    };

    const results = await resolver.handleAllAsync(event, event);
    expect(results).toHaveLength(0);
  });

  it('should handle mixed sync and async handlers', async () => {
    class SyncHandler implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(event: PaymentEvent): Promise<string> {
        return `Sync: Logged payment ${event.amount}`;
      }
    }

    const resolver = new Resolver<AsyncResolveTarget<[PaymentEvent], string, PaymentEvent>, PaymentEvent>(
      new SyncHandler(),
      new SaveToDBHandler()
    );

    const event: PaymentEvent = {
      type: 'payment.succeeded',
      amount: 1000,
      customerId: 'cus_123'
    };

    const results = await resolver.handleAllAsync(event, event);
    expect(results).toHaveLength(2);
  });
});

describe('Async Handler Resolution - handleAllSequential()', () => {
  it('should execute all async handlers sequentially', async () => {
    const executionOrder: string[] = [];

    class Handler1 implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 10));
        executionOrder.push('Handler1');
        return 'Handler1';
      }
    }

    class Handler2 implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 10));
        executionOrder.push('Handler2');
        return 'Handler2';
      }
    }

    class Handler3 implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 10));
        executionOrder.push('Handler3');
        return 'Handler3';
      }
    }

    const resolver = new Resolver<AsyncResolveTarget<[PaymentEvent], string, PaymentEvent>, PaymentEvent>(
      new Handler1(),
      new Handler2(),
      new Handler3()
    );

    const event: PaymentEvent = {
      type: 'payment.succeeded',
      amount: 1000,
      customerId: 'cus_123'
    };

    const startTime = Date.now();
    const results = await resolver.handleAllSequential(event, event);
    const duration = Date.now() - startTime;

    expect(results).toHaveLength(3);
    expect(results[0]).toBe('Handler1');
    expect(results[1]).toBe('Handler2');
    expect(results[2]).toBe('Handler3');

    // 順序確認
    expect(executionOrder).toEqual(['Handler1', 'Handler2', 'Handler3']);

    // 直列実行なので、合計時間(30ms)程度かかるはず
    expect(duration).toBeGreaterThanOrEqual(20);
  });

  it('should stop on first error in sequential execution', async () => {
    const executionOrder: string[] = [];

    class SuccessHandler implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(): Promise<string> {
        executionOrder.push('Success');
        return 'Success';
      }
    }

    class ErrorHandler implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(): Promise<string> {
        executionOrder.push('Error');
        throw new Error('Handler failed');
      }
    }

    class NeverExecutedHandler implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(): Promise<string> {
        executionOrder.push('NeverExecuted');
        return 'NeverExecuted';
      }
    }

    const resolver = new Resolver<AsyncResolveTarget<[PaymentEvent], string, PaymentEvent>, PaymentEvent>(
      new SuccessHandler(),
      new ErrorHandler(),
      new NeverExecutedHandler()
    );

    const event: PaymentEvent = {
      type: 'payment.succeeded',
      amount: 1000,
      customerId: 'cus_123'
    };

    await expect(resolver.handleAllSequential(event, event)).rejects.toThrow('Handler failed');

    // エラーが発生した時点で停止するので、3番目のハンドラーは実行されない
    expect(executionOrder).toEqual(['Success', 'Error']);
  });
});

describe('Async with Priority', () => {
  it('should execute async handlers in priority order', async () => {
    const resolver = new Resolver<
      PrioritizedAsyncResolveTarget<[PaymentEvent], any, PaymentEvent>,
      PaymentEvent
    >(
      new ProcessPaymentHandler(),  // priority: 50
      new ValidationHandler()       // priority: 100
    );

    const event: PaymentEvent = {
      type: 'payment.succeeded',
      amount: 1000,
      customerId: 'cus_123'
    };

    const results = await resolver.handleAllAsync(event, event);

    expect(results).toHaveLength(2);
    expect(results[0]).toBe(true);                      // ValidationHandler (priority: 100)
    expect(results[1]).toBe('Processed payment 1000');  // ProcessPaymentHandler (priority: 50)
  });

  it('should execute async handlers sequentially in priority order', async () => {
    const executionOrder: string[] = [];

    class HighPriority implements PrioritizedAsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      priority = 100;

      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 10));
        executionOrder.push('High');
        return 'High';
      }
    }

    class LowPriority implements PrioritizedAsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      priority = 10;

      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 10));
        executionOrder.push('Low');
        return 'Low';
      }
    }

    const resolver = new Resolver<
      PrioritizedAsyncResolveTarget<[PaymentEvent], string, PaymentEvent>,
      PaymentEvent
    >(
      new LowPriority(),   // priority: 10
      new HighPriority()   // priority: 100
    );

    const event: PaymentEvent = {
      type: 'payment.succeeded',
      amount: 1000,
      customerId: 'cus_123'
    };

    await resolver.handleAllSequential(event, event);

    // 優先度順に実行される
    expect(executionOrder).toEqual(['High', 'Low']);
  });
});

describe('Async Error Handling', () => {
  it('should collect all errors in parallel execution', async () => {
    class SuccessHandler implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(): Promise<string> {
        return 'Success';
      }
    }

    class ErrorHandler implements AsyncResolveTarget<[PaymentEvent], string, PaymentEvent> {
      supports(event: PaymentEvent): boolean {
        return event.type === 'payment.succeeded';
      }

      async handle(): Promise<string> {
        throw new Error('Handler failed');
      }
    }

    const resolver = new Resolver<AsyncResolveTarget<[PaymentEvent], string, PaymentEvent>, PaymentEvent>(
      new SuccessHandler(),
      new ErrorHandler()
    );

    const event: PaymentEvent = {
      type: 'payment.succeeded',
      amount: 1000,
      customerId: 'cus_123'
    };

    // Promise.allなので、どれか1つでもエラーがあると全体が失敗する
    await expect(resolver.handleAllAsync(event, event)).rejects.toThrow('Handler failed');
  });
});
