export const mathematicsLoadWeights = async (
  path = '/src/ai/data/mathematics/mathematics_trainingWeights.bin'
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const raw = fs.readFileSync(path);
    return raw;
  } catch (e) {
    return null;
  }
};
