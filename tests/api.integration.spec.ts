import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../src/app/services/api.service';
import { environment } from '../src/environments/environment';

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
    const e = environment as any;
    const base = e.apiConfig?.baseUrl;
    const endpoints = e.apiConfig?.endpoints || {};
    const fullChat = base + endpoints.chat;
    const fullSessions = base + endpoints.sessions;
    const chatSessions = base + endpoints.chatSessions;
    const saveChat = base + endpoints.saveChat;
    const strictFlag = (globalThis as any)['STRICT_CHAT_TEST'];
    console.log('🔍 ENV_DIAGNOSTIC', JSON.stringify({
      production: e.production,
      baseUrl: base,
      endpoints,
      computed: { fullChat, fullSessions, chatSessions, saveChat },
      STRICT_CHAT_TEST: !!strictFlag
    }, null, 2));
    expect(base).toBeTruthy();
  });

  it('should return a sessions list from /api/chat-sessions (may be empty)', (done) => {
    service.getChatSessions().subscribe({
      next: (response: any) => {
        try {
          expect(response).toBeTruthy();
          expect(Array.isArray(response.sessions)).toBeTrue();
          console.log('✅ /api/chat-sessions sessions count:', response.sessions.length);
        } catch (e) {
          fail('Assertion error: ' + (e as Error).message);
        } finally {
          done();
        }
      },
      error: (err: any) => {
        console.error('❌ /api/chat-sessions error', err);
        fail('Failed to reach /api/chat-sessions: ' + (err?.message || JSON.stringify(err)));
        done();
      }
    });
  }, 15000);
});