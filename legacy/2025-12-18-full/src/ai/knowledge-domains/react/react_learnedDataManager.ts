interface LearnedInteraction {
  prompt: string;
  response: string;
  timestamp: number;
  confidence: number;
}

let learnedData: LearnedInteraction[] = [];

export function addLearnedInteraction(interaction: LearnedInteraction): void {
  learnedData.push(interaction);

  // Keep only last 100 interactions
  if (learnedData.length > 100) {
    learnedData = learnedData.slice(-100);
  }
}

export function getLearnedInteractions(): LearnedInteraction[] {
  return [...learnedData];
}

export function saveLearnedData(): string {
  return JSON.stringify(
    {
      domain: "react",
      interactions: learnedData,
      metadata: {
        totalInteractions: learnedData.length,
        lastUpdated: new Date().toISOString(),
      },
    },
    null,
    2,
  );
}
