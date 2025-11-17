import type { ResolveTarget } from '../libs/interface';
import Resolver from '../libs/resolver';

// Stripe webhook のような実際のユースケースを想定
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

// 会計システム: payment成功時の処理
class AccountingHandler implements ResolveTarget<[StripeEvent], string, StripeEvent> {
  supports(event: StripeEvent): boolean {
    return event.type === 'payment_intent.succeeded';
  }

  handle(event: StripeEvent): string {
    return `Accounting: Record payment ${event.data.object.amount}`;
  }
}

// メール送信: payment成功時の通知
class EmailNotificationHandler implements ResolveTarget<[StripeEvent], string, StripeEvent> {
  supports(event: StripeEvent): boolean {
    return event.type === 'payment_intent.succeeded';
  }

  handle(event: StripeEvent): string {
    return `Email: Payment confirmation sent for ${event.data.object.amount}`;
  }
}

// 分析システム: payment成功時のログ
class AnalyticsHandler implements ResolveTarget<[StripeEvent], string, StripeEvent> {
  supports(event: StripeEvent): boolean {
    return event.type === 'payment_intent.succeeded';
  }

  handle(event: StripeEvent): string {
    return `Analytics: Logged payment ${event.data.object.amount}`;
  }
}

// Refund専用ハンドラー
class RefundHandler implements ResolveTarget<[StripeEvent], string, StripeEvent> {
  supports(event: StripeEvent): boolean {
    return event.type === 'charge.refunded';
  }

  handle(event: StripeEvent): string {
    return `Refund: Processed ${event.data.object.amount}`;
  }
}

describe('Multiple Handlers - resolveAll()', () => {
  it('should return all matching handlers for a single event type', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new AccountingHandler(),
      new EmailNotificationHandler(),
      new AnalyticsHandler()
    );

    const paymentEvent: StripeEvent = {
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          amount: 1000,
        },
      },
    };

    const handlers = resolver.resolveAll(paymentEvent);
    expect(handlers).toHaveLength(3);
  });

  it('should return empty array when no handlers match', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new AccountingHandler(),
      new EmailNotificationHandler()
    );

    const unsupportedEvent: StripeEvent = {
      id: 'evt_456',
      type: 'customer.created',
      data: {
        object: {
          id: 'cus_123',
          amount: 0,
        },
      },
    };

    const handlers = resolver.resolveAll(unsupportedEvent);
    expect(handlers).toHaveLength(0);
  });

  it('should return single handler when only one matches', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new AccountingHandler(),
      new RefundHandler()
    );

    const refundEvent: StripeEvent = {
      id: 'evt_789',
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_123',
          amount: 500,
        },
      },
    };

    const handlers = resolver.resolveAll(refundEvent);
    expect(handlers).toHaveLength(1);
  });

  it('should throw error when no handlers are registered', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>();

    const event: StripeEvent = {
      id: 'evt_999',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_999',
          amount: 100,
        },
      },
    };

    expect(() => resolver.resolveAll(event)).toThrow('Unassigned resolve target.');
  });
});

describe('Multiple Handlers - handleAll()', () => {
  it('should execute all matching handlers and return results', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new AccountingHandler(),
      new EmailNotificationHandler(),
      new AnalyticsHandler()
    );

    const paymentEvent: StripeEvent = {
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          amount: 1000,
        },
      },
    };

    const results = resolver.handleAll(paymentEvent, paymentEvent);

    expect(results).toHaveLength(3);
    expect(results).toContain('Accounting: Record payment 1000');
    expect(results).toContain('Email: Payment confirmation sent for 1000');
    expect(results).toContain('Analytics: Logged payment 1000');
  });

  it('should return empty array when no handlers match', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new AccountingHandler()
    );

    const unsupportedEvent: StripeEvent = {
      id: 'evt_456',
      type: 'customer.created',
      data: {
        object: {
          id: 'cus_123',
          amount: 0,
        },
      },
    };

    const results = resolver.handleAll(unsupportedEvent, unsupportedEvent);
    expect(results).toHaveLength(0);
  });

  it('should handle mixed event types correctly', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new AccountingHandler(),
      new EmailNotificationHandler(),
      new RefundHandler()
    );

    const paymentEvent: StripeEvent = {
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          amount: 1000,
        },
      },
    };

    const refundEvent: StripeEvent = {
      id: 'evt_456',
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_123',
          amount: 500,
        },
      },
    };

    const paymentResults = resolver.handleAll(paymentEvent, paymentEvent);
    expect(paymentResults).toHaveLength(2); // AccountingとEmail

    const refundResults = resolver.handleAll(refundEvent, refundEvent);
    expect(refundResults).toHaveLength(1); // Refundのみ
  });
});

// Fallback機能との統合テスト
describe('Multiple Handlers with Fallback', () => {
  it('should use fallback when no handlers match', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new AccountingHandler()
    );

    resolver.setFallbackHandler((event: StripeEvent) => {
      return `Fallback: Unhandled event type ${event.type}`;
    });

    const unsupportedEvent: StripeEvent = {
      id: 'evt_789',
      type: 'customer.created',
      data: {
        object: {
          id: 'cus_123',
          amount: 0,
        },
      },
    };

    const handlers = resolver.resolveAll(unsupportedEvent);
    expect(handlers).toHaveLength(1);
    expect(handlers[0].handle(unsupportedEvent)).toBe(
      'Fallback: Unhandled event type customer.created'
    );
  });

  it('should prefer registered handlers over fallback', () => {
    const resolver = new Resolver<ResolveTarget<[StripeEvent], string, StripeEvent>, StripeEvent>(
      new AccountingHandler(),
      new EmailNotificationHandler()
    );

    resolver.setFallbackHandler(() => {
      return 'Fallback: Should not be called';
    });

    const paymentEvent: StripeEvent = {
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          amount: 1000,
        },
      },
    };

    const handlers = resolver.resolveAll(paymentEvent);
    expect(handlers).toHaveLength(2);

    const results = resolver.handleAll(paymentEvent, paymentEvent);
    expect(results).not.toContain('Fallback: Should not be called');
  });
});
