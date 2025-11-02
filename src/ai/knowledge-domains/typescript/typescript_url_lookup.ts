import { registerSource } from '../url_lookup';

registerSource(
  'typescript',
  'TypeScriptLang',
  'https://www.typescriptlang.org',
  'Official TypeScript docs and handbook'
);
registerSource(
  'typescript',
  'MDN',
  'https://developer.mozilla.org',
  'JavaScript/TypeScript references'
);
registerSource(
  'typescript',
  'DefinitelyTyped',
  'https://github.com/DefinitelyTyped/DefinitelyTyped',
  'Type definitions for JS libraries'
);

export default () => registerSource;
