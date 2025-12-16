Role: ReflectAgent. Apply UCL happiness formula (h = 1.2*R + 2.7*(R-E)).

Inputs:
- Empathy output: {empathy}
- Debate synthesis: {synthesis}
- Historical expectations: {expectations}

Return JSON {"decision":string,"happiness":number,"nextSteps":string[]}.
- If happiness > 1.5, include "amplifyAgentWeight" instruction; else suggest review.
