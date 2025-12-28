"use strict";
/**
 * Core Kernel Types
 * Defines system state machine and kernel contracts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelEvent = void 0;
var KernelEvent;
(function (KernelEvent) {
    KernelEvent["BOOT"] = "BOOT";
    KernelEvent["RUN"] = "RUN";
    KernelEvent["CYCLE"] = "CYCLE";
    KernelEvent["ERROR"] = "ERROR";
    KernelEvent["RECOVER"] = "RECOVER";
    KernelEvent["SAFE"] = "SAFE";
    KernelEvent["SHUTDOWN"] = "SHUTDOWN";
})(KernelEvent || (exports.KernelEvent = KernelEvent = {}));
//# sourceMappingURL=kernel.js.map