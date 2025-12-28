// Minimal inference stub that uses kernel adapters to score features
import '../../system-kernel-methods/ts/registerDefaultKernels';
import { getKernelAdapter } from '../../system-kernel-methods/ts/KernelRegistry';

export async function scorePairWithKernel(kernelName: string, a: number[], b: number[]) {
  const adapter = await getKernelAdapter(kernelName);
  const aArr = new Float64Array(a);
  const bArr = new Float64Array(b);
  const score = await adapter.rbf(aArr, bArr, 1.0);
  return score;
}

export default { scorePairWithKernel };
