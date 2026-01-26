/**
 * Constructs the prompt for analyzing a quiz attempt.
 */
const constructAnalysisPrompt = (input) => {
  const { unit, score, totalQuestions, weakTopics } = input;

  const systemPrompt = `
You are an AI learning analyst.
Your task is to generate SHORT, CLEAR, and ACTIONABLE feedback for a student.

STRICT RULES:
- Maximum 120 words
- No paragraphs
- Use bullet points only (•)
- Avoid generic motivation or theory explanations
- Be direct but supportive

FORMAT (follow exactly):

Strengths:
• <1–2 brief points>

Focus Areas:
• <List weak topics only>

Next Step:
• <One clear action the student should take next>
`;

  const userPrompt = `
Assessment Details:
- Unit: ${unit.name}
- Score: ${score}/${totalQuestions}
- Weak Topics: ${
    weakTopics.length ? weakTopics.map((t) => t.topicTitle).join(", ") : "None"
  }

Generate feedback using the exact format above.
`;

  return { systemPrompt, userPrompt };
};

module.exports = { constructAnalysisPrompt };
