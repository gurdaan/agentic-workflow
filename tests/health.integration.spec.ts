import { TestBed } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../src/environments/environment';

// Simple health check integration test to confirm backend is reachable.
// Uses same baseUrl logic as ApiService but does not depend on AI/model infrastructure.

describe('Backend Health Endpoint Integration', () => {
  let http: HttpClient;
  const baseUrl = (environment as any).apiConfig?.baseUrl || 'http://localhost:8000';
  const healthUrl = baseUrl.replace(/\/$/, '') + '/health';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    http = TestBed.inject(HttpClient);
  });

  it('should return healthy status from /health', (done) => {
    http.get<any>(healthUrl).subscribe({
      next: (res) => {
        try {
          expect(res).toBeTruthy();
          expect(res.status).toBe('healthy');
          expect(typeof res.agent_initialized).toBe('boolean');
          console.log('✅ /health response:', res);
        } catch (e) {
          fail('Assertion error: ' + (e as Error).message);
        } finally {
          done();
        }
      },
      error: (err) => {
        console.error('❌ /health error', err);
        fail('Failed to reach /health: ' + (err?.message || JSON.stringify(err)));
        done();
      }
    });
  }, 10000);
});
