/**
 * File: src/ai/context_management/userProfileHandler.ts
 * Purpose: Small in-memory user profile store for session-level personalization.
 */

const profiles = new Map<string, Record<string, unknown>>();

export const getProfile = (userId: string) => profiles.get(userId) ?? {};

export const setProfile = (userId: string, data: Record<string, unknown>) => {
  const existing = profiles.get(userId) ?? {};
  profiles.set(userId, { ...existing, ...data });
};

export const clearProfile = (userId: string) => profiles.delete(userId);

export class UserProfileHandler {
  private profiles: Map<string, Record<string, unknown>> = new Map();

  getProfile(userId: string): Record<string, unknown> {
    return this.profiles.get(userId) ?? {};
  }

  setProfile(userId: string, data: Record<string, unknown>): void {
    const existing = this.profiles.get(userId) ?? {};
    this.profiles.set(userId, { ...existing, ...data });
  }

  updateProfile(userId: string, updates: Record<string, unknown>): void {
    const existing = this.getProfile(userId);
    this.setProfile(userId, { ...existing, ...updates });
  }

  clearProfile(userId: string): boolean {
    return this.profiles.delete(userId);
  }

  hasProfile(userId: string): boolean {
    return this.profiles.has(userId);
  }

  getAllProfiles(): Map<string, Record<string, unknown>> {
    return new Map(this.profiles);
  }

  clearAllProfiles(): void {
    this.profiles.clear();
  }
}
