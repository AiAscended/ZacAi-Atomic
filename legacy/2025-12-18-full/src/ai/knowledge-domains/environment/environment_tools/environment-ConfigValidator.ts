/**
 * Environment Domain Tool: Config Validator
 * Validates environment configuration and variables
 */

type EnvironmentVariableMap = Record<string, string>

export type EnvironmentConfig = {
  variables?: EnvironmentVariableMap
  requiredVariables?: string[]
  tools?: string[]
}

export type ValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export class EnvironmentConfigValidator {
  validate(config: EnvironmentConfig): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const variables = config.variables ?? {}
    const required = config.requiredVariables ?? []

    for (const key of required) {
      if (!variables[key] || variables[key].trim() === "") {
        errors.push(`Missing required variable: ${key}`)
      }
    }

    if ((config.tools ?? []).length === 0) {
      warnings.push("No environment tools specified; default toolchain assumed.")
    }

    const suspiciousValues = Object.entries(variables).filter(([, value]) => value.includes("TODO"))
    for (const [key] of suspiciousValues) {
      warnings.push(`Variable ${key} contains placeholder value.`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}

export default EnvironmentConfigValidator
