// Pure-TS fallback implementation of kernel functions (deterministic, simple)
export default class KernelAdapterJS {
  // squared Euclidean distance
  private static sqDist(a: Float64Array, b: Float64Array) {
    let s = 0.0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      s += d * d;
    }
    return s;
  }

  async load(_: string) {
    // noop for JS adapter
    return this;
  }

  async rbf(a: Float64Array, b: Float64Array, sigma = 1.0): Promise<number> {
    const d2 = KernelAdapterJS.sqDist(a, b);
    return Math.exp(-d2 / (2 * sigma * sigma));
  }

  async polynomial(a: Float64Array, b: Float64Array, degree = 2, coef0 = 1): Promise<number> {
    let dot = 0.0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return Math.pow(dot + coef0, degree);
  }
}
