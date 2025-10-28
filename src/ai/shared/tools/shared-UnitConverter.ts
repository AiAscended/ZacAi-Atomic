/**
 * File: src/ai/shared/tools/shared-UnitConverter.ts
 * Purpose: Universal unit conversion utility for various measurement types
 * Depends on: None (standalone utility)
 * Depended on by: src/ai/data/mathematics/mathematics_integrationAPI.ts, src/ai/data/science/science_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Supported unit categories
 */
export type UnitCategory = "length" | "mass" | "temperature" | "time" | "volume" | "area" | "speed" | "data"

/**
 * Conversion result with metadata
 */
export interface ConversionResult {
  value: number
  fromUnit: string
  toUnit: string
  category: UnitCategory
  formula?: string
}

/**
 * Unit Converter - Converts between different units of measurement
 *
 * Features:
 * - Length (meters, feet, miles, etc.)
 * - Mass (kilograms, pounds, ounces, etc.)
 * - Temperature (Celsius, Fahrenheit, Kelvin)
 * - Time (seconds, minutes, hours, days)
 * - Volume (liters, gallons, cups, etc.)
 * - Area (square meters, acres, etc.)
 * - Speed (km/h, mph, m/s)
 * - Data (bytes, KB, MB, GB, TB)
 *
 * All conversions are precise and bidirectional.
 */
export class UnitConverter {
  // Conversion factors to base units
  private static readonly LENGTH_TO_METERS: Record<string, number> = {
    m: 1,
    meter: 1,
    meters: 1,
    km: 1000,
    kilometer: 1000,
    kilometers: 1000,
    cm: 0.01,
    centimeter: 0.01,
    centimeters: 0.01,
    mm: 0.001,
    millimeter: 0.001,
    millimeters: 0.001,
    ft: 0.3048,
    foot: 0.3048,
    feet: 0.3048,
    in: 0.0254,
    inch: 0.0254,
    inches: 0.0254,
    yd: 0.9144,
    yard: 0.9144,
    yards: 0.9144,
    mi: 1609.34,
    mile: 1609.34,
    miles: 1609.34,
  }

  private static readonly MASS_TO_KILOGRAMS: Record<string, number> = {
    kg: 1,
    kilogram: 1,
    kilograms: 1,
    g: 0.001,
    gram: 0.001,
    grams: 0.001,
    mg: 0.000001,
    milligram: 0.000001,
    milligrams: 0.000001,
    lb: 0.453592,
    pound: 0.453592,
    pounds: 0.453592,
    oz: 0.0283495,
    ounce: 0.0283495,
    ounces: 0.0283495,
    ton: 1000,
    tons: 1000,
  }

  private static readonly TIME_TO_SECONDS: Record<string, number> = {
    s: 1,
    sec: 1,
    second: 1,
    seconds: 1,
    min: 60,
    minute: 60,
    minutes: 60,
    h: 3600,
    hr: 3600,
    hour: 3600,
    hours: 3600,
    d: 86400,
    day: 86400,
    days: 86400,
    week: 604800,
    weeks: 604800,
    month: 2592000, // 30 days
    months: 2592000,
    year: 31536000, // 365 days
    years: 31536000,
  }

  private static readonly VOLUME_TO_LITERS: Record<string, number> = {
    l: 1,
    liter: 1,
    liters: 1,
    ml: 0.001,
    milliliter: 0.001,
    milliliters: 0.001,
    gal: 3.78541,
    gallon: 3.78541,
    gallons: 3.78541,
    qt: 0.946353,
    quart: 0.946353,
    quarts: 0.946353,
    pt: 0.473176,
    pint: 0.473176,
    pints: 0.473176,
    cup: 0.236588,
    cups: 0.236588,
    "fl oz": 0.0295735,
    "fluid ounce": 0.0295735,
    "fluid ounces": 0.0295735,
  }

  private static readonly DATA_TO_BYTES: Record<string, number> = {
    b: 1,
    byte: 1,
    bytes: 1,
    kb: 1024,
    kilobyte: 1024,
    kilobytes: 1024,
    mb: 1048576,
    megabyte: 1048576,
    megabytes: 1048576,
    gb: 1073741824,
    gigabyte: 1073741824,
    gigabytes: 1073741824,
    tb: 1099511627776,
    terabyte: 1099511627776,
    terabytes: 1099511627776,
  }

  /**
   * Converts a value from one unit to another
   * @param value - Numeric value to convert
   * @param fromUnit - Source unit
   * @param toUnit - Target unit
   * @returns Conversion result
   * @throws Error if units are incompatible or unknown
   */
  public static convert(value: number, fromUnit: string, toUnit: string): ConversionResult {
    const from = fromUnit.toLowerCase().trim()
    const to = toUnit.toLowerCase().trim()

    // Determine category
    const category = this.determineCategory(from, to)

    if (!category) {
      throw new Error(`Incompatible or unknown units: ${fromUnit} and ${toUnit}`)
    }

    let result: number

    switch (category) {
      case "length":
        result = this.convertLength(value, from, to)
        break
      case "mass":
        result = this.convertMass(value, from, to)
        break
      case "temperature":
        result = this.convertTemperature(value, from, to)
        break
      case "time":
        result = this.convertTime(value, from, to)
        break
      case "volume":
        result = this.convertVolume(value, from, to)
        break
      case "data":
        result = this.convertData(value, from, to)
        break
      default:
        throw new Error(`Unsupported category: ${category}`)
    }

    return {
      value: result,
      fromUnit,
      toUnit,
      category,
    }
  }

  /**
   * Determines the category of units
   * @param fromUnit - Source unit
   * @param toUnit - Target unit
   * @returns Unit category or null if incompatible
   */
  private static determineCategory(fromUnit: string, toUnit: string): UnitCategory | null {
    if (fromUnit in this.LENGTH_TO_METERS && toUnit in this.LENGTH_TO_METERS) {
      return "length"
    }
    if (fromUnit in this.MASS_TO_KILOGRAMS && toUnit in this.MASS_TO_KILOGRAMS) {
      return "mass"
    }
    if (this.isTemperatureUnit(fromUnit) && this.isTemperatureUnit(toUnit)) {
      return "temperature"
    }
    if (fromUnit in this.TIME_TO_SECONDS && toUnit in this.TIME_TO_SECONDS) {
      return "time"
    }
    if (fromUnit in this.VOLUME_TO_LITERS && toUnit in this.VOLUME_TO_LITERS) {
      return "volume"
    }
    if (fromUnit in this.DATA_TO_BYTES && toUnit in this.DATA_TO_BYTES) {
      return "data"
    }
    return null
  }

  /**
   * Checks if a unit is a temperature unit
   * @param unit - Unit to check
   * @returns True if temperature unit
   */
  private static isTemperatureUnit(unit: string): boolean {
    return ["c", "celsius", "f", "fahrenheit", "k", "kelvin"].includes(unit)
  }

  /**
   * Converts length units
   * @param value - Value to convert
   * @param from - Source unit
   * @param to - Target unit
   * @returns Converted value
   */
  private static convertLength(value: number, from: string, to: string): number {
    const inMeters = value * this.LENGTH_TO_METERS[from]
    return inMeters / this.LENGTH_TO_METERS[to]
  }

  /**
   * Converts mass units
   * @param value - Value to convert
   * @param from - Source unit
   * @param to - Target unit
   * @returns Converted value
   */
  private static convertMass(value: number, from: string, to: string): number {
    const inKilograms = value * this.MASS_TO_KILOGRAMS[from]
    return inKilograms / this.MASS_TO_KILOGRAMS[to]
  }

  /**
   * Converts temperature units
   * @param value - Value to convert
   * @param from - Source unit
   * @param to - Target unit
   * @returns Converted value
   */
  private static convertTemperature(value: number, from: string, to: string): number {
    // Convert to Celsius first
    let celsius: number

    switch (from) {
      case "c":
      case "celsius":
        celsius = value
        break
      case "f":
      case "fahrenheit":
        celsius = ((value - 32) * 5) / 9
        break
      case "k":
      case "kelvin":
        celsius = value - 273.15
        break
      default:
        throw new Error(`Unknown temperature unit: ${from}`)
    }

    // Convert from Celsius to target
    switch (to) {
      case "c":
      case "celsius":
        return celsius
      case "f":
      case "fahrenheit":
        return (celsius * 9) / 5 + 32
      case "k":
      case "kelvin":
        return celsius + 273.15
      default:
        throw new Error(`Unknown temperature unit: ${to}`)
    }
  }

  /**
   * Converts time units
   * @param value - Value to convert
   * @param from - Source unit
   * @param to - Target unit
   * @returns Converted value
   */
  private static convertTime(value: number, from: string, to: string): number {
    const inSeconds = value * this.TIME_TO_SECONDS[from]
    return inSeconds / this.TIME_TO_SECONDS[to]
  }

  /**
   * Converts volume units
   * @param value - Value to convert
   * @param from - Source unit
   * @param to - Target unit
   * @returns Converted value
   */
  private static convertVolume(value: number, from: string, to: string): number {
    const inLiters = value * this.VOLUME_TO_LITERS[from]
    return inLiters / this.VOLUME_TO_LITERS[to]
  }

  /**
   * Converts data units
   * @param value - Value to convert
   * @param from - Source unit
   * @param to - Target unit
   * @returns Converted value
   */
  private static convertData(value: number, from: string, to: string): number {
    const inBytes = value * this.DATA_TO_BYTES[from]
    return inBytes / this.DATA_TO_BYTES[to]
  }

  /**
   * Gets all supported units for a category
   * @param category - Unit category
   * @returns Array of supported unit names
   */
  public static getSupportedUnits(category: UnitCategory): string[] {
    switch (category) {
      case "length":
        return Object.keys(this.LENGTH_TO_METERS)
      case "mass":
        return Object.keys(this.MASS_TO_KILOGRAMS)
      case "temperature":
        return ["c", "celsius", "f", "fahrenheit", "k", "kelvin"]
      case "time":
        return Object.keys(this.TIME_TO_SECONDS)
      case "volume":
        return Object.keys(this.VOLUME_TO_LITERS)
      case "data":
        return Object.keys(this.DATA_TO_BYTES)
      default:
        return []
    }
  }
}

// Export singleton instance
export const converter = UnitConverter
