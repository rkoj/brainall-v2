/**
 * BrainAll V2 API Client
 * Connects to backend API Gateway
 */

const API_BASE_URL = '/api';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  use_rag?: boolean;
}

export interface ChatResponse {
  response: string;
  model: string;
  sources?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${this.baseURL}/conversations`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    return response.json();
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`${this.baseURL}/conversations/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    return response.json();
  }

  async createConversation(title: string): Promise<Conversation> {
    const response = await fetch(`${this.baseURL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteConversation(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/conversations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
  }

  async health(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }
}

export const apiClient = new APIClient();
