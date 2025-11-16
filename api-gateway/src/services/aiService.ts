import axios from 'axios';
import type { ChatRequest } from '../types/index.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export class AIService {
  async chat(request: ChatRequest) {
    const response = await axios.post(`${AI_SERVICE_URL}/v1/chat`, request);
    return response.data;
  }
}

export const aiService = new AIService();
