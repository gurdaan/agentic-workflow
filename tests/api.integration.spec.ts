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

  it('should send message to real FastAPI backend and receive response', (done) => {
    const testMessage = 'Create a user story for login feature';

    service.sendMessage(testMessage).subscribe({
      next: (response) => {
        // Verify we got a real response from the backend
        expect(response).toBeTruthy();
        expect(response.content).toBeTruthy();
        expect(typeof response.content).toBe('string');
        expect(response.content.length).toBeGreaterThan(0);
        
        // Log the actual response for debugging
        console.log('✅ Real API Response:', response.content.substring(0, 100) + '...');
        
        if (response.metadata) {
          console.log('📊 Response Metadata:', response.metadata);
        }
        
        done();
      },
      error: (error) => {
        console.error('❌ API Error:', error);
        fail(`API call failed: ${error.message || error}`);
        done();
      }
    });
  }, 30000); // 30 second timeout for real API calls

  it('should handle different types of queries', (done) => {
    const queries = [
      'Generate test cases for user registration',
      'What are acceptance criteria for payment system?'
    ];
    
    let completedRequests = 0;
    const totalRequests = queries.length;

    queries.forEach((query, index) => {
      service.sendMessage(query).subscribe({
        next: (response) => {
          expect(response.content).toBeTruthy();
          expect(response.content.length).toBeGreaterThan(0);
          
          console.log(`✅ Query ${index + 1} Response:`, response.content.substring(0, 50) + '...');
          
          completedRequests++;
          if (completedRequests === totalRequests) {
            done();
          }
        },
        error: (error) => {
          console.error(`❌ Query ${index + 1} failed:`, error);
          fail(`Query ${index + 1} failed: ${error.message || error}`);
          done();
        }
      });
    });
  }, 60000); // 60 second timeout for multiple requests
});