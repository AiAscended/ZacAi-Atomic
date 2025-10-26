import { createElement, appendChildren } from '@atoms/dom';
import { formatDate } from '@atoms/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Create chat message element - Molecule component
 */
export const createChatMessage = (message: Message): HTMLElement => {
  const messageEl = createElement('div', `chat-message ${message.role}`);

  // Avatar
  const avatar = createElement('div', 'chat-message-avatar');
  avatar.textContent = message.role === 'user' ? '👤' : '🤖';

  // Content container
  const contentEl = createElement('div', 'chat-message-content');

  // Message text
  const textEl = createElement('div', 'chat-message-text');
  textEl.textContent = message.content;

  // Timestamp
  const timeEl = createElement('div', 'chat-message-time');
  timeEl.textContent = formatDate(message.timestamp);

  appendChildren(contentEl, textEl, timeEl);
  appendChildren(messageEl, avatar, contentEl);

  return messageEl;
};

/**
 * Create welcome message - Molecule component
 */
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
