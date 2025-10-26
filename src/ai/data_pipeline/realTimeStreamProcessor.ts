/**
 * File: src/ai/data_pipeline/realTimeStreamProcessor.ts
 * Purpose: Lightweight stream processor that invokes a handler for each incoming record.
 */

type Handler = (record: string) => Promise<void> | void;

export class StreamProcessor {
  private handler: Handler;

  constructor(handler: Handler) {
    this.handler = handler;
  }

  async processBatch(batch: string[]) {
    for (const r of batch) {
      await this.handler(r);
    }
  }
}
