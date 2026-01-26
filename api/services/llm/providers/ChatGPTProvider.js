const OpenAI = require("openai");
const LLMProvider = require("../LLMProvider");
const config = require("../../../config/config");
const {
  constructQuestionGenerationPrompt,
} = require("../prompts/questionGenerationPrompt");

class ChatGPTProvider extends LLMProvider {
  constructor() {
    super();
    if (!config.llm.openaiApiKey) {
      throw new Error("Missing OPENAI_API_KEY for ChatGPTProvider");
    }
    this.openai = new OpenAI({
      apiKey: config.llm.openaiApiKey,
    });
    this.model = config.llm.openaiModel || "gpt-3.5-turbo";
  }

  async generateQuestions(input) {
    const { systemPrompt, userPrompt } =
      constructQuestionGenerationPrompt(input);

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: this.model,
        temperature: 0.7, // Balance creativity and deterministic structure
        response_format: { type: "json_object" }, // Enforce JSON mode
      });

      const rawContent = completion.choices[0].message.content;

      // Parse JSON
      let data;
      try {
        data = JSON.parse(rawContent);
        // Sometimes the model might wrap the array in a key like "questions": [...]
        if (
          !Array.isArray(data) &&
          data.questions &&
          Array.isArray(data.questions)
        ) {
          data = data.questions;
        }
      } catch (parseError) {
        throw new Error(
          `Failed to parse LLM JSON response: ${parseError.message}`,
        );
      }

      // Validate Structure using the Base Class method
      return this.validateQuestions(data, input);
    } catch (error) {
      console.error("ChatGPT Question Generation Error:", error);
      throw error; // Re-throw to be handled by caller
    }
  }

  async analyzeQuizAttempt(input) {
    // Stub
    return { analysis: "Not implemented yet" };
  }
}

module.exports = ChatGPTProvider;
