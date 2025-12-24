/**
 * File: src/ai/context_management/userProfileHandler.ts
 * Purpose: Small in-memory user profile store for session-level personalization.
 */

export interface UserProfile {
  name?: string
  preferences?: Record<string, unknown>
  history?: string[]
  [key: string]: unknown
}

const profiles = new Map<string, UserProfile>()

export const getProfile = (userId: string): UserProfile => profiles.get(userId) ?? {}

export const setProfile = (userId: string, data: UserProfile) => {
  const existing = profiles.get(userId) ?? {}
  profiles.set(userId, { ...existing, ...data })
}

export const clearProfile = (userId: string) => profiles.delete(userId)

export class UserProfileHandler {
  private profiles: Map<string, UserProfile> = new Map()

  getProfile(userId: string): UserProfile {
    return this.profiles.get(userId) ?? {}
  }

  setProfile(userId: string, data: UserProfile): void {
    const existing = this.profiles.get(userId) ?? {}
    this.profiles.set(userId, { ...existing, ...data })
  }

  updateProfile(userId: string, updates: Partial<UserProfile>): void {
    const existing = this.getProfile(userId)
    this.setProfile(userId, { ...existing, ...updates })
  }

  clearProfile(userId: string): boolean {
    return this.profiles.delete(userId)
  }

  hasProfile(userId: string): boolean {
    return this.profiles.has(userId)
  }

  getAllProfiles(): Map<string, UserProfile> {
    return new Map(this.profiles)
  }

  clearAllProfiles(): void {
    this.profiles.clear()
  }
}
