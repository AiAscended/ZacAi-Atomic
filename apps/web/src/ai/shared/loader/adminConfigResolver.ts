/**
 * Fallback admin config resolver. Provides empty adminConfig so that
 * admin config routes stay online even when full registry is absent.
 */

export type ModuleType = "domain" | "model" | string;

export function getAdminConfigResolver() {
  return {
    async getConfig(_moduleType: ModuleType, _moduleId: string) {
      return {
        adminConfig: null,
      };
    },
  };
}
