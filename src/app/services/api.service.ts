import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, timeout, switchMap } from 'rxjs/operators';
import { ChatRequest, ChatResponse, CompanyInfo } from '../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'http://0.0.0.0:8000/api/chat';
  private readonly CHAT_SESSIONS_URL = 'http://0.0.0.0:8000/api/chat-sessions';
  private readonly SESSIONS_URL = 'http://0.0.0.0:8000/api/sessions';
  private readonly SAVE_CHAT_URL = 'http://0.0.0.0:8000/api/save-chat';
  private readonly COMPANY_INFO_URL = 'http://0.0.0.0:8000/api/company-info';
  private readonly TIMEOUT_MS = 60000; // Increased timeout to 60 seconds

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatResponse> {
    const request: ChatRequest = { query: message };
    
    return this.http.post<ChatResponse>(this.API_URL, request)
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError(this.handleError)
      );
  }

  getChatSessions(): Observable<any> {
    return this.http.get<any>(this.CHAT_SESSIONS_URL)
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError(this.handleError)
      );
  }

  getChatSession(blobName: string): Observable<any> {
    console.log('API Service: Getting chat session with blob name:', blobName);
    // URL encode the blob name to handle special characters
    const encodedBlobName = encodeURIComponent(blobName);
    const getUrl = `${this.CHAT_SESSIONS_URL}/${encodedBlobName}`;
    console.log('API Service: GET URL:', getUrl);
    
    return this.http.get<any>(getUrl)
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError(this.handleError)
      );
  }

  deleteChatSession(blobName: string): Observable<any> {
    console.log('API Service: Deleting chat session with blob name:', blobName);
    // URL encode the blob name to handle special characters
    const encodedBlobName = encodeURIComponent(blobName);
    const deleteUrl = `${this.CHAT_SESSIONS_URL}/${encodedBlobName}`;
    console.log('API Service: DELETE URL:', deleteUrl);
    
    return this.http.delete<any>(deleteUrl)
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError(this.handleError)
      );
  }

  // Session Management Methods
  createNewSession(sessionName?: string): Observable<any> {
    console.log('API Service: Creating new session with name:', sessionName);
    const request = { session_name: sessionName };
    
    return this.http.post<any>(`${this.SESSIONS_URL}/new`, request)
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError(this.handleError)
      );
  }

  switchSession(sessionId: string): Observable<any> {
    console.log('API Service: Switching to session:', sessionId);
    const request = { session_id: sessionId };
    
    return this.http.post<any>(`${this.SESSIONS_URL}/switch`, request)
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError(this.handleError)
      );
  }

  getCurrentSession(): Observable<any> {
    console.log('API Service: Getting current session info');
    
    return this.http.get<any>(`${this.SESSIONS_URL}/current`)
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError(this.handleError)
      );
  }

  saveCurrentChat(): Observable<any> {
    console.log('API Service: Saving current chat');
    
    return this.http.post<any>(this.SAVE_CHAT_URL, {})
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError(this.handleError)
      );
  }

  deleteAllChatSessions(): Observable<any> {
    console.log('API Service: Deleting all chat sessions');
    return this.getChatSessions().pipe(
      switchMap((sessionsResponse: any) => {
        if (!sessionsResponse.sessions || sessionsResponse.sessions.length === 0) {
          return of({ success: true, message: 'No sessions to delete' });
        }

        const deleteObservables = sessionsResponse.sessions.map((session: any) => {
          const blobName = session.blob_name || session.session_id;
          return this.deleteChatSession(blobName);
        });

        return forkJoin(deleteObservables);
      }),
      catchError(this.handleError)
    );
  }

  getCompanyInfo(): Observable<CompanyInfo> {
    console.log('API Service: Getting company information');
    
    // For development, return mock data if API is not available
    const mockCompanyInfo: CompanyInfo = {
      name: 'Jonas AI Solutions',
      address: '123 AI Technology Drive, Suite 456, Tech City, TC 12345',
      phone: '+1-555-JONAS-AI',
      email: 'contact@jonasai.com'
    };

    return this.http.get<CompanyInfo>(this.COMPANY_INFO_URL)
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError((error) => {
          console.warn('Company info API not available, using mock data');
          return of(mockCompanyInfo);
        })
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check if the API is running.';
          break;
        case 400:
          errorMessage = 'Bad request. Please check your input.';
          break;
        case 404:
          errorMessage = 'API endpoint not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}