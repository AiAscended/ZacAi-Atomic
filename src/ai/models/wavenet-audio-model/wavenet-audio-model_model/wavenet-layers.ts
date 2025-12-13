/**
 * Wavenet-audio-model - Layer Implementations
 */

import type { ModelPayload } from "../../shared/modelTypes"

export class WAVENETLayer {
  forward(input: ModelPayload): ModelPayload {
    return input
  }
}

export default WAVENETLayer
