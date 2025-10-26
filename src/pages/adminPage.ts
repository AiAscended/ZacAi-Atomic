import { createElement, appendChildren } from '@atoms/dom';
import { getFromStorage } from '@atoms/storage';

/**
 * Admin Page - Configuration and statistics
 */
export const renderAdminPage = (container: HTMLElement): void => {
  container.innerHTML = '';

  const pageContainer = createElement('div', 'page-container');

  // Page header
  const header = createElement('div', 'card');
  header.innerHTML = `
    <div class="card-header">
      <h1 class="card-title">Admin Dashboard</h1>
      <p class="card-subtitle">Manage your AI application settings and view statistics</p>
    </div>
  `;

  // Statistics section
  const statsSection = createElement('div', 'admin-grid');

  // Get message count from storage
  const messages = getFromStorage<unknown[]>('zacai-chat-messages', []);

  const stats = [
    { label: 'Total Messages', value: messages.length.toString() },
    { label: 'Active Sessions', value: '1' },
    { label: 'AI Model Version', value: '1.0.0' },
    { label: 'System Status', value: 'Online' },
  ];

  stats.forEach((stat) => {
    const statCard = createElement('div', 'stat-card');
    statCard.innerHTML = `
      <div class="stat-value">${stat.value}</div>
      <div class="stat-label">${stat.label}</div>
    `;
    statsSection.appendChild(statCard);
  });

  // Settings section
  const settingsSection = createElement('div', 'card');
  settingsSection.innerHTML = `
    <div class="card-header">
      <h2 class="card-title">AI Model Settings</h2>
    </div>
    <div class="settings-group">
      <h3 class="settings-group-title">Model Configuration</h3>
      <div class="form-group">
        <label class="form-label" for="model-select">AI Model</label>
        <select id="model-select" class="form-select">
          <option value="atomic-v1">Atomic AI v1.0</option>
          <option value="atomic-v2">Atomic AI v2.0 (Beta)</option>
          <option value="hybrid">Hybrid Model</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="temperature">Temperature (Creativity)</label>
        <input type="range" id="temperature" class="form-input" min="0" max="1" step="0.1" value="0.7">
      </div>
      <div class="form-group">
        <label class="form-label" for="max-tokens">Max Response Length</label>
        <input type="number" id="max-tokens" class="form-input" min="50" max="2000" value="500">
      </div>
    </div>
    <div class="settings-group">
      <h3 class="settings-group-title">System Configuration</h3>
      <div class="form-group">
        <label class="form-label" for="api-endpoint">API Endpoint</label>
        <input type="text" id="api-endpoint" class="form-input" value="https://api.zacai-atomic.com" placeholder="Enter API endpoint">
      </div>
      <div class="form-group">
        <label class="form-label" for="timeout">Request Timeout (seconds)</label>
        <input type="number" id="timeout" class="form-input" min="5" max="60" value="30">
      </div>
    </div>
    <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-lg);">
      <button class="btn btn-primary" id="save-settings">Save Settings</button>
      <button class="btn btn-secondary" id="reset-settings">Reset to Default</button>
    </div>
  `;

  // Add event listeners for settings
  setTimeout(() => {
    const saveButton = document.getElementById('save-settings');
    const resetButton = document.getElementById('reset-settings');

    if (saveButton) {
      saveButton.addEventListener('click', () => {
        alert('Settings saved successfully! (This is a demo)');
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        alert('Settings reset to default values! (This is a demo)');
      });
    }
  }, 0);

  // Info section
  const infoSection = createElement('div', 'card');
  infoSection.innerHTML = `
    <div class="card-header">
      <h2 class="card-title">About ZacAi-Atomic</h2>
    </div>
    <p style="color: var(--text-secondary); line-height: 1.8;">
      ZacAi-Atomic is built with <strong>atomic design principles</strong> and follows a 
      <strong>hybrid ecosystem architecture</strong>. Every function is modular and reusable, 
      following the atomic methodology:
    </p>
    <ul style="color: var(--text-secondary); margin-top: var(--spacing-md); padding-left: var(--spacing-xl); line-height: 1.8;">
      <li><strong>Atoms:</strong> Basic building blocks (DOM utilities, storage, formatting)</li>
      <li><strong>Molecules:</strong> Simple components (navigation, chat messages, inputs)</li>
      <li><strong>Organisms:</strong> Complex components (chat interface, admin dashboard)</li>
      <li><strong>Pages:</strong> Complete page layouts combining organisms</li>
    </ul>
  `;

  appendChildren(pageContainer, header, statsSection, settingsSection, infoSection);
  container.appendChild(pageContainer);
};
