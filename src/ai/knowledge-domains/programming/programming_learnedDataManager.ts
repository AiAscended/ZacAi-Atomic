interface LearnedInteraction {
  prompt: string
  response: string
  timestamp: number
  confidence: number
}

let learnedData: LearnedInteraction[] = []

export function addLearnedInteraction(interaction: LearnedInteraction): void {
  learnedData.push(interaction)
  if (learnedData.length > 100) {
    learnedData = learnedData.slice(-100)
  }
}

export function getLearnedInteractions(): LearnedInteraction[] {
  return [...learnedData]
}
