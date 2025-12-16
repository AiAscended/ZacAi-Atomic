/**
 * CLI Tool: Scan Knowledge Domains with optional watch mode.
 */

async function scanDomains(options = {}) {
  const { rebuildRegistry, getSystemRegistry } = await import("../src/ai/orchestration/system/systemRegistry.ts");
  const registry = options.registry
    ? options.registry
    : options.forceRefresh === false
    ? await getSystemRegistry()
    : await rebuildRegistry();

  const domains = Object.values(registry.modules.domain ?? {});

  console.log("==========================================");
  console.log(options.title ?? "  Knowledge Domain Scanner");
  console.log("==========================================\n");
  console.log("\n📊 Domain Registry Summary:");
  const enabled = domains.filter(domain => domain.enabled).length;
  console.log(`   Total domains: ${domains.length}`);
  console.log(`   Enabled: ${enabled}`);
  console.log(`   Disabled: ${domains.length - enabled}`);

  console.log("\n📋 Domains:");
  for (const manifest of domains) {
    const status = manifest.enabled ? "✓" : "✗";
    const seedVocab = manifest.metadata?.seedVocabSize ?? "unknown";
    console.log(`   ${status} ${manifest.name} (${manifest.id})`);
    console.log(`      Structure: ${formatStructure(manifest.structure)}`);
    console.log(`      Seed vocab size: ${seedVocab}`);
  }

  console.log("\n✅ Domain registry updated successfully!");
  return registry;
}

async function startWatchMode() {
  const { ensureSystemWatcher, SYSTEM_EVENT_TOPICS } = await import("../src/ai/orchestration/system/systemWatcher.ts");
  const { subscribe } = await import("../src/ai/orchestration/eventBus.ts");

  await ensureSystemWatcher({ debounceMs: 1000, autoRebuild: true });
  console.log("\n👀 Watch mode enabled. Listening for domain changes (Ctrl+C to exit)...");

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
    void scanDomains({ registry: payload.registry, title: "  LIVE Knowledge Domain Snapshot" });
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
    await scanDomains({ forceRefresh: true });
    if (watchEnabled) {
      await startWatchMode();
      return;
    }
  } catch (error) {
    console.error("\n❌ Failed to scan domains:", error);
    process.exit(1);
  }
}

main();
