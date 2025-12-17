/**
 * Lightweight but opinionated runtime registry for orchestrator sub-modules.
 * Supports versioned registrations, metadata tracking, and safe lookups.
 */

export type ModuleFactory<T = unknown> = () => T

export interface ModuleRegistration<T = unknown> {
  name: string
  version: string
  factory: ModuleFactory<T>
  metadata?: Record<string, unknown>
  registeredAt: number
}

export interface ModuleRegistrationOptions {
  version?: string
  allowOverride?: boolean
  metadata?: Record<string, unknown>
}

export const registerModule = (
  name: string,
  factory: ModuleFactory,
  version?: string,
) => {
  registry.set(name, { name, version, factory });
};

const buildKey = (name: string, version: string) => `${name}::${version}`

export const registerModule = <T>(
  name: string,
  factory: ModuleFactory<T>,
  options?: ModuleRegistrationOptions,
): ModuleRegistration<T> => {
  if (!name?.trim()) {
    throw new Error("[moduleRegistry] Name must be provided")
  }
  if (typeof factory !== "function") {
    throw new Error("[moduleRegistry] Factory must be a callable function")
  }

  const version = options?.version ?? DEFAULT_VERSION
  const key = buildKey(name, version)

  if (registry.has(key) && !options?.allowOverride) {
    throw new Error(`Module '${name}'@'${version}' is already registered`)
  }

  const entry: ModuleRegistration<T> = {
    name,
    version,
    factory,
    metadata: options?.metadata,
    registeredAt: Date.now(),
  }

  registry.set(key, entry)
  return entry
}

export const getModule = <T = unknown>(name: string, version = DEFAULT_VERSION): T | null => {
  const entry = registry.get(buildKey(name, version))
  return entry ? (entry.factory() as T) : null
}

export const hasModule = (name: string, version = DEFAULT_VERSION): boolean => {
  return registry.has(buildKey(name, version))
}

export const unregisterModule = (name: string, version = DEFAULT_VERSION): boolean => {
  return registry.delete(buildKey(name, version))
}

export const listModules = (): ModuleRegistration[] => Array.from(registry.values())

export const clearModuleRegistry = () => registry.clear()

export const getModuleRegistration = (
  name: string,
  version = DEFAULT_VERSION,
): ModuleRegistration | null => {
  return registry.get(buildKey(name, version)) ?? null
}

export const ensureModule = <T = unknown>(name: string, version = DEFAULT_VERSION): T => {
  const instance = getModule<T>(name, version)
  if (instance == null) {
    throw new Error(`Module '${name}' (version '${version}') is not registered`)
  }
  return instance
}

export const withModule = <TModule = unknown, TResult = unknown>(
  name: string,
  handler: (module: TModule, registration: ModuleRegistration<TModule>) => TResult,
  version = DEFAULT_VERSION,
): TResult => {
  const registration = getModuleRegistration(name, version) as ModuleRegistration<TModule> | null
  if (!registration) {
    throw new Error(`Module '${name}' (version '${version}') is not registered`)
  }
  return handler(registration.factory(), registration)
}

export const listRegisteredVersions = (name: string): string[] => {
  return listModules()
    .filter((entry) => entry.name === name)
    .map((entry) => entry.version)
}
