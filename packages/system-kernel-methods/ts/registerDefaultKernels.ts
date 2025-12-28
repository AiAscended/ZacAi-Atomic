import { registerKernel } from './KernelRegistry';

// Prefer WASM kernels if they exist (runtime detection). Fall back to JS adapters.
try {
	// Node environment check
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const fs = require('fs');
	const path = require('path');
	const wasmPath = path.join(__dirname, '..', 'wasm_dist', 'zk_kernels_bg.wasm');
	if (fs.existsSync(wasmPath)) {
		registerKernel('rbf_default', '/packages/system-kernel-methods/wasm_dist/zk_kernels_bg.wasm');
		registerKernel('poly_default', '/packages/system-kernel-methods/wasm_dist/zk_kernels_bg.wasm');
		console.log('Registered WASM kernels: rbf_default, poly_default (node)');
	} else {
		registerKernel('rbf_default', 'js:rbf_default');
		registerKernel('poly_default', 'js:poly_default');
		console.log('Registered JS fallback kernels: rbf_default, poly_default');
	}
} catch (e) {
	// Likely browser environment — assume WASM will be served at that path, otherwise JS adapter will be used
	try {
		registerKernel('rbf_default', '/packages/system-kernel-methods/wasm_dist/zk_kernels_bg.wasm');
		registerKernel('poly_default', '/packages/system-kernel-methods/wasm_dist/zk_kernels_bg.wasm');
		console.log('Registered WASM kernels (browser): rbf_default, poly_default');
	} catch (err) {
		registerKernel('rbf_default', 'js:rbf_default');
		registerKernel('poly_default', 'js:poly_default');
		console.log('Registered JS fallback kernels (error path): rbf_default, poly_default');
	}
}
