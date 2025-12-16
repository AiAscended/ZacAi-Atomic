/**
 * Unified CLI Scanner with live watch mode.
 * Usage:
 *   node scripts/scan.js all
 *   node scripts/scan.js models --watch
 */

const CATEGORY_MAP = {
  models: "model",
  domains: "domain",
};

async function scanAll(options = {}) {
  const { rebuildRegistry, getSystemRegistry } = await import("../src/ai/orchestration/system/systemRegistry.ts");
  const registry = options.registry
    ? options.registry
    : options.forceRefresh === false
    ? await getSystemRegistry()
    : await rebuildRegistry();

  printSystemSummary(registry, options.title ?? "SYSTEM-WIDE MODULE SCAN");
  return registry;
}

async function scanCategory(alias, options = {}) {
  const category = CATEGORY_MAP[alias];
  if (!category) {
    throw new Error(`Unknown module type: ${alias}`);
  }

  const { rebuildRegistry, getSystemRegistry } = await import("../src/ai/orchestration/system/systemRegistry.ts");
  const registry = options.registry
    ? options.registry
    : options.forceRefresh === false
    ? await getSystemRegistry()
    : await rebuildRegistry();

  const modules = Object.values(registry.modules[category] ?? {});
  printCategorySummary(alias, modules, options.title ?? `${alias.toUpperCase()} SCAN`);
  return { registry, modules };
}

function printSystemSummary(registry, title) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(50)}\n`);
  console.log("📊 Registry Summary:");
  console.log(`   Total modules: ${registry.stats.totalModules}`);
  console.log(`   Total files indexed: ${registry.stats.totalFiles}`);
  for (const [category, count] of Object.entries(registry.stats.byCategory)) {
    console.log(`   ${category}: ${count}`);
  }
  console.log(`   Last scanned: ${registry.generatedAt}`);
}

function printCategorySummary(alias, modules, title) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(50)}\n`);
  console.log("📊 Summary:");
  const enabledCount = modules.filter(m => m.enabled).length;
  console.log(`   Total: ${modules.length}`);
  console.log(`   Enabled: ${enabledCount}`);
  console.log(`   Disabled: ${modules.length - enabledCount}`);

  console.log("\n📋 Modules:");
  for (const manifest of modules) {
    const status = manifest.enabled ? "✓" : "✗";
    console.log(`   ${status} ${manifest.name} (${manifest.id})`);
    if (manifest.subtype) {
      console.log(`      Type: ${manifest.subtype}`);
    }
    console.log(`      Files: ${manifest.fileCount}, Size: ${manifest.size} bytes`);
    console.log(`      Structure: ${formatStructure(manifest.structure)}`);
  }
}

function formatStructure(structure = {}) {
  return Object.entries(structure)
    .filter(([, value]) => value)
    .map(([key]) => key.replace(/has/i, "").replace(/([A-Z])/g, " $1").trim())
    .join(", ") || "None";
}

async function startWatchMode(type) {
  const { ensureSystemWatcher, SYSTEM_EVENT_TOPICS } = await import("../src/ai/orchestration/system/systemWatcher.ts");
  const { subscribe } = await import("../src/ai/orchestration/eventBus.ts");

  await ensureSystemWatcher({ debounceMs: 1000, autoRebuild: true });
  console.log("\n👀 Watch mode enabled. Listening for changes (Ctrl+C to exit)...");

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
    if (type === "all") {
      printSystemSummary(payload.registry, "LIVE SYSTEM SNAPSHOT");
    } else if (CATEGORY_MAP[type]) {
      const modules = Object.values(payload.registry.modules[CATEGORY_MAP[type]] ?? {});
      printCategorySummary(type, modules, `${type.toUpperCase()} LIVE SNAPSHOT`);
    } else {
      printSystemSummary(payload.registry, "LIVE SYSTEM SNAPSHOT");
    }
  });

  // Keep process alive
  await new Promise(() => {});
}

async function main() {
  const args = process.argv.slice(2);
  const watchEnabled = args.includes("--watch") || args.includes("-w");
  const type = args.find(arg => !arg.startsWith("-")) || "all";

  try {
    if (type === "all") {
      await scanAll({ forceRefresh: true });
    } else if (type === "models" || type === "domains") {
      await scanCategory(type, { forceRefresh: true });
    } else {
      console.error(`\n❌ Unknown module type: ${type}`);
      console.log(`Usage: node scripts/scan.js <models|domains|all> [--watch]`);
      process.exit(1);
    }

    if (watchEnabled) {
      await startWatchMode(type);
      return;
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log("  SCAN COMPLETE");
    console.log(`${"=".repeat(50)}\n`);
  } catch (error) {
    console.error("\n❌ Scan failed:", error);
    process.exit(1);
  }
}

main();
