/**
 * Fallback GitHub App auth utilities. Generates a placeholder JWT so
 * token exchange routes do not fail in offline environments.
 */

export function generateAppJwt() {
  return "placeholder-jwt-token";
}
