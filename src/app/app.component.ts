import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from './services/api.service';
import { Message, MessageMetadata, AppState } from './models/chat.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [ApiService],
  template: `
    <div class="app-container" [class.dark-theme]="appState.isDarkTheme">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <button class="new-chat-btn" (click)="startNewChat()" [title]="sidebarCollapsed ? 'New Chat' : ''">
            <span class="new-chat-icon">✨</span>
            <span class="new-chat-text">New Chat</span>
          </button>
          <button class="collapse-btn" (click)="toggleSidebar()">
            {{ sidebarCollapsed ? '→' : '←' }}
          </button>
        </div>
        
        <div class="chat-sessions-list" *ngIf="!sidebarCollapsed">
          <div class="sessions-header">
            <h3>Previous Chats</h3>
          </div>
          
          <div class="sessions-container">
            <div *ngFor="let session of chatSessions; trackBy: trackBySessionId" 
                 class="session-item"
                 [class.active]="isActiveSession(session)"
                 (click)="loadChatSession(session)">
              <div class="session-content">
                <div class="session-title">{{ getSessionTitle(session) }}</div>
                <div class="session-date">{{ formatSessionDate(session.last_modified) }}</div>
              </div>
              <button class="session-delete-btn" 
                      (click)="deleteSpecificSession(session, $event)"
                      title="Delete this chat">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-wrapper">
        <header class="header">
          <div class="header-content">
            <button class="mobile-menu-btn" (click)="toggleSidebar()">☰</button>
            <h1 class="title">Jonas AI Agent</h1>
            <div class="header-actions">
            
            </div>
          </div>
        </header>

        <main class="main-content">
          <div class="chat-container">
            <div class="messages-container" #messagesContainer>
            <div *ngIf="messages.length === 0" class="welcome-message">
              <div class="welcome-content">
                <div class="welcome-icon">🤖</div>
                <h2>Welcome to Jonas AI Agent</h2>
                <p>Your intelligent assistant for creating user stories, test cases, and more!</p>
                <div class="example-queries">
                  <button 
                    *ngFor="let example of exampleQueries" 
                    class="example-btn"
                    (click)="useExample(example)"
                  >
                    {{ example }}
                  </button>
                </div>
              </div>
            </div>
            
            <div *ngFor="let message of messages; trackBy: trackByMessageId" 
                 class="message" 
                 [class.user-message]="message.sender === 'user'"
                 [class.ai-message]="message.sender === 'ai'">
              <div class="message-content">
                <div class="message-avatar">
                  <span *ngIf="message.sender === 'user'">👤</span>
                  <span *ngIf="message.sender === 'ai'">🤖</span>
                </div>
                <div class="message-text">
                  <!-- Detection indicators -->
                  <div class="detection-indicators" *ngIf="message.sender === 'ai' && message.metadata">
                    <div class="detection-badge" *ngIf="isUserStory(message.metadata)">
                      ✓ User Story
                    </div>
                    <div class="detection-badge" *ngIf="isTestCase(message.metadata)">
                      ✓ Test Case
                    </div>
                    <div class="detection-badge" *ngIf="isDevTask(message.metadata)">
                      ✓ Dev Task
                    </div>
                  </div>
                  
                  <div class="message-bubble">
                    <!-- Editable content when user story, test case, or dev task is detected -->
                    <div *ngIf="message.sender === 'ai' && (isUserStory(message.metadata) || isTestCase(message.metadata) || isDevTask(message.metadata))" class="editable-content">
                      <textarea 
                        [(ngModel)]="message.content" 
                        class="editable-message-content"
                        rows="10"
                        placeholder="Edit the content and click 'Send Edited Content' to refine the response...">
                      </textarea>
                    </div>
                    
                    <!-- Regular non-editable content -->
                    <div *ngIf="!(message.sender === 'ai' && (isUserStory(message.metadata) || isTestCase(message.metadata) || isDevTask(message.metadata)))" 
                         class="message-body">
                      <pre class="markup-content">{{ convertToMarkup(message.content) }}</pre>
                    </div>
                    
                    <div class="message-actions" *ngIf="message.sender === 'ai' && hasEditableMetadata(message.metadata) && !isUserStory(message.metadata) && !isTestCase(message.metadata) && !isDevTask(message.metadata)">
                      <div class="metadata-dropdown">
                        <button class="metadata-toggle" (click)="toggleMetadata(message.id)" [class.active]="activeMetadataId === message.id">
                          ⋮
                        </button>
                        
                        <div class="metadata-menu" *ngIf="activeMetadataId === message.id">
                          <div class="metadata-item" *ngFor="let key of getEditableMetadataKeys(message.metadata)">
                            <label class="metadata-label">
                              <input 
                                type="checkbox" 
                                [checked]="message.metadata![key]"
                                (change)="updateMetadata(message.id, key, $event)"
                                class="metadata-checkbox"
                              >
                              {{ formatMetadataKey(key) }}
                            </label>
                          </div>
                          <button class="send-request-btn" (click)="sendUpdatedRequest(message)">
                            Send Request
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="message-time">
                      {{ formatTime(message.timestamp) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div *ngIf="appState.isLoading" class="message ai-message">
              <div class="message-content">
                <div class="message-avatar">🤖</div>
                <div class="message-text">
                  <div class="message-bubble typing">
                    <div class="generating-text">Generating response...</div>
                    <div class="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="errorMessage" class="error-message">
              <div class="error-content">
                <span>{{ errorMessage }}</span>
                <button (click)="clearError()">×</button>
              </div>
            </div>
            </div>

          <div class="input-container">
            <div class="input-wrapper">
              <textarea
                #messageInput
                [(ngModel)]="currentMessage"
                (keydown)="handleKeyDown($event)"
                (input)="adjustTextareaHeight()"
                placeholder="Ask Jonas AI Agent anything..."
                class="message-input"
                rows="1"
                [disabled]="appState.isLoading"
                maxlength="2000"
              ></textarea>
              <div class="input-actions">
                <div class="char-count" [class.warning]="currentMessage.length > 1800">
                  {{ currentMessage.length }}/2000
                </div>
                <button
                  (click)="sendMessage()"
                  [disabled]="!canSendMessage()"
                  class="send-button"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="isLoading" class="loading-spinner">Loading...</div>
        </div>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;
  
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  messages: Message[] = [];
  currentMessage = '';
  errorMessage = '';
  activeMetadataId: string | null = null;
  currentSessionBlobName: string | null = null;
  chatSessions: any[] = [];
  sidebarCollapsed: boolean = false;
  
  appState: AppState = {
    isDarkTheme: true,
    isLoading: false
  };

  exampleQueries = [
    'Create user story for login feature',
    'Generate test cases for user registration',
    'Write acceptance criteria for payment process',
    'Create user story for dashboard analytics'
  ];

  isLoading: boolean = false; // Track loading state
  responseText: string = ''; // Editable response text

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('jonas-ai-theme');
    if (savedTheme) {
      this.appState.isDarkTheme = savedTheme === 'dark';
    }

    // Load saved chat data if available
    this.loadChatData();

    // Add beforeunload event listener to save chat before page unload
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Remove beforeunload event listener
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  sendMessage(): void {
    if (!this.canSendMessage()) return;

    const userMessage: Message = {
      id: this.generateId(),
      content: this.currentMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Check if this is the first message in the chat
    const isFirstMessage = this.messages.length === 0;
    const firstUserMessage = isFirstMessage ? userMessage.content : null;

    this.messages.push(userMessage);
    const messageText = this.currentMessage;
    this.currentMessage = '';
    this.adjustTextareaHeight();
    this.appState.isLoading = true;
    this.clearError();
    this.shouldScrollToBottom = true;

    this.apiService.sendMessage(messageText)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const aiMessage: Message = {
            id: this.generateId(),
            content: response.content,
            sender: 'ai',
            timestamp: new Date(),
            metadata: response.metadata
          };
          
          this.messages.push(aiMessage);
          this.appState.isLoading = false;
          this.shouldScrollToBottom = true;
          
          // Update the session title with the first user message
          if (isFirstMessage && firstUserMessage && this.currentSessionBlobName) {
            const sessionIndex = this.chatSessions.findIndex(s => 
              s.blob_name === this.currentSessionBlobName || s.session_id === this.currentSessionBlobName
            );
            if (sessionIndex !== -1) {
              this.chatSessions[sessionIndex].first_user_message = firstUserMessage;
              this.chatSessions[sessionIndex].is_new_chat = false; // Remove new chat flag
            }
          }
        },
        error: (error) => {
          this.appState.isLoading = false;
          this.errorMessage = error.message || 'Failed to send message. Please try again.';
          console.error('API Error:', error);
        }
      });
  }

  useExample(example: string): void {
    this.currentMessage = example;
    this.adjustTextareaHeight();
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 0);
  }

  hasEditableMetadata(metadata?: MessageMetadata): boolean {
    if (!metadata) return false;
    return Object.keys(metadata).some(key => typeof metadata[key] === 'boolean' && metadata[key] === true);
  }

  getEditableMetadataKeys(metadata?: MessageMetadata): string[] {
    if (!metadata) return [];
    return Object.keys(metadata).filter(key => typeof metadata[key] === 'boolean');
  }

  toggleMetadata(messageId: string): void {
    this.activeMetadataId = this.activeMetadataId === messageId ? null : messageId;
  }

  updateMetadata(messageId: string, key: string, event: any): void {
    const message = this.messages.find(m => m.id === messageId);
    if (message && message.metadata) {
      message.metadata[key] = event.target.checked;
    }
  }

  isUserStory(metadata?: MessageMetadata): boolean {
    if (!metadata) return false;
    // Check for different possible property names
    return !!(metadata['Userstory'] || metadata['userstory'] || metadata['UserStory'] || metadata['user_story']);
  }

  isTestCase(metadata?: MessageMetadata): boolean {
    if (!metadata) return false;
    // Check for different possible property names
    return !!(metadata['Testcase'] || metadata['testcase'] || metadata['TestCase'] || metadata['test_case']);
  }

  isDevTask(metadata?: MessageMetadata): boolean {
    if (!metadata) return false;
    // Check for different possible property names
    return !!(metadata['Devtask'] || metadata['devtask'] || metadata['DevTask'] || metadata['dev_task']);
  }

  sendUpdatedRequest(message: Message): void {
    let updatedQuery = 'Update the previous response with the following preferences:\n';
    
    if (message.metadata) {
      Object.keys(message.metadata).forEach(key => {
        if (typeof message.metadata![key] === 'boolean') {
          updatedQuery += `- ${this.formatMetadataKey(key)}: ${message.metadata![key] ? 'Yes' : 'No'}\n`;
        }
      });
    }

    this.currentMessage = updatedQuery;
    this.sendMessage();
    this.activeMetadataId = null;
  }

  formatMetadataKey(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  adjustTextareaHeight(): void {
    const textarea = this.messageInput?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 120;
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    }
  }

  canSendMessage(): boolean {
    return this.currentMessage.trim().length > 0 && !this.appState.isLoading;
  }

  toggleTheme(): void {
    this.appState.isDarkTheme = !this.appState.isDarkTheme;
    localStorage.setItem('jonas-ai-theme', this.appState.isDarkTheme ? 'dark' : 'light');
  }

  clearError(): void {
    this.errorMessage = '';
  }

  deleteChatHistory(): void {
    console.log('Delete chat history called. Current session blob name:', this.currentSessionBlobName);
    
    if (!this.currentSessionBlobName) {
      console.warn('No session blob name found, only clearing local messages');
      this.messages = [];
      return;
    }

    const confirmDelete = confirm('Are you sure you want to delete the entire chat history? This action cannot be undone.');
    
    if (confirmDelete) {
      console.log('Attempting to delete session:', this.currentSessionBlobName);
      
      this.apiService.deleteChatSession(this.currentSessionBlobName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Chat session deleted successfully:', response);
            this.messages = [];
            this.currentSessionBlobName = null;
            this.clearError();
            
            // Show success message
            alert('Chat history deleted successfully!');
          },
          error: (error) => {
            console.error('Failed to delete chat session:', error);
            console.error('Error details:', error.error);
            this.errorMessage = `Failed to delete chat history: ${error.message}`;
            
            // If the error is 404, it might mean the session was already deleted
            if (error.status === 404) {
              console.log('Session not found on server, clearing local messages anyway');
              this.messages = [];
              this.currentSessionBlobName = null;
              this.clearError();
              alert('Chat history cleared (session not found on server).');
            }
          }
        });
    }
  }

  formatMessageContent(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  convertToMarkup(content: string): string {
    // First, check if content contains HTML tags
    const hasHtmlTags = /<[^>]+>/.test(content);
    
    if (hasHtmlTags) {
      // Create a temporary div to parse HTML and convert to markup
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Use a simpler approach - just extract text and convert common HTML patterns
      let markupText = this.simpleHtmlToMarkup(content);
      
      // Clean up extra whitespace
      markupText = markupText
        .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove excessive line breaks
        .replace(/\s+/g, ' ')              // Replace multiple spaces with single space
        .trim();
      
      return markupText;
    } else {
      // If no HTML tags, return as-is (already plain text/markup)
      return content;
    }
  }

  private simpleHtmlToMarkup(html: string): string {
    return html
      // Convert headers
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      
      // Convert formatting
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      
      // Convert paragraphs
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      
      // Convert line breaks
      .replace(/<br[^>]*\/?>/gi, '\n')
      .replace(/<hr[^>]*\/?>/gi, '\n---\n\n')
      
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, '')
      
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"');
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  handleBeforeUnload(event: BeforeUnloadEvent): void {
    // Save chat data before page unload
    this.saveChatData();
  }

  async saveChatData(): Promise<void> {
    try {
      // Save chat messages to localStorage as a backup
      const chatData = {
        messages: this.messages,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('jonas-ai-chat-backup', JSON.stringify(chatData));

      // Also try to send to the API if available
      if (this.messages.length > 0) {
        await fetch('http://0.0.0.0:8000/api/save-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(chatData)
        }).catch(error => {
          console.warn('Failed to save chat to server:', error);
        });
      }
    } catch (error) {
      console.error('Error saving chat data:', error);
    }
  }

  refreshChatSessions(): void {
    console.log('Refreshing chat sessions list...');
    
    this.apiService.getChatSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (data: any) => {
          console.log('Chat sessions refreshed:', data);
          
          if (data.sessions && Array.isArray(data.sessions)) {
            // Preserve local session data (first_user_message, is_new_chat) when refreshing
            const newSessions = await Promise.all(data.sessions.map(async (serverSession: any) => {
              // Find existing session in our local array
              const existingSession = this.chatSessions.find(localSession => 
                localSession.session_id === serverSession.session_id || 
                localSession.blob_name === serverSession.blob_name
              );
              
              // If we have local data for this session, preserve it
              if (existingSession && existingSession.first_user_message) {
                return {
                  ...serverSession,
                  first_user_message: existingSession.first_user_message,
                  is_new_chat: existingSession.is_new_chat
                };
              }
              
              // If no local data, try to extract first user message from session history
              const sessionWithFirstMessage = await this.extractFirstUserMessage(serverSession);
              return sessionWithFirstMessage;
            }));
            
            // Ensure new chats (marked with is_new_chat) appear at the top
            newSessions.sort((a, b) => {
              // New chats first
              if (a.is_new_chat && !b.is_new_chat) return -1;
              if (!a.is_new_chat && b.is_new_chat) return 1;
              
              // Then sort by last_modified for other sessions
              const dateA = new Date(a.last_modified || 0);
              const dateB = new Date(b.last_modified || 0);
              return dateB.getTime() - dateA.getTime();
            });
            
            this.chatSessions = newSessions;
            console.log('Updated chatSessions array:', this.chatSessions);
            console.log('Current session blob name:', this.currentSessionBlobName);
          } else {
            console.log('No chat sessions found');
            this.chatSessions = [];
          }
        },
        error: (error) => {
          console.warn('Failed to refresh chat sessions:', error);
        }
      });
  }

  private async extractFirstUserMessage(session: any): Promise<any> {
    try {
      const blobName = session.blob_name || session.session_id;
      if (!blobName) return session;

      const sessionData = await this.apiService.getChatSession(blobName).toPromise();
      
      if (sessionData && sessionData.chat_history && Array.isArray(sessionData.chat_history)) {
        // Find the first user message
        const firstUserHistoryItem = sessionData.chat_history.find((item: any) => 
          item.role === 'AuthorRole.USER' && item.content && item.content.trim()
        );
        
        if (firstUserHistoryItem) {
          return {
            ...session,
            first_user_message: firstUserHistoryItem.content.trim()
          };
        }
      }
      
      return session;
    } catch (error) {
      console.warn('Failed to extract first user message for session:', session.session_id, error);
      return session;
    }
  }

  loadChatData(): void {
    console.log('Loading chat data...');
    
    this.apiService.getChatSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (data: any) => {
          console.log('Chat sessions response:', data);
          
          if (data.sessions && Array.isArray(data.sessions)) {
            // Extract first user messages for all sessions on initial load
            const sessionsWithTitles = await Promise.all(data.sessions.map(async (session: any) => {
              return await this.extractFirstUserMessage(session);
            }));
            
            // Store all sessions for the sidebar
            this.chatSessions = sessionsWithTitles;
            
            if (sessionsWithTitles.length > 0) {
              // Get the most recent session
              const mostRecentSession = sessionsWithTitles[0];
              const blobName = mostRecentSession.blob_name || mostRecentSession.session_id;
              
              console.log('Most recent session:', mostRecentSession);
              console.log('Extracted blob name:', blobName);
              
              if (blobName) {
                this.currentSessionBlobName = blobName;
                console.log('Set currentSessionBlobName to:', this.currentSessionBlobName);
                this.loadSpecificSession(blobName);
              }
            }
          } else {
            console.log('No chat sessions found');
            this.chatSessions = [];
          }
        },
        error: (error) => {
          console.warn('Failed to load chat sessions:', error);
          this.chatSessions = [];
        }
      });
  }

  private loadSpecificSession(blobName: string): void {
    this.apiService.getChatSession(blobName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessionData: any) => {
          console.log('Session data received:', sessionData);
          
          if (sessionData && sessionData.chat_history && Array.isArray(sessionData.chat_history)) {
            const messages: Message[] = [];
            
            sessionData.chat_history.forEach((historyItem: any, index: number) => {
              // Skip system messages
              if (historyItem.role === 'AuthorRole.SYSTEM') {
                return;
              }
              
              let sender: 'user' | 'ai' = 'ai';
              let content = historyItem.content || '';
              
              if (historyItem.role === 'AuthorRole.USER') {
                sender = 'user';
              } else if (historyItem.role === 'AuthorRole.ASSISTANT') {
                sender = 'ai';
                
                // Parse JSON content if it's a JSON response
                if (content.startsWith('```json') && content.endsWith('```')) {
                  try {
                    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
                    if (jsonMatch && jsonMatch[1]) {
                      const parsedContent = JSON.parse(jsonMatch[1]);
                      content = parsedContent.content || content;
                    }
                  } catch (e) {
                    console.warn('Failed to parse JSON content:', e);
                  }
                }
              } else if (historyItem.role === 'AuthorRole.TOOL') {
                return; // Skip tool messages
              }
              
              if (content.trim()) {
                messages.push({
                  id: `msg_${sessionData.session_id}_${index}`,
                  content: content,
                  sender: sender,
                  timestamp: historyItem.timestamp ? new Date(historyItem.timestamp) : new Date(),
                  metadata: undefined
                });
              }
            });
            
            console.log(`Loaded ${messages.length} messages from chat history`);
            
            // Always set messages, even if empty (important for new chats)
            this.messages = messages;
            if (messages.length > 0) {
              this.shouldScrollToBottom = true;
            }
          } else {
            // No chat history found, clear messages (important for new chats)
            console.log('No chat history found, clearing messages');
            this.messages = [];
          }
        },
        error: (error) => {
          console.warn('Failed to load specific session:', error);
        }
      });
  }

  private loadChatDataFromLocalStorage(): void {
    try {
      const savedChatData = localStorage.getItem('jonas-ai-chat-backup');
      if (savedChatData) {
        const chatData = JSON.parse(savedChatData);
        // Only load if the data is from today (to avoid loading very old conversations)
        const savedDate = new Date(chatData.timestamp);
        const today = new Date();
        const isFromToday = savedDate.toDateString() === today.toDateString();
        
        if (isFromToday && chatData.messages && Array.isArray(chatData.messages)) {
          this.messages = chatData.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp) // Convert timestamp back to Date object
          }));
          this.shouldScrollToBottom = true;
        }
      }
    } catch (error) {
      console.error('Error loading chat data from localStorage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  sendUpdatedResponse(): void {
    if (!this.responseText.trim()) return;

    const updatedMessage: Message = {
      id: this.generateId(),
      content: this.responseText.trim(),
      sender: 'ai',
      timestamp: new Date()
    };

    this.messages.push(updatedMessage);
    this.responseText = '';
    this.shouldScrollToBottom = true;

    // Optionally, you can also send this updated response to the server
    this.apiService.sendMessage(updatedMessage.content)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Handle any additional logic after sending the updated response
        },
        error: (error) => {
          console.error('API Error on updated response:', error);
        }
      });
  }

  // Sidebar functionality
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  startNewChat(): void {
    console.log('Creating new chat session...');
    console.log('Current session before new chat:', this.currentSessionBlobName);
    console.log('Current messages count:', this.messages.length);
    
    // Save current session if it has messages before creating new one
    const saveAndCreateNew = () => {
      this.apiService.createNewSession()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('New session created:', response);
            if (response.success) {
              console.log('New session ID:', response.session_id);
              
              // Clear current messages
              this.messages = [];
              this.currentSessionBlobName = response.session_id;
              this.clearError();
              
              // Add temporary new chat entry to the sidebar with bot icon
              const newChatEntry = {
                session_id: response.session_id,
                blob_name: response.session_id,
                is_new_chat: true,
                last_modified: new Date().toISOString()
              };
              
              // Add to the beginning of the sessions list
              this.chatSessions.unshift(newChatEntry);
              
              // Refresh the sessions list to get updated data from server
              // Add a small delay to ensure the backend has processed the new session
              setTimeout(() => {
                this.refreshChatSessions();
              }, 500);
            } else {
              this.errorMessage = response.message || 'Failed to create new session';
            }
          },
          error: (error) => {
            console.error('Failed to create new session:', error);
            this.errorMessage = 'Failed to create new session. Please try again.';
          }
        });
    };

    // If there are messages in current session, save first
    if (this.messages.length > 0 && this.currentSessionBlobName) {
      console.log('Saving current session before creating new one...');
      this.apiService.saveCurrentChat()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (saveResponse) => {
            console.log('Current session saved:', saveResponse);
            saveAndCreateNew();
          },
          error: (error) => {
            console.warn('Failed to save current session, proceeding anyway:', error);
            saveAndCreateNew();
          }
        });
    } else {
      saveAndCreateNew();
    }
  }

  loadChatSession(session: any): void {
    // Use session_id for switching, blob_name for loading data
    const sessionId = session.session_id;
    const blobName = session.blob_name || session.session_id;
    
    if (sessionId && sessionId !== this.currentSessionBlobName) {
      console.log('Switching to session:', sessionId);
      console.log('Will load data from blob:', blobName);
      
      // If this is a new chat, just clear messages and set session without API call
      if (session.is_new_chat) {
        console.log('Loading new chat, clearing messages');
        this.currentSessionBlobName = sessionId;
        this.messages = [];
        this.clearError();
        return;
      }
      
      this.apiService.switchSession(sessionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Session switched successfully:', response);
            if (response.success) {
              this.currentSessionBlobName = sessionId;
              // Load the session data using the blob name
              this.loadSpecificSession(blobName);
            } else {
              this.errorMessage = response.message || 'Failed to switch session';
            }
          },
          error: (error) => {
            console.error('Failed to switch session:', error);
            this.errorMessage = 'Failed to switch session. Please try again.';
          }
        });
    }
  }

  deleteSpecificSession(session: any, event: Event): void {
    event.stopPropagation(); // Prevent loading the session when clicking delete
    
    const blobName = session.blob_name || session.session_id;
    const confirmDelete = confirm(`Are you sure you want to delete this chat session?`);
    
    if (confirmDelete && blobName) {
      this.apiService.deleteChatSession(blobName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Chat session deleted successfully:', response);
            
            // Remove from local sessions list
            this.chatSessions = this.chatSessions.filter(s => 
              (s.blob_name || s.session_id) !== blobName
            );
            
            // If this was the current session, clear messages and load another
            const sessionId = session.session_id;
            const isCurrentSession = sessionId === this.currentSessionBlobName || 
                                   blobName === this.currentSessionBlobName ||
                                   (blobName && blobName.replace('.json', '') === this.currentSessionBlobName);
                                   
            if (isCurrentSession) {
              this.messages = [];
              this.currentSessionBlobName = null;
              
              // Load the next available session if any
              if (this.chatSessions.length > 0) {
                this.loadChatSession(this.chatSessions[0]);
              }
            }
          },
          error: (error) => {
            console.error('Failed to delete chat session:', error);
            this.errorMessage = 'Failed to delete chat session. Please try again.';
          }
        });
    }
  }

  deleteCurrentSession(): void {
    if (this.currentSessionBlobName) {
      const currentSession = this.chatSessions.find(s => 
        (s.blob_name || s.session_id) === this.currentSessionBlobName
      );
      if (currentSession) {
        this.deleteSpecificSession(currentSession, new Event('click'));
      }
    }
  }

  getSessionTitle(session: any): string {
    // If session has first_user_message, use it as title
    if (session.first_user_message) {
      // Truncate long messages and clean them up
      let title = session.first_user_message.trim();
      if (title.length > 50) {
        title = title.substring(0, 50) + '...';
      }
      return title;
    }
    
    // For new chats without user messages, show bot icon (only if explicitly marked as new)
    if (session.is_new_chat) {
      return '🤖 New Chat';
    }
    
    // Try to extract a meaningful title from the session
    if (session.title) return session.title;
    if (session.session_id) {
      // Handle various session ID patterns
      let sessionId = session.session_id;
      
      // Pattern for auto-generated session names like "Chat_09_16_11_11"
      const chatPattern = sessionId.match(/Chat_(\d{2})_(\d{2})_(\d{2})_(\d{2})/);
      if (chatPattern) {
        const [, month, day, hour, minute] = chatPattern;
        return `Chat ${month}/${day} ${hour}:${minute}`;
      }
      
      // Pattern for blob-based session names like "chat_session_20250916_111100"
      const blobPattern = sessionId.match(/chat_session_(\d{8})_(\d{6})/);
      if (blobPattern) {
        const date = blobPattern[1];
        const time = blobPattern[2];
        return `Chat ${date.slice(4,6)}/${date.slice(6,8)} ${time.slice(0,2)}:${time.slice(2,4)}`;
      }
      
      // Clean up underscores and return a readable version
      return sessionId.replace(/_/g, ' ').replace(/chat session/i, 'Chat');
    }
    return '🤖 New Chat';
  }

  formatSessionDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  }

  trackBySessionId(index: number, session: any): string {
    return session.session_id || session.blob_name || index.toString();
  }

  isActiveSession(session: any): boolean {
    // Check if this session is currently active
    // currentSessionBlobName might be a session_id or blob_name
    return session.session_id === this.currentSessionBlobName || 
           session.blob_name === this.currentSessionBlobName ||
           (session.blob_name && session.blob_name.replace('.json', '') === this.currentSessionBlobName);
  }
}
