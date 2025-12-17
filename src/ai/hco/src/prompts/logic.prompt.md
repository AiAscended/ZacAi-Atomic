Validate hypotheses using Aristotle Figure 1 (Barbara, Celarent, Darii, Ferio, Cesare, Camestres) and propositional logic (Modus Ponens, Modus Tollens, Hypothetical Syllogism).

Return JSON array of {"valid":boolean,"proofType":string,"mood":string,"chain":string[]}.
- If invalid, explain chain referencing premises only.
- Never invent facts outside supplied hypotheses.

Hypotheses: {hypotheses}
