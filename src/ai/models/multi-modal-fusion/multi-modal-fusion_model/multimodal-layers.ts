/**
 * Multi-modal-fusion - Layer Implementations
 */

import type { ModelPayload } from "../../shared/modelTypes"

export class MULTIMODALLayer {
  forward(input: ModelPayload): ModelPayload {
    return input
  }
}

export default MULTIMODALLayer
