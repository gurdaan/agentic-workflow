import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from '../src/app/services/api.service';
import { ChatRequest, ChatResponse } from '../src/app/models/chat.models';
import { environment } from '../src/environments/environment';

// Frontend API Service Tests - Testing communication with FastAPI backend
describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send message to /api/chat endpoint and receive response', () => {
    const testMessage = 'Create a user story for login feature';
    const mockResponse: ChatResponse = {
      content: 'As a user, I want to be able to log into the system so that I can access my personal dashboard.',
      metadata: {
        timestamp: new Date().toISOString(),
        processing_time: 1.5
      }
    };

    // Call the API service
    service.sendMessage(testMessage).subscribe(response => {
      expect(response.content).toBe(mockResponse.content);
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.metadata?.['processing_time']).toBe(1.5);
    });

    // Verify HTTP request format
    const expectedUrl = `${environment.apiConfig.baseUrl}${environment.apiConfig.endpoints.chat}`;
    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ query: testMessage });
    expect(req.request.headers.get('Content-Type')).toBe('application/json');

    req.flush(mockResponse);
  });

  it('should handle API errors (500 Internal Server Error)', () => {
    const testMessage = 'Test message';
    const mockErrorResponse = {
      status: 500,
      statusText: 'Internal Server Error'
    };

    service.sendMessage(testMessage).subscribe({
      next: () => fail('Should have failed with 500 error'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const expectedUrl = `${environment.apiConfig.baseUrl}${environment.apiConfig.endpoints.chat}`;
    const req = httpMock.expectOne(expectedUrl);
    req.flush('Server Error', mockErrorResponse);
  });

  it('should handle agent service not initialized (503)', () => {
    const testMessage = 'Test message';
    const mockErrorResponse = {
      status: 503,
      statusText: 'Service Unavailable'
    };

    service.sendMessage(testMessage).subscribe({
      next: () => fail('Should have failed with 503 error'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const expectedUrl = `${environment.apiConfig.baseUrl}${environment.apiConfig.endpoints.chat}`;
    const req = httpMock.expectOne(expectedUrl);
    req.flush('Agent service not initialized', mockErrorResponse);
  });
});