import { createElement, addListener } from '@atoms/dom';

export interface ChatInputOptions {
  placeholder?: string;
  onSend: (message: string) => void;
  disabled?: boolean;
}

/**
 * Create chat input component - Molecule component
 */
export const createChatInput = (options: ChatInputOptions): HTMLElement => {
  const container = createElement('div', 'chat-input-container');

  // Textarea
  const textarea = createElement('textarea', 'chat-input') as HTMLTextAreaElement;
  textarea.placeholder = options.placeholder || 'Type your message...';
  textarea.rows = 1;
  if (options.disabled) textarea.disabled = true;

  // Auto-resize textarea
  const autoResize = () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

  addListener(textarea, 'input', autoResize);

  // Send button
  const sendButton = createElement('button', 'btn btn-primary');
  sendButton.textContent = 'Send';
  if (options.disabled) (sendButton as HTMLButtonElement).disabled = true;

  const handleSend = () => {
    const message = textarea.value.trim();
    if (message) {
      options.onSend(message);
      textarea.value = '';
      textarea.style.height = 'auto';
      textarea.focus();
    }
  };

  addListener(sendButton, 'click', handleSend);

  // Handle Enter key (Shift+Enter for new line)
  addListener(textarea, 'keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  container.appendChild(textarea);
  container.appendChild(sendButton);

  return container;
};

/**
 * Update chat input state - Molecule function
 */
export const updateChatInputState = (
  container: HTMLElement,
  disabled: boolean,
  loadingText?: string
): void => {
  const textarea = container.querySelector('textarea');
  const button = container.querySelector('button');

  if (textarea) {
    textarea.disabled = disabled;
    if (disabled && loadingText) {
      textarea.placeholder = loadingText;
    }
  }

  if (button) {
    (button as HTMLButtonElement).disabled = disabled;
    button.textContent = disabled && loadingText ? loadingText : 'Send';
  }
};
