/**
 * Constructs the system prompt and user prompt for question generation.
 */
const constructQuestionGenerationPrompt = (input) => {
  const { unit, topics, quizType, totalQuestions, difficultyDistribution } =
    input;

  const systemPrompt = `
You are an expert educational content generator for a computer science curriculum.
Your specific task is to generate multiple-choice questions (MCQs) for a specific Unit of a Subject.

Output Constraints (CRITICAL):
1. You MUST return ONLY a raw JSON array. Do not wrap it in markdown block quotes (e.g. \`\`\`json).
2. The JSON must be an array of objects matching this schema exactly:
   [
     {
       "topicId": "ID_FROM_INPUT",
       "questionText": "Clear question stem",
       "options": [
         { "key": "A", "text": "Option text" },
         { "key": "B", "text": "Option text" },
         { "key": "C", "text": "Option text" },
         { "key": "D", "text": "Option text" }
       ],
       "correctOption": "key of correct option (A, B, C, or D)",
       "explanation": "Brief explanation of why the answer is correct",
       "difficulty": "EASY" | "MEDIUM" | "HARD"
     }
   ]

3. Rules for Content:
   - "topicId" MUST be one of the IDs provided in the input topics list. Map the question content to the most relevant topic.
   - Questions should be conceptually accurate for the provided unit context.
   - Distribute difficulty according to the request: EASY (${difficultyDistribution.EASY}), MEDIUM (${difficultyDistribution.MEDIUM}), HARD (${difficultyDistribution.HARD}).
  `;

  const inputContext = JSON.stringify(
    {
      Context: {
        Unit: unit.name,
        Subject_Context: "Applied Computer Science", // Generic context or passed from above
      },
      Topics_List: topics.map((t) => ({
        id: t.id,
        name: t.name,
        focus_weight: t.weight,
      })),
      Requirements: {
        Quiz_Type: quizType,
        Total_Questions: totalQuestions,
        Difficulty_Target: difficultyDistribution,
      },
    },
    null,
    2,
  );

  const userPrompt = `
Generate ${totalQuestions} unique multiple-choice questions based on the following context.
Ensure strict adherence to the JSON schema provided in the system instruction.

Input Context:
${inputContext}
  `;

  return { systemPrompt, userPrompt };
};

module.exports = { constructQuestionGenerationPrompt };
