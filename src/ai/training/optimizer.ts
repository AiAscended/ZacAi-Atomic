/**
 * File: src/ai/training/optimizer.ts
 * Purpose: Tiny SGD optimizer stateful stub (MVP lightweight).
 */

export class SGD {
  lr: number;
  constructor(lr = 0.01) {
    this.lr = lr;
  }

  step(params: number[], grads: number[]) {
    for (let i = 0; i < params.length; i++) params[i] -= this.lr * (grads[i] || 0);
  }
}
