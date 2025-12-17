import { querySelector } from "@utils/dom"
import { Router } from "@utils/router"
import { createNavigation, updateActiveLink } from "@components/Navigation"
import { renderChatPage } from "@ui/pages/index"
import { renderAdminPage } from "@ui/pages/admin"
import "@styles/global.css"
// Start small orchestration listeners (data change notifications)
import "@ai/orchestration/dataChangeListener"
// Ensure domain integration modules are imported so they auto-register with the data registry
import "@ai/data/english/english_integrationAPI"
import "@ai/data/mathematics/mathematics_integrationAPI"
import "@ai/data/typescript/typescript_integrationAPI"
import "@ai/data/general/general_integrationAPI"
import "@ai/data/internet_search/internet_search_integrationAPI"
import "@ai/data/grammar/grammar_integrationAPI"
import "@ai/data/science/science_integrationAPI"
import "@ai/data/code_review/code_review_integrationAPI"
import "@ai/data/error_detection/error_detection_integrationAPI"
import "@ai/data/testing/testing_integrationAPI"
import "@ai/data/documentation/documentation_integrationAPI"
import "@ai/data/security/security_integrationAPI"
import "@ai/data/data_structures/data_structures_integrationAPI"
import "@ai/data/algorithms/algorithms_integrationAPI"
import "@ai/data/version_control/version_control_integrationAPI"
import "@ai/data/environment/environment_integrationAPI"

import { registerModule } from "@ai/orchestration/moduleRegistry"
import DocumentCache from "@ai/knowledge_retrieval/documentCache"
import { loadAllDomains } from "@ai/data/domainLoader"
import { logger } from "@ai/monitoring/logger"
import { metricsCollector } from "@ai/monitoring/metricsCollector"

import { AIOrchestrator } from "@ai/orchestration/aiOrchestrator"
import { promptHandler } from "@ai/orchestration/promptHandler"

// Register the document cache as a module so orchestrator listeners can find it and call hooks
try {
  registerModule("documentCache", () => DocumentCache)
} catch (e) {
  // ignore registration failure
}

const aiOrchestrator = AIOrchestrator.getInstance()

/**
 * Main Application Entry Point
 * Initializes the ZacAi-Atomic application with atomic modularity
 */
class App {
  private router: Router
  private appContainer: HTMLElement | null
  private mainContent: HTMLElement | null
  private navElement: HTMLElement | null

  constructor() {
    this.router = new Router()
    this.appContainer = querySelector<HTMLElement>("#app")
    this.mainContent = null
    this.navElement = null

    if (!this.appContainer) {
      throw new Error("App container not found")
    }

    this.init()
  }

  /**
   * Initialize the application
   */
  private async init(): Promise<void> {
    this.setupNavigation()
    this.setupRoutes()

    logger.info("App", "Loading knowledge domains...")
    await loadAllDomains()

    await aiOrchestrator.initialize()

    logger.info("App", "AI system initialized", {
      domains: aiOrchestrator.getRegisteredDomains().length,
      metrics: metricsCollector.getSummary(),
    })

    this.router.init()
  }

  /**
   * Setup navigation menu
   */
  private setupNavigation(): void {
    if (!this.appContainer) return

    this.navElement = createNavigation(
      "ZacAi-Atomic",
      [
        { text: "Chat", href: "/", active: true },
        { text: "Admin", href: "/admin", active: false },
      ],
      (path) => this.router.navigate(path),
    )

    this.appContainer.appendChild(this.navElement)

    // Create main content container
    this.mainContent = document.createElement("main")
    this.mainContent.className = "main-content"
    this.appContainer.appendChild(this.mainContent)

    // Update active link on navigation
    this.router.onNavigate((path) => {
      if (this.navElement) {
        updateActiveLink(this.navElement, path)
      }
    })
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // Home/Chat route
    this.router.addRoute("/", () => {
      if (this.mainContent) {
        renderChatPage(this.mainContent)
      }
    })

    // Admin route
    this.router.addRoute("/admin", () => {
      if (this.mainContent) {
        renderAdminPage(this.mainContent)
      }
    })
  }
}

// Initialize application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  try {
    new App()
    console.log("✨ ZacAi-Atomic initialized successfully!")
    console.log("🔬 Atomic architecture: AI modules → UI → Utils")
    console.log("🧠 AI Orchestrator: Ready with", aiOrchestrator.getRegisteredDomains().length, "domains")
    console.log("🎯 Prompt Handler: Integrated with complete AI pipeline")
  } catch (error) {
    console.error("Failed to initialize application:", error)
  }
})

export { aiOrchestrator, promptHandler, logger, metricsCollector }
