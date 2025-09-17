export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  [key: string]: boolean | string | number;
}

export interface ChatRequest {
  query: string;
}

export interface ChatResponse {
  content: string;
  metadata?: MessageMetadata;
}

export interface AppState {
  isDarkTheme: boolean;
  isLoading: boolean;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}
