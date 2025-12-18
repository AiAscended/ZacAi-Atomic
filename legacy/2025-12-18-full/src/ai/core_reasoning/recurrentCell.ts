/**
 * File: src/ai/core_reasoning/recurrentCell.ts
 * Description: Minimal RNN cell (tanh) for sequence modeling experiments.
 */

export const rnnCell = (
  input: number[],
  prevState: number[],
  wx: number[][],
  wh: number[][],
  b: number[],
): number[] => {
  const hiddenSize = prevState.length;
  const newState = new Array<number>(hiddenSize).fill(0);
  for (let i = 0; i < hiddenSize; i++) {
    let s = b[i] || 0;
    for (let j = 0; j < input.length; j++) s += (wx[i][j] || 0) * input[j];
    for (let j = 0; j < prevState.length; j++)
      s += (wh[i][j] || 0) * prevState[j];
    newState[i] = Math.tanh(s);
  }
  return newState;
};
