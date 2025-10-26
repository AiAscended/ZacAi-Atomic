import { querySelector } from '@utils/dom';
import { Router } from '@utils/router';
import { createNavigation, updateActiveLink } from '@components/Navigation';
import { renderChatPage } from '@ui/pages/index';
import { renderAdminPage } from '@ui/pages/admin';
import '@styles/global.css';
// Start small orchestration listeners (data change notifications)
import '@ai/orchestration/dataChangeListener';
// Ensure domain integration modules are imported so they auto-register with the data registry
import '@ai/data/english/english_integrationAPI';
import '@ai/data/mathematics/mathematics_integrationAPI';
import '@ai/data/typescript/typescript_integrationAPI';
import '@ai/data/general/general_integrationAPI';
import '@ai/data/internet_search/internet_search_integrationAPI';
import { registerModule } from '@ai/orchestration/moduleRegistry';
import DocumentCache from '@ai/knowledge_retrieval/documentCache';

// Register the document cache as a module so orchestrator listeners can find it and call hooks
try {
  registerModule('documentCache', () => DocumentCache);
} catch (e) {
  // ignore registration failure
}

/**
 * Main Application Entry Point
 * Initializes the ZacAi-Atomic application with atomic modularity
 */
class App {
  private router: Router;
  private appContainer: HTMLElement | null;
  private mainContent: HTMLElement | null;
  private navElement: HTMLElement | null;

  constructor() {
    this.router = new Router();
    this.appContainer = querySelector<HTMLElement>('#app');
    this.mainContent = null;
    this.navElement = null;

    if (!this.appContainer) {
      throw new Error('App container not found');
    }

    this.init();
  }

  /**
   * Initialize the application
   */
  private init(): void {
    this.setupNavigation();
    this.setupRoutes();
    this.router.init();
  }

  /**
   * Setup navigation menu
   */
  private setupNavigation(): void {
    if (!this.appContainer) return;

    this.navElement = createNavigation(
      'ZacAi-Atomic',
      [
        { text: 'Chat', href: '/', active: true },
        { text: 'Admin', href: '/admin', active: false },
      ],
      (path) => this.router.navigate(path)
    );

    this.appContainer.appendChild(this.navElement);

    // Create main content container
    this.mainContent = document.createElement('main');
    this.mainContent.className = 'main-content';
    this.appContainer.appendChild(this.mainContent);

    // Update active link on navigation
    this.router.onNavigate((path) => {
      if (this.navElement) {
        updateActiveLink(this.navElement, path);
      }
    });
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // Home/Chat route
    this.router.addRoute('/', () => {
      if (this.mainContent) {
        renderChatPage(this.mainContent);
      }
    });

    // Admin route
    this.router.addRoute('/admin', () => {
      if (this.mainContent) {
        renderAdminPage(this.mainContent);
      }
    });
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    new App();
    console.log('✨ ZacAi-Atomic initialized successfully!');
    console.log('🔬 Atomic architecture: AI modules → UI → Utils');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});
