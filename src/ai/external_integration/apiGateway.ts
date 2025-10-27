/**
 * File: src/ai/external_integration/apiGateway.ts
 * Purpose: Routes and manages external API calls with rate limiting and error handling
 * Depends on: None (atomic module)
 * Depended on by: src/ai/knowledge_retrieval/webSearchAPIConnector.ts
 * Creator: Vercel v0 Coding Assistant
 */

interface APIConfig {
  baseURL: string
  headers?: Record<string, string>
  timeout?: number
  retries?: number
}

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

class APIGateway {
  private configs: Map<string, APIConfig> = new Map()
  private rateLimits: Map<string, { requests: number[]; config: RateLimitConfig }> = new Map()

  /**
   * Register an API configuration
   */
  public registerAPI(name: string, config: APIConfig): void {
    this.configs.set(name, config)
  }

  /**
   * Set rate limit for an API
   */
  public setRateLimit(apiName: string, config: RateLimitConfig): void {
    this.rateLimits.set(apiName, {
      requests: [],
      config,
    })
  }

  /**
   * Make an API call with rate limiting and retries
   */
  public async call(apiName: string, endpoint: string, options?: RequestInit): Promise<Response> {
    const config = this.configs.get(apiName)
    if (!config) {
      throw new Error(`API ${apiName} not registered`)
    }

    // Check rate limit
    if (!this.checkRateLimit(apiName)) {
      throw new Error(`Rate limit exceeded for API ${apiName}`)
    }

    const url = `${config.baseURL}${endpoint}`
    const headers = { ...config.headers, ...options?.headers }
    const timeout = config.timeout || 30000
    const retries = config.retries || 3

    let lastError: Error | null = null

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Record successful request
        this.recordRequest(apiName)

        return response
      } catch (error) {
        lastError = error as Error
        console.error(`[APIGateway] Attempt ${attempt + 1} failed for ${apiName}:`, error)

        if (attempt < retries - 1) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error(`Failed to call ${apiName} after ${retries} attempts`)
  }

  /**
   * Check if rate limit allows request
   */
  private checkRateLimit(apiName: string): boolean {
    const rateLimit = this.rateLimits.get(apiName)
    if (!rateLimit) return true

    const now = Date.now()
    const { requests, config } = rateLimit

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < config.windowMs)
    rateLimit.requests = validRequests

    return validRequests.length < config.maxRequests
  }

  /**
   * Record a request for rate limiting
   */
  private recordRequest(apiName: string): void {
    const rateLimit = this.rateLimits.get(apiName)
    if (rateLimit) {
      rateLimit.requests.push(Date.now())
    }
  }

  /**
   * Get rate limit status
   */
  public getRateLimitStatus(apiName: string): {
    remaining: number
    total: number
    resetIn: number
  } | null {
    const rateLimit = this.rateLimits.get(apiName)
    if (!rateLimit) return null

    const now = Date.now()
    const validRequests = rateLimit.requests.filter((time) => now - time < rateLimit.config.windowMs)

    const oldest = validRequests[0] || now
    const resetIn = Math.max(0, rateLimit.config.windowMs - (now - oldest))

    return {
      remaining: Math.max(0, rateLimit.config.maxRequests - validRequests.length),
      total: rateLimit.config.maxRequests,
      resetIn,
    }
  }
}

// Singleton instance
const apiGateway = new APIGateway()

export { apiGateway, type APIConfig, type RateLimitConfig }
export const registerAPI = (name: string, config: APIConfig) => apiGateway.registerAPI(name, config)
export const setAPIRateLimit = (name: string, config: RateLimitConfig) => apiGateway.setRateLimit(name, config)
export const callAPI = (apiName: string, endpoint: string, options?: RequestInit) =>
  apiGateway.call(apiName, endpoint, options)
