/**
 * Simple router for single-page application - Utility
 */

export type RouteHandler = () => void;

export interface Route {
  path: string;
  handler: RouteHandler;
}

export class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private currentPath: string = '/';
  private onNavigateCallbacks: Array<(path: string) => void> = [];

  constructor() {
    // Listen to popstate for back/forward navigation
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });
  }

  /**
   * Register a route
   */
  public addRoute(path: string, handler: RouteHandler): void {
    this.routes.set(path, handler);
  }

  /**
   * Navigate to a path
   */
  public navigate(path: string): void {
    if (path === this.currentPath) return;

    this.currentPath = path;
    window.history.pushState({}, '', path);
    this.handleRoute(path);
  }

  /**
   * Handle route change
   */
  private handleRoute(path: string): void {
    const handler = this.routes.get(path);

    if (handler) {
      handler();
      this.onNavigateCallbacks.forEach((callback) => callback(path));
    } else {
      // Default to home if route not found
      const homeHandler = this.routes.get('/');
      if (homeHandler) {
        homeHandler();
        this.currentPath = '/';
        this.onNavigateCallbacks.forEach((callback) => callback('/'));
      }
    }
  }

  /**
   * Register callback for navigation events
   */
  public onNavigate(callback: (path: string) => void): void {
    this.onNavigateCallbacks.push(callback);
  }

  /**
   * Get current path
   */
  public getCurrentPath(): string {
    return this.currentPath;
  }

  /**
   * Initialize router with current path
   */
  public init(): void {
    this.handleRoute(window.location.pathname);
  }
}
