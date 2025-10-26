import { ChatInterface } from '@organisms/chatInterface';

/**
 * Chat Page - Main page with AI chat interface
 */
export const renderChatPage = (container: HTMLElement): void => {
  container.innerHTML = `
    <div class="page-container">
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">AI Chat Assistant</h1>
          <p class="card-subtitle">Powered by atomic modular architecture</p>
        </div>
        <div id="chat-interface"></div>
      </div>
    </div>
  `;

  // Initialize chat interface
  new ChatInterface('chat-interface');
};
