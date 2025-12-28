import KernelAdapter from './KernelAdapter';
import KernelAdapterJS from './KernelAdapterJS';

type RegistryEntry = {
  name: string;
  wasmUrl: string;
};

const registry: RegistryEntry[] = [];

export function registerKernel(name: string, wasmUrl: string) {
  registry.push({ name, wasmUrl });
}

export function listKernels() {
  return registry.map(r => r.name);
}

export async function getKernelAdapter(name: string): Promise<any> {
  const entry = registry.find(r => r.name === name);
  if (!entry) throw new Error(`Kernel not found: ${name}`);

  // JS fallback: entries starting with 'js:' use the JS adapter
  if (entry.wasmUrl && entry.wasmUrl.startsWith('js:')) {
    const adapter = new KernelAdapterJS();
    await adapter.load(entry.wasmUrl);
    return adapter;
  }

  const adapter = new KernelAdapter();
  await adapter.load(entry.wasmUrl);
  return adapter;
}

export default { registerKernel, listKernels, getKernelAdapter };
