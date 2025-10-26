export const generalParser = (text: string) => {
  const t = text.trim();
  const isQuestion = t.endsWith('?');
  return { isQuestion, raw: t };
};
