export interface ModuleStatus {
    status: "ONLINE" | "DEGRADED" | "OFFLINE" | "CORRUPT";
    path: string;
    hash?: string;
}
export declare class ModuleRegistry {
    available: Record<string, ModuleStatus>;
    scan(registryPath: string): Promise<Record<string, ModuleStatus>>;
}
//# sourceMappingURL=module-registry.d.ts.map