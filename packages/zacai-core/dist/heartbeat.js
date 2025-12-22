export class Heartbeat {
    constructor() {
        this.startTime = Date.now();
    }
    getUptimeMs() {
        return Date.now() - this.startTime;
    }
    getSystemTime() {
        return new Date().toISOString();
    }
}
//# sourceMappingURL=heartbeat.js.map