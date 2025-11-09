export const mathematicsParser = (text: string) => {
  // Very small parser: detect if input looks like an equation or natural language question
  const trimmed = text.trim();
  const looksLikeEquation = /[0-9a-zA-Z]+\s*[=+\-*/^]\s*[0-9a-zA-Z]+/.test(
    trimmed,
  );
  const isQuestion = trimmed.endsWith("?");
  return { looksLikeEquation, isQuestion, raw: trimmed };
};
