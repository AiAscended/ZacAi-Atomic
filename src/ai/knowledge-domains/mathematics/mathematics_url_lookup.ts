import { registerSource } from '../url_lookup';

// Register canonical mathematics sources useful for training and reference
registerSource(
  'mathematics',
  'arXiv-math',
  'https://arxiv.org/archive/math',
  'Research preprints in mathematics'
);
registerSource(
  'mathematics',
  'WolframMathWorld',
  'https://mathworld.wolfram.com',
  'Comprehensive math reference'
);
registerSource(
  'mathematics',
  'KhanAcademyMath',
  'https://www.khanacademy.org/math',
  'Educational resources and exercises'
);

export const mathematicsSources = () => registerSource;

export default mathematicsSources;
