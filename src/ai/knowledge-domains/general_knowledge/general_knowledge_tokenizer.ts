import { normalizeText } from './general_knowledge_utils';

export const generalTokenizer = (text: string) => {
  const t = normalizeText(text);
  const re = /<SYS_[A-Z_]+>|[0-9]+|[A-Za-z]+(?:'[A-Za-z]+)?/g;
  const matches = t.match(re) || [];
  const tokens = matches.map((tok) => (tok.startsWith('<SYS_') ? tok : tok.toLowerCase()));
  return { tokens, length: tokens.length };
};
