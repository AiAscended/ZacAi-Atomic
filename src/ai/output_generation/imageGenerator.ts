/**
 * File: src/ai/output_generation/imageGenerator.ts
 * Purpose: Minimal image generator stub that returns placeholder image URLs based on prompt.
 */

export const generateImage = async (prompt: string) => {
  // Return a placeholder image URL for MVP
  const encoded = encodeURIComponent(prompt).slice(0, 64);
  return { url: `https://via.placeholder.com/512?text=${encoded}` };
};
