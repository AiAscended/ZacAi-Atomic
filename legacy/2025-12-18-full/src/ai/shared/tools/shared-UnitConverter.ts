/**
 * File: src/ai/shared/tools/shared-UnitConverter.ts
 * Purpose: Provides unit conversion capabilities across domains (mathematics, science, etc.)
 * Depends on: None (pure conversion logic)
 * Depended on by: src/ai/data/mathematics/*, src/ai/data/science/*
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Unit categories
 */
export enum UnitCategory {
  LENGTH = "length",
  MASS = "mass",
  TIME = "time",
  TEMPERATURE = "temperature",
  VOLUME = "volume",
  AREA = "area",
  SPEED = "speed",
  ENERGY = "energy",
  POWER = "power",
  PRESSURE = "pressure",
  DATA = "data",
}

/**
 * Conversion result
 */
export interface ConversionResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  category: UnitCategory;
  formula?: string;
}

/**
 * Unit Converter - Converts between different units of measurement
 * Supports multiple categories: length, mass, time, temperature, etc.
 */
export class UnitConverter {
  // Conversion factors to base units
  private static readonly CONVERSIONS: Record<
    UnitCategory,
    Record<string, number>
  > = {
    [UnitCategory.LENGTH]: {
      meter: 1,
      m: 1,
      kilometer: 1000,
      km: 1000,
      centimeter: 0.01,
      cm: 0.01,
      millimeter: 0.001,
      mm: 0.001,
      mile: 1609.34,
      mi: 1609.34,
      yard: 0.9144,
      yd: 0.9144,
      foot: 0.3048,
      ft: 0.3048,
      inch: 0.0254,
      in: 0.0254,
    },
    [UnitCategory.MASS]: {
      kilogram: 1,
      kg: 1,
      gram: 0.001,
      g: 0.001,
      milligram: 0.000001,
      mg: 0.000001,
      pound: 0.453592,
      lb: 0.453592,
      ounce: 0.0283495,
      oz: 0.0283495,
      ton: 1000,
      t: 1000,
    },
    [UnitCategory.TIME]: {
      second: 1,
      s: 1,
      minute: 60,
      min: 60,
      hour: 3600,
      h: 3600,
      hr: 3600,
      day: 86400,
      d: 86400,
      week: 604800,
      wk: 604800,
      month: 2592000, // 30 days
      year: 31536000, // 365 days
      yr: 31536000,
    },
    [UnitCategory.TEMPERATURE]: {
      celsius: 1,
      c: 1,
      fahrenheit: 1,
      f: 1,
      kelvin: 1,
      k: 1,
    },
    [UnitCategory.VOLUME]: {
      liter: 1,
      l: 1,
      milliliter: 0.001,
      ml: 0.001,
      gallon: 3.78541,
      gal: 3.78541,
      quart: 0.946353,
      qt: 0.946353,
      pint: 0.473176,
      pt: 0.473176,
      cup: 0.236588,
      fluidounce: 0.0295735,
      floz: 0.0295735,
    },
    [UnitCategory.AREA]: {
      squaremeter: 1,
      m2: 1,
      squarekilometer: 1000000,
      km2: 1000000,
      squarecentimeter: 0.0001,
      cm2: 0.0001,
      squaremile: 2589988,
      mi2: 2589988,
      acre: 4046.86,
      squareyard: 0.836127,
      yd2: 0.836127,
      squarefoot: 0.092903,
      ft2: 0.092903,
    },
    [UnitCategory.SPEED]: {
      meterspersecond: 1,
      mps: 1,
      kilometersperhour: 0.277778,
      kph: 0.277778,
      milesperhour: 0.44704,
      mph: 0.44704,
      knot: 0.514444,
      kt: 0.514444,
    },
    [UnitCategory.ENERGY]: {
      joule: 1,
      j: 1,
      kilojoule: 1000,
      kj: 1000,
      calorie: 4.184,
      cal: 4.184,
      kilocalorie: 4184,
      kcal: 4184,
      watthour: 3600,
      wh: 3600,
      kilowatthour: 3600000,
      kwh: 3600000,
    },
    [UnitCategory.POWER]: {
      watt: 1,
      w: 1,
      kilowatt: 1000,
      kw: 1000,
      horsepower: 745.7,
      hp: 745.7,
    },
    [UnitCategory.PRESSURE]: {
      pascal: 1,
      pa: 1,
      kilopascal: 1000,
      kpa: 1000,
      bar: 100000,
      atmosphere: 101325,
      atm: 101325,
      psi: 6894.76,
    },
    [UnitCategory.DATA]: {
      byte: 1,
      b: 1,
      kilobyte: 1024,
      kb: 1024,
      megabyte: 1048576,
      mb: 1048576,
      gigabyte: 1073741824,
      gb: 1073741824,
      terabyte: 1099511627776,
      tb: 1099511627776,
      bit: 0.125,
    },
  };

  /**
   * Convert value from one unit to another
   */
  public static convert(
    value: number,
    fromUnit: string,
    toUnit: string,
  ): ConversionResult {
    // Normalize unit names
    const from = fromUnit.toLowerCase().replace(/\s+/g, "");
    const to = toUnit.toLowerCase().replace(/\s+/g, "");

    // Find category
    const category = this.findCategory(from);
    if (!category) {
      throw new Error(`Unknown unit: ${fromUnit}`);
    }

    // Check if toUnit is in same category
    if (!this.CONVERSIONS[category][to]) {
      throw new Error(`Cannot convert ${fromUnit} to ${toUnit}`);
    }

    // Special handling for temperature
    if (category === UnitCategory.TEMPERATURE) {
      return this.convertTemperature(value, from, to);
    }

    // Convert to base unit, then to target unit
    const baseValue = value * this.CONVERSIONS[category][from];
    const result = baseValue / this.CONVERSIONS[category][to];

    return {
      value: result,
      fromUnit,
      toUnit,
      category,
      formula: `${value} ${fromUnit} × ${this.CONVERSIONS[category][from]} ÷ ${this.CONVERSIONS[category][to]} = ${result} ${toUnit}`,
    };
  }

  /**
   * Convert temperature (requires special formulas)
   */
  private static convertTemperature(
    value: number,
    from: string,
    to: string,
  ): ConversionResult {
    let result: number;
    let formula: string;

    // Celsius conversions
    if (from === "c" || from === "celsius") {
      if (to === "f" || to === "fahrenheit") {
        result = (value * 9) / 5 + 32;
        formula = `(${value}°C × 9/5) + 32 = ${result}°F`;
      } else if (to === "k" || to === "kelvin") {
        result = value + 273.15;
        formula = `${value}°C + 273.15 = ${result}K`;
      } else {
        result = value;
        formula = `${value}°C = ${result}°C`;
      }
    }
    // Fahrenheit conversions
    else if (from === "f" || from === "fahrenheit") {
      if (to === "c" || to === "celsius") {
        result = ((value - 32) * 5) / 9;
        formula = `(${value}°F - 32) × 5/9 = ${result}°C`;
      } else if (to === "k" || to === "kelvin") {
        result = ((value - 32) * 5) / 9 + 273.15;
        formula = `((${value}°F - 32) × 5/9) + 273.15 = ${result}K`;
      } else {
        result = value;
        formula = `${value}°F = ${result}°F`;
      }
    }
    // Kelvin conversions
    else {
      if (to === "c" || to === "celsius") {
        result = value - 273.15;
        formula = `${value}K - 273.15 = ${result}°C`;
      } else if (to === "f" || to === "fahrenheit") {
        result = ((value - 273.15) * 9) / 5 + 32;
        formula = `((${value}K - 273.15) × 9/5) + 32 = ${result}°F`;
      } else {
        result = value;
        formula = `${value}K = ${result}K`;
      }
    }

    return {
      value: result,
      fromUnit: from,
      toUnit: to,
      category: UnitCategory.TEMPERATURE,
      formula,
    };
  }

  /**
   * Find category for a unit
   */
  private static findCategory(unit: string): UnitCategory | null {
    for (const [category, units] of Object.entries(this.CONVERSIONS)) {
      if (units[unit] !== undefined) {
        return category as UnitCategory;
      }
    }
    return null;
  }

  /**
   * Get all supported units for a category
   */
  public static getSupportedUnits(category: UnitCategory): string[] {
    return Object.keys(this.CONVERSIONS[category]);
  }

  /**
   * Get all supported categories
   */
  public static getSupportedCategories(): UnitCategory[] {
    return Object.values(UnitCategory);
  }
}

/**
 * Convenience function for quick conversion
 */
export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
): ConversionResult {
  return UnitConverter.convert(value, fromUnit, toUnit);
}

/**
 * Export converter instance
 */
export const converter = UnitConverter;
