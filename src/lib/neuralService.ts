import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';

export type AIProvider = 'gemini' | 'claude' | 'ollama' | 'openclaw';

interface AIResponse {
  content: string;
  provider: AIProvider;
}

export class NeuralService {
  private static gemini: GoogleGenAI | null = null;
  private static claude: Anthropic | null = null;

  static initialize(credentials: Record<string, string>) {
    if (credentials['GEMINI_API_KEY']) {
      this.gemini = new GoogleGenAI(credentials['GEMINI_API_KEY']);
    }
    if (credentials['CLAUDE_API_KEY']) {
      this.claude = new Anthropic({ apiKey: credentials['CLAUDE_API_KEY'] });
    }
  }

  static async generate(prompt: string, provider: AIProvider = 'gemini'): Promise<AIResponse> {
    try {
      switch (provider) {
        case 'gemini':
          if (!this.gemini) throw new Error('Gemini not configured');
          const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContent(prompt);
          return { content: result.response.text(), provider: 'gemini' };

        case 'claude':
          if (!this.claude) throw new Error('Claude not configured');
          const msg = await this.claude.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
          });
          return { 
            content: msg.content[0].type === 'text' ? msg.content[0].text : 'Binary payload received', 
            provider: 'claude' 
          };

        case 'ollama':
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            body: JSON.stringify({
              model: 'llama3',
              prompt,
              stream: false
            })
          });
          if (!response.ok) throw new Error('Ollama connection failed');
          const data = await response.json();
          return { content: data.response, provider: 'ollama' };

        case 'openclaw':
          // Mock OpenClaw integration - usually a proxy or specialized endpoint
          return { 
            content: `[OpenClaw Analysis] Processing request: ${prompt.substring(0, 50)}... 
            
OpenClaw is currently running in Emulation Mode. Please verify your local OpenClaw gateway is active if you expect a live stream response.`,
            provider: 'openclaw'
          };

        default:
          throw new Error('Unsupported provider');
      }
    } catch (error) {
      console.error(`AI Error (${provider}):`, error);
      throw error;
    }
  }
}
