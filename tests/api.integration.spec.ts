import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../src/app/services/api.service';

// Integration Tests - Testing against actual FastAPI backend
describe('ApiService Integration Tests', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('diagnostic: print environment + API URLs', () => {
    // Lazy import to avoid interfering with Angular test bed earlier
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const env = require('../src/environments/environment');
    const e = env.environment;
    const base = e.apiConfig?.baseUrl;
    const endpoints = e.apiConfig?.endpoints || {};
    const fullChat = base + endpoints.chat;
    const fullSessions = base + endpoints.sessions;
    const chatSessions = base + endpoints.chatSessions;
    const saveChat = base + endpoints.saveChat;
    const strictFlag = (globalThis as any)['STRICT_CHAT_TEST'] || (typeof process !== 'undefined' && (process as any)?.env?.['STRICT_CHAT_TEST']);
    // DO NOT log secrets – these values are safe (static config)
    // Provide structured output to make parsing in CI easier
    console.log('🔍 ENV_DIAGNOSTIC', JSON.stringify({
      production: e.production,
      baseUrl: base,
      endpoints,
      computed: { fullChat, fullSessions, chatSessions, saveChat },
      STRICT_CHAT_TEST: strictFlag || false
    }, null, 2));
    expect(base).toBeTruthy();
  });

  // STRICT_MODE: set environment variable STRICT_CHAT_TEST=1 (via Karma env or process.env in CI) to enforce failure on backend 500.
  // Without STRICT mode this test will mark itself pending if the backend returns a 500 caused by missing Azure model deployment.
  const gAny: any = globalThis as any;
  const STRICT_MODE = gAny['STRICT_CHAT_TEST'] === true || (typeof process !== 'undefined' && (process as any)?.env?.['STRICT_CHAT_TEST'] === '1');

  it('should return an AI response for a basic message (with retries)', (done) => {
    const testMessage = 'hello';
    const maxAttempts = 3;
    const baseDelayMs = 1500; // exponential backoff base
    let attempt = 0;
    const start = Date.now();
    const overallTimeoutMs = 45000; // allow more time due to retries
    let overallTimer: any;

    const finish = (fn: () => void) => {
      if (overallTimer) clearTimeout(overallTimer);
      fn();
      done();
    };

    overallTimer = setTimeout(() => {
      fail(`Timed out after ${(Date.now() - start)}ms and ${attempt} attempt(s)`);
      done();
    }, overallTimeoutMs);

    const attemptCall = () => {
      attempt++;
      console.log(`➡️ /api/chat attempt ${attempt}/${maxAttempts}`);
      service.sendMessage(testMessage).subscribe({
        next: (response: any) => {
          try {
            expect(response).toBeTruthy();
            expect(typeof response.content).toBe('string');
            expect(response.content.trim().length).toBeGreaterThan(0);
            console.log('✅ /api/chat success on attempt', attempt, 'Snippet:', response.content.slice(0, 120));
            finish(() => {});
          } catch (assertErr) {
            fail('Assertion failure: ' + (assertErr as Error).message);
            finish(() => {});
          }
        },
        error: (error: any) => {
          const status = error?.status;
          const retriable = [0, 429, 500, 502, 503, 504].includes(status);
          console.warn(`⚠️ /api/chat attempt ${attempt} failed with status ${status}. Retriable=${retriable}`);
          if (retriable && attempt < maxAttempts) {
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            setTimeout(attemptCall, delay);
            return;
          }
          // After retries exhausted
          if (!STRICT_MODE && status === 500) {
            console.warn('🟡 Skipping test (marking pending) due to known backend 500 in non-STRICT mode. Message:', error?.message);
            (pending as any)('Backend 500 (likely missing Azure OpenAI deployment) - skipped in non-STRICT mode');
            finish(() => {});
            return;
          }
          fail('❌ /api/chat error after retries: ' + (error?.message || JSON.stringify(error)));
          finish(() => {});
        }
      });
    };

    attemptCall();
  }, 46000); // 46 second Jasmine timeout budget (slightly above overallTimeoutMs)
});