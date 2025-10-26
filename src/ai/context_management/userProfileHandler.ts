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
