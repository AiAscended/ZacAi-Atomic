export const HCO_PHASES = {
  INDUCTION: "induction" as const,
  DEDUCTION: "deduction" as const,
  SYNTHESIS: "synthesis" as const,
}

export const RETRY_DELAYS_MS = [100, 500, 2000] as const

export const HAPPINESS_REALITY_COEFFICIENT = 1.2
export const HAPPINESS_EXPECTATION_COEFFICIENT = 2.7

export const MEMORY_DEFAULT_TABLE = "hco_trajectories"
