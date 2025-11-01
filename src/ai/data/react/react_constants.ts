/**
 * File: src/ai/data/react/react_constants.ts
 * Purpose: Constants and configuration for the React knowledge domain
 * Depends on: None
 * Depended on by: All react domain modules
 * Creator: Vercel v0 Coding Assistant
 */

export const REACT_DOMAIN = "react"
export const REACT_VOCAB_PATH = "/src/ai/data/react/react_seedVocabulary.json"
export const REACT_LEARNED_DATA_PATH = "/src/ai/data/react/react_learnedData.json"
export const REACT_WEIGHTS_PATH = "/src/ai/data/react/react_pretrained_weights.json"
export const REACT_TRAINING_WEIGHTS_PATH = "/src/ai/data/react/react_trainingWeights.bin"

// React-specific constants
export const REACT_CONCEPTS = [
  "component",
  "props",
  "state",
  "hooks",
  "useState",
  "useEffect",
  "useContext",
  "useReducer",
  "useMemo",
  "useCallback",
  "useRef",
  "jsx",
  "tsx",
  "virtual-dom",
  "reconciliation",
  "lifecycle",
  "render",
  "mounting",
  "updating",
  "unmounting",
] as const

export const REACT_PATTERNS = [
  "functional-component",
  "class-component",
  "higher-order-component",
  "render-props",
  "custom-hooks",
  "context-api",
  "controlled-component",
  "uncontrolled-component",
  "composition",
  "children-props",
] as const
