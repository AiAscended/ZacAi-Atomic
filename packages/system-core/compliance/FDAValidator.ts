export default class FDAValidator {
  static checkDeterminismLog(log: any): boolean {
    // stub: expect an array of runs with identical outputs
    if (!Array.isArray(log) || log.length < 2) return false;
    const first = JSON.stringify(log[0].output);
    return log.every(r => JSON.stringify(r.output) === first);
  }

  static validateTraceability(record: any): boolean {
    // Require algorithm id, version, checksum
    if (!record) return false;
    return !!(record.algorithmId && record.algorithmVersion && record.checksum);
  }
}
