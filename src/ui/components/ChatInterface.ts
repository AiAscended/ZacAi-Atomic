import { createElement, appendChildren } from '@utils/dom';
import { generateId } from '@utils/utils';
import { getFromStorage, setToStorage } from '@utils/storage';
import { createChatMessage, createWelcomeMessage, type Message } from './ChatMessage';
import { createChatInput, updateChatInputState } from './ChatInput';

const STORAGE_KEY = 'zacai-chat-messages';

export class ChatInterface {
  private container: HTMLElement;
  private messagesContainer: HTMLElement;
  private inputContainer: HTMLElement;
  private messages: Message[] = [];

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.body;
    this.messagesContainer = createElement('div', 'chat-messages');
    this.inputContainer = createElement('div');

    this.loadMessages();
    this.render();
  }

  private loadMessages(): void {
    const stored = getFromStorage<Message[]>(STORAGE_KEY, []);
    this.messages = (stored as Message[]).map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  }

  private saveMessages(): void {
    setToStorage(STORAGE_KEY, this.messages);
  }

  private render(): void {
    this.container.innerHTML = '';

    const chatContainer = createElement('div', 'chat-container');

    this.messagesContainer.innerHTML = '';
    if (this.messages.length === 0) {
      this.messagesContainer.appendChild(createWelcomeMessage());
    } else {
      this.messages.forEach((message) => {
        this.messagesContainer.appendChild(createChatMessage(message));
      });
    }

    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 0);

    this.inputContainer.innerHTML = '';
    const input = createChatInput({
      placeholder: 'Type your message...',
      onSend: (content) => this.handleSendMessage(content),
    });
    this.inputContainer.appendChild(input);

    appendChildren(chatContainer, this.messagesContainer, this.inputContainer);
    this.container.appendChild(chatContainer);
  }

  private async handleSendMessage(content: string): Promise<void> {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    this.messages.push(userMessage);
    this.saveMessages();
    this.render();

    updateChatInputState(this.inputContainer, true, 'AI is thinking...');

    await this.simulateAIResponse(content);

    this.render();
  }

  private async simulateAIResponse(userMessage: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const responses = [
      `I understand you said: "${userMessage}". As an AI assistant, I'm here to help you with atomic modular functions.`,
      `That's an interesting point about "${userMessage}". Let me process that with my modular AI architecture.`,
      `Thanks for sharing "${userMessage}". I'm using atomic design principles to provide the best response.`,
      `I've analyzed your message "${userMessage}" using my hybrid ecosystem of modular functions.`,
    ];

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
    };

    this.messages.push(assistantMessage);
    this.saveMessages();
    this.render();
  }

  public clearMessages(): void {
    this.messages = [];
    this.saveMessages();
    this.render();
  }

  public getMessageCount(): number {
    return this.messages.length;
  }
}
