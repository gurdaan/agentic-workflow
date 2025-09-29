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

  // Strict test for /api/chat endpoint expecting a valid AI response with retry logic
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
          fail('❌ /api/chat error after retries: ' + (error?.message || JSON.stringify(error)));
          finish(() => {});
        }
      });
    };

    attemptCall();
  }, 46000); // 46 second Jasmine timeout budget (slightly above overallTimeoutMs)
});