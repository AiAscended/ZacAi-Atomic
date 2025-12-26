// Minimal TypeScript adapter to load kernel WASM and call exported functions

export type KernelExports = {
  rbf_kernel: (a_ptr: number, b_ptr: number, len: number, sigma: number) => number;
  polynomial_kernel: (a_ptr: number, b_ptr: number, len: number, degree: number, coef0: number) => number;
  memory: WebAssembly.Memory;
};

export default class KernelAdapter {
  private wasm: KernelExports | null = null;

  async load(wasmUrl: string) {
    const resp = await fetch(wasmUrl);
    const bytes = await resp.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(bytes, {} as any);
    this.wasm = instance.exports as unknown as KernelExports;
    return this.wasm;
  }

  // Helper: write Float64Array into wasm memory and return pointer
  private allocArray(arr: Float64Array): { ptr: number; len: number } {
    if (!this.wasm) throw new Error('WASM not loaded');
    const bytes = new Float64Array(arr).buffer;
    const len = arr.length;
    const bytesLen = bytes.byteLength;
    const ptr = (this.wasm as any).malloc ? (this.wasm as any).malloc(bytesLen) : 0;
    if (ptr === 0) throw new Error('WASM malloc not found or returned 0');
    const mem = new Uint8Array(this.wasm.memory.buffer, ptr, bytesLen);
    mem.set(new Uint8Array(bytes));
    return { ptr, len };
  }

  // High-level RBF call (relies on wasm memory helpers)
  async rbf(a: Float64Array, b: Float64Array, sigma = 1.0): Promise<number> {
    if (!this.wasm) throw new Error('WASM not loaded');
    if (a.length !== b.length) throw new Error('vector length mismatch');
    const { ptr: aPtr } = this.allocArray(a);
    const { ptr: bPtr } = this.allocArray(b);
    const res = (this.wasm as any).rbf_kernel(aPtr, bPtr, a.length, sigma);
    // optionally free pointers if free is exported
    if ((this.wasm as any).free) {
      (this.wasm as any).free(aPtr);
      (this.wasm as any).free(bPtr);
    }
    return res as number;
  }

  async polynomial(a: Float64Array, b: Float64Array, degree = 2, coef0 = 1): Promise<number> {
    if (!this.wasm) throw new Error('WASM not loaded');
    if (a.length !== b.length) throw new Error('vector length mismatch');
    const { ptr: aPtr } = this.allocArray(a);
    const { ptr: bPtr } = this.allocArray(b);
    const res = (this.wasm as any).polynomial_kernel(aPtr, bPtr, a.length, degree, coef0);
    if ((this.wasm as any).free) {
      (this.wasm as any).free(aPtr);
      (this.wasm as any).free(bPtr);
    }
    return res as number;
  }
}
