/**
 * File: src/ai/data/science/science_tokens.ts
 * Purpose: Domain-specific core tokens for science domain (physics, chemistry, biology, units)
 * Depends on: None
 * Depended on by: science_tokenizer.ts, science_tokenMap.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const SCIENCE_CORE_TOKENS = [
  // reserved special tokens
  "[PAD]",
  "[UNK]",
  "[CLS]",
  "[SEP]",
  "[MASK]",

  // physics concepts
  "FORCE",
  "ENERGY",
  "MASS",
  "VELOCITY",
  "ACCELERATION",
  "MOMENTUM",
  "GRAVITY",
  "FRICTION",
  "PRESSURE",
  "TEMPERATURE",

  // chemistry concepts
  "ATOM",
  "MOLECULE",
  "ELEMENT",
  "COMPOUND",
  "REACTION",
  "BOND",
  "ION",
  "ELECTRON",
  "PROTON",
  "NEUTRON",

  // biology concepts
  "CELL",
  "DNA",
  "PROTEIN",
  "ENZYME",
  "ORGANISM",
  "EVOLUTION",
  "PHOTOSYNTHESIS",
  "RESPIRATION",

  // units and measurements
  "METER",
  "KILOGRAM",
  "SECOND",
  "KELVIN",
  "MOLE",
  "AMPERE",
  "CANDELA",
  "JOULE",
  "NEWTON",
  "WATT",

  // system/domain base tokens
  "<SYS_SCIENCE>",
  "SCIENCE_BASE",
  "SCIENCE_SYS_TOKEN",

  // numeric tokens
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",

  // additional numbered tokens
  "TOKEN_10",
  "TOKEN_11",
  "TOKEN_12",
  "TOKEN_13",
  "TOKEN_14",
  "TOKEN_15",
  "TOKEN_16",
  "TOKEN_17",
  "TOKEN_18",
  "TOKEN_19",
  "TOKEN_20",
  "TOKEN_21",
  "TOKEN_22",
  "TOKEN_23",
  "TOKEN_24",
  "TOKEN_25",
  "TOKEN_26",
  "TOKEN_27",
  "TOKEN_28",
  "TOKEN_29",
  "TOKEN_30",
];

export default SCIENCE_CORE_TOKENS;
