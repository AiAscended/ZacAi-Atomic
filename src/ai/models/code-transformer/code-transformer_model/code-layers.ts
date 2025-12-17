/**
 * Code-transformer - Layer Implementations
 */

import type { ModelPayload } from '../../shared/modelTypes';

export class CODELayer {
  forward(input: unknown): unknown {
    return input;
  }
}

export const defaultCodeLayer = new CODELayer('code-layer-1');

