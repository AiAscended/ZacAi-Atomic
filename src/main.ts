import { querySelector } from '@atoms/dom';
import { Router } from '@utils/router';
import { createNavigation, updateActiveLink } from '@molecules/navigation';
import { renderChatPage } from './pages/chatPage';
import { renderAdminPage } from './pages/adminPage';
import './styles/main.css';

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
    console.log('🔬 Atomic architecture: Atoms → Molecules → Organisms → Pages');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});
