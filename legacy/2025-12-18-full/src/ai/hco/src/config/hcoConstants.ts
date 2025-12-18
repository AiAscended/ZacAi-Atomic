export const TEMPERATURES = {
  perceiver: 0.2,
  hypothesis: 1.0,
  code: 0.3,
  logic: 0.1,
  empathy: 0.6,
  debate: 0.5,
  reflect: 0.4,
} as const

export const PIPELINE_WEIGHTS = {
  logic: 0.6,
  creative: 0.4,
}

export const UCL_HAPPINESS = {
  rewardCoefficient: 1.2,
  expectationCoefficient: 2.7,
  amplificationThreshold: 1.5,
}

export const RETRY_BACKOFFS = [100, 500, 2000] as const

export const ARISTOTLE_FIGURE_ONE_MOODS = {
  Barbara: { major: "A", minor: "A", conclusion: "A" },
  Celarent: { major: "E", minor: "A", conclusion: "E" },
  Darii: { major: "A", minor: "I", conclusion: "I" },
  Ferio: { major: "E", minor: "I", conclusion: "O" },
  Cesare: { major: "E", minor: "A", conclusion: "E" },
  Camestres: { major: "A", minor: "E", conclusion: "E" },
} as const

export const PROPOSITIONAL_RULES = [
  "modusPonens",
  "modusTollens",
  "hypotheticalSyllogism",
] as const
