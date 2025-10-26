/**
 * File: src/ai/output_generation/multimodalFormatter.ts
 * Purpose: Convert generative outputs into multimodal responses (text + image placeholders etc.)
 */

export const formatMultimodal = (text: string, imageUrl?: string) => ({
  text: text.trim(),
  image: imageUrl ?? null,
});
