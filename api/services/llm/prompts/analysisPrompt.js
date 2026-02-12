/**
 * Constructs the prompt for analyzing a quiz attempt.
 *
 * @param {Object} input - { unit, score, totalQuestions, weakTopics, analysisVersion?, previousAnalysis? }
 */
const constructAnalysisPrompt = (input) => {
  const {
    unit,
    score,
    totalQuestions,
    weakTopics,
    analysisVersion = 1,
    previousAnalysis = null,
  } = input;

  let systemPrompt = `
You are an AI learning analyst.
Your task is to generate SHORT, CLEAR, and ACTIONABLE feedback for a student.

STRICT RULES:
- Maximum 120 words
- No paragraphs
- Use bullet points only (•)
- Avoid generic motivation or theory explanations
- Be direct but supportive
`;

  // CRITICAL: Add variation instructions for re-analysis
  if (analysisVersion > 1) {
    systemPrompt += `
🔄 RE-ANALYSIS MODE (Version ${analysisVersion}):
- This is a REVISED analysis, NOT the first one
- Provide a DIFFERENT perspective from the initial feedback
- Use different wording and structure
- Focus MORE on actionable study strategies and resources
- Avoid repeating the same advice
- Consider progression: what should they do NEXT after seeing the first analysis?
`;
  }

  systemPrompt += `
FORMAT (follow exactly):

Strengths:
• <1–2 brief points>

Focus Areas:
• <List weak topics only>

Next Step:
• <One clear action the student should take next>
`;

  let userPrompt = `
Assessment Details:
- Unit: ${unit.name}
- Score: ${score}/${totalQuestions}
- Weak Topics: ${
    weakTopics.length ? weakTopics.map((t) => t.topicTitle).join(", ") : "None"
  }
`;

  // Include previous analysis for context (avoid repetition)
  if (analysisVersion > 1 && previousAnalysis) {
    userPrompt += `

Previous Analysis (DO NOT REPEAT):
---
${previousAnalysis.substring(0, 500)}...
---

Generate DIFFERENT feedback with a fresh perspective using the exact format above.
`;
  } else {
    userPrompt += `

Generate feedback using the exact format above.
`;
  }

  return { systemPrompt, userPrompt };
};

module.exports = { constructAnalysisPrompt };
