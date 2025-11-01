import { createElement, appendChildren } from '@utils/dom';
import { formatDate } from '@utils/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const createChatMessage = (message: Message): HTMLElement => {
  const messageEl = createElement('div', `chat-message ${message.role}`);

  const avatar = createElement('div', 'chat-message-avatar');
  avatar.textContent = message.role === 'user' ? '👤' : '🤖';

  const contentEl = createElement('div', 'chat-message-content');
  const textEl = createElement('div', 'chat-message-text');
  textEl.textContent = message.content;

  const timeEl = createElement('div', 'chat-message-time');
  timeEl.textContent = formatDate(message.timestamp);

  appendChildren(contentEl, textEl, timeEl);
  appendChildren(messageEl, avatar, contentEl);

  return messageEl;
};

export const createWelcomeMessage = (): HTMLElement => {
  const welcome = createElement('div', 'welcome-message');

  const icon = createElement('div', 'welcome-message-icon');
  icon.textContent = '⚛️';

  const title = createElement('div', 'welcome-message-title');
  title.textContent = 'Welcome to ZacAi-Atomic';

  const text = createElement('div', 'welcome-message-text');
  text.textContent = 'Start a conversation with the AI assistant. Type your message below.';

  appendChildren(welcome, icon, title, text);
  return welcome;
};
