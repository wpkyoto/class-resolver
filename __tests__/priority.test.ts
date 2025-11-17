import Resolver from '../libs/resolver';
import { ResolveTarget, PrioritizedResolveTarget } from '../libs/interface';

// Webhook処理の典型的なパターン: Validation → Business Logic → Logging
interface WebhookEvent {
  type: string;
  data: any;
}

// 優先度: 100 (最優先) - バリデーション
class ValidationHandler implements PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent> {
  priority = 100;

  supports(event: WebhookEvent): boolean {
    return event.type === 'payment.created';
  }

  handle(): string {
    return 'STEP1: Validation';
  }
}

// 優先度: 50 - ビジネスロジック
class BusinessLogicHandler implements PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent> {
  priority = 50;

  supports(event: WebhookEvent): boolean {
    return event.type === 'payment.created';
  }

  handle(): string {
    return 'STEP2: Business Logic';
  }
}

// 優先度: 10 - ロギング
class LoggingHandler implements PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent> {
  priority = 10;

  supports(event: WebhookEvent): boolean {
    return event.type === 'payment.created';
  }

  handle(): string {
    return 'STEP3: Logging';
  }
}

// 優先度なし - デフォルトハンドラー
class DefaultHandler implements ResolveTarget<[WebhookEvent], string, WebhookEvent> {
  supports(event: WebhookEvent): boolean {
    return event.type === 'payment.created';
  }

  handle(): string {
    return 'STEP4: Default (no priority)';
  }
}

describe('Priority-based Handler Resolution', () => {
  it('should resolve handlers in priority order (highest first)', () => {
    const resolver = new Resolver<
      PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent>,
      WebhookEvent
    >(
      new LoggingHandler(),        // priority: 10
      new BusinessLogicHandler(),  // priority: 50
      new ValidationHandler()      // priority: 100
    );

    const event: WebhookEvent = {
      type: 'payment.created',
      data: { amount: 1000 }
    };

    const results = resolver.handleAll(event, event);

    expect(results).toHaveLength(3);
    expect(results[0]).toBe('STEP1: Validation');      // priority: 100
    expect(results[1]).toBe('STEP2: Business Logic');  // priority: 50
    expect(results[2]).toBe('STEP3: Logging');         // priority: 10
  });

  it('should handle handlers without priority as lowest priority (0)', () => {
    const resolver = new Resolver<
      ResolveTarget<[WebhookEvent], string, WebhookEvent> | PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent>,
      WebhookEvent
    >(
      new DefaultHandler(),        // no priority (treated as 0)
      new ValidationHandler(),     // priority: 100
      new LoggingHandler()         // priority: 10
    );

    const event: WebhookEvent = {
      type: 'payment.created',
      data: { amount: 1000 }
    };

    const results = resolver.handleAll(event, event);

    expect(results).toHaveLength(3);
    expect(results[0]).toBe('STEP1: Validation');           // priority: 100
    expect(results[1]).toBe('STEP3: Logging');              // priority: 10
    expect(results[2]).toBe('STEP4: Default (no priority)'); // priority: 0 (default)
  });

  it('should maintain registration order for handlers with same priority', () => {
    class Handler1 implements PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent> {
      priority = 50;
      supports(event: WebhookEvent): boolean {
        return event.type === 'test';
      }
      handle(): string {
        return 'Handler1';
      }
    }

    class Handler2 implements PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent> {
      priority = 50;
      supports(event: WebhookEvent): boolean {
        return event.type === 'test';
      }
      handle(): string {
        return 'Handler2';
      }
    }

    class Handler3 implements PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent> {
      priority = 50;
      supports(event: WebhookEvent): boolean {
        return event.type === 'test';
      }
      handle(): string {
        return 'Handler3';
      }
    }

    const resolver = new Resolver<
      PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent>,
      WebhookEvent
    >(
      new Handler1(),
      new Handler2(),
      new Handler3()
    );

    const event: WebhookEvent = {
      type: 'test',
      data: {}
    };

    const results = resolver.handleAll(event, event);

    expect(results).toHaveLength(3);
    expect(results[0]).toBe('Handler1'); // 登録順
    expect(results[1]).toBe('Handler2');
    expect(results[2]).toBe('Handler3');
  });

  it('should work with resolve() returning highest priority handler', () => {
    const resolver = new Resolver<
      PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent>,
      WebhookEvent
    >(
      new LoggingHandler(),        // priority: 10
      new ValidationHandler(),     // priority: 100
      new BusinessLogicHandler()   // priority: 50
    );

    const event: WebhookEvent = {
      type: 'payment.created',
      data: { amount: 1000 }
    };

    // resolve()は最初にマッチしたものを返すのではなく、最優先のものを返す
    const handler = resolver.resolve(event);
    const result = handler.handle(event);

    expect(result).toBe('STEP1: Validation'); // priority: 100が最優先
  });

  it('should handle negative priorities correctly', () => {
    class CleanupHandler implements PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent> {
      priority = -10;
      supports(event: WebhookEvent): boolean {
        return event.type === 'test';
      }
      handle(): string {
        return 'Cleanup (last)';
      }
    }

    class NormalHandler implements PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent> {
      priority = 50;
      supports(event: WebhookEvent): boolean {
        return event.type === 'test';
      }
      handle(): string {
        return 'Normal';
      }
    }

    const resolver = new Resolver<
      PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent>,
      WebhookEvent
    >(
      new CleanupHandler(),
      new NormalHandler()
    );

    const event: WebhookEvent = {
      type: 'test',
      data: {}
    };

    const results = resolver.handleAll(event, event);

    expect(results).toHaveLength(2);
    expect(results[0]).toBe('Normal');           // priority: 50
    expect(results[1]).toBe('Cleanup (last)');   // priority: -10
  });
});

describe('Priority with addUpdater and setUpdaters', () => {
  it('should maintain priority order when adding handlers dynamically', () => {
    const resolver = new Resolver<
      PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent>,
      WebhookEvent
    >();

    resolver.addUpdater(new LoggingHandler());        // priority: 10
    resolver.addUpdater(new ValidationHandler());     // priority: 100
    resolver.addUpdater(new BusinessLogicHandler());  // priority: 50

    const event: WebhookEvent = {
      type: 'payment.created',
      data: { amount: 1000 }
    };

    const results = resolver.handleAll(event, event);

    expect(results).toHaveLength(3);
    expect(results[0]).toBe('STEP1: Validation');
    expect(results[1]).toBe('STEP2: Business Logic');
    expect(results[2]).toBe('STEP3: Logging');
  });

  it('should maintain priority order with setUpdaters', () => {
    const resolver = new Resolver<
      PrioritizedResolveTarget<[WebhookEvent], string, WebhookEvent>,
      WebhookEvent
    >();

    resolver.setUpdaters(
      new LoggingHandler(),        // priority: 10
      new ValidationHandler(),     // priority: 100
      new BusinessLogicHandler()   // priority: 50
    );

    const event: WebhookEvent = {
      type: 'payment.created',
      data: { amount: 1000 }
    };

    const results = resolver.handleAll(event, event);

    expect(results).toHaveLength(3);
    expect(results[0]).toBe('STEP1: Validation');
    expect(results[1]).toBe('STEP2: Business Logic');
    expect(results[2]).toBe('STEP3: Logging');
  });
});
