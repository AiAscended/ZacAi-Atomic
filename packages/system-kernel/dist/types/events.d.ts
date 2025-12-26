/**
 * Kernel Event System
 * Type-safe event handling for kernel lifecycle
 */
import { KernelEvent, SystemMode } from "./kernel";
export interface KernelEventPayload {
    [KernelEvent.BOOT]: {
        mode: SystemMode;
    };
    [KernelEvent.RUN]: {
        tick: number;
    };
    [KernelEvent.CYCLE]: {
        tick: number;
        duration: number;
    };
    [KernelEvent.ERROR]: {
        error: Error;
        severity: "LOW" | "HIGH" | "CRITICAL";
    };
    [KernelEvent.RECOVER]: {
        strategy: string;
        success: boolean;
    };
    [KernelEvent.SAFE]: {
        reason: string;
    };
    [KernelEvent.SHUTDOWN]: {
        graceful: boolean;
    };
}
export type EventListener<T extends KernelEvent> = (payload: KernelEventPayload[T]) => void | Promise<void>;
//# sourceMappingURL=events.d.ts.map