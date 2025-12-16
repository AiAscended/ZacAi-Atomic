/**
 * CLI Tool: Unified AI Module Scanner (models + domains) with watch mode.
 */

async function scanModules(options = {}) {
  const { rebuildRegistry, getSystemRegistry } = await import("../src/ai/orchestration/system/systemRegistry.ts");
  const start = Date.now();
  const registry = options.registry
    ? options.registry
    : options.forceRefresh === false
    ? await getSystemRegistry()
    : await rebuildRegistry();
  const duration = ((Date.now() - start) / 1000).toFixed(2);

  console.log("==========================================");
  console.log(options.title ?? "  Unified AI Module Scanner");
  console.log("  Models + Domains in One Pass");
  console.log("==========================================\n");
  console.log("\n📊 Registry Summary:");
  console.log(`   Total modules: ${registry.stats.totalModules}`);
  console.log(`   Models: ${registry.stats.byCategory.model || 0}`);
  console.log(`   Domains: ${registry.stats.byCategory.domain || 0}`);
  console.log(`   Scan time: ${duration}s`);

  const models = Object.values(registry.modules.model ?? {});
  const domains = Object.values(registry.modules.domain ?? {});

  if (models.length > 0) {
    console.log("\n🤖 Models:");
    for (const module of models) {
      const status = module.enabled ? "✓" : "✗";
      const structure = formatStructure(module.structure);
      console.log(`   ${status} ${module.name} (${module.id})`);
      if (module.subtype) {
        console.log(`      Type: ${module.subtype}`);
      }
      console.log(`      Structure: ${structure}`);
      console.log(`      Files: ${module.fileCount} | Size: ${module.size} bytes`);
    }
  }

  if (domains.length > 0) {
    console.log("\n📚 Domains:");
    for (const module of domains) {
      const status = module.enabled ? "✓" : "✗";
      const structure = formatStructure(module.structure);
      console.log(`   ${status} ${module.name} (${module.id})`);
      console.log(`      Structure: ${structure}`);
      console.log(`      Files: ${module.fileCount} | Size: ${module.size} bytes`);
    }
  }

  console.log("\n✅ System registry updated successfully!");
  console.log(`📁 Registry file: src/ai/orchestration/SYSTEM_REGISTRY.json`);
  return registry;
}

async function startWatchMode() {
  const { ensureSystemWatcher, SYSTEM_EVENT_TOPICS } = await import("../src/ai/orchestration/system/systemWatcher.ts");
  const { subscribe } = await import("../src/ai/orchestration/eventBus.ts");

  await ensureSystemWatcher({ debounceMs: 1000, autoRebuild: true });
  console.log("\n👀 Watch mode enabled. Listening for model/domain changes (Ctrl+C to exit)...");

  subscribe(SYSTEM_EVENT_TOPICS.FILE_CHANGE, payload => {
    console.log(`[watch] ${payload.event} -> ${payload.path}`);
  });

  subscribe(SYSTEM_EVENT_TOPICS.REGISTRY_ERROR, payload => {
    const message = payload?.error?.message ?? payload?.error ?? "Unknown error";
    console.error(`[watch] Registry error: ${message}`);
  });

  subscribe(SYSTEM_EVENT_TOPICS.REGISTRY_UPDATED, payload => {
    const count = payload.changedFiles.length;
    console.log(`\n[watch] Registry updated via ${payload.reason} (${count} change${count === 1 ? "" : "s"})`);
    void scanModules({ registry: payload.registry, title: "  LIVE AI Module Snapshot" });
  });

  await new Promise(() => {});
}

function formatStructure(structure = {}) {
  const enabledKeys = Object.entries(structure)
    .filter(([, value]) => value)
    .map(([key]) => key.replace(/has/i, "").replace(/([A-Z])/g, " $1").trim());
  return enabledKeys.length > 0 ? enabledKeys.join(", ") : "None";
}

async function main() {
  const args = process.argv.slice(2);
  const watchEnabled = args.includes("--watch") || args.includes("-w");

  try {
    await scanModules({ forceRefresh: true });
    if (watchEnabled) {
      await startWatchMode();
      return;
    }
  } catch (error) {
    console.error("\n❌ Failed to scan modules:", error);
    process.exit(1);
  }
}

main();
