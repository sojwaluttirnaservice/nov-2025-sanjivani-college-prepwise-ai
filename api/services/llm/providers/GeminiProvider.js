const { GoogleGenerativeAI } = require("@google/generative-ai");
const LLMProvider = require("../LLMProvider");
const config = require("../../../config/config");
const {
  constructQuestionGenerationPrompt,
} = require("../prompts/questionGenerationPrompt");

class GeminiProvider extends LLMProvider {
  constructor() {
    super();
    if (!config.llm.geminiApiKey) {
      throw new Error("Missing GEMINI_API_KEY for GeminiProvider");
    }
    this.genAI = new GoogleGenerativeAI(config.llm.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({
      model: config.llm.geminiModel || "gemini-1.5-pro",
    });
  }

  async generateQuestions(input) {
    const { systemPrompt, userPrompt } =
      constructQuestionGenerationPrompt(input);

    try {
      // Gemini 1.5 Pro supports system instructions via model config or prepended text.
      // We will prepend system instructions to the prompt for robust compatibility or use new systemInstruction if available in SDK version.
      // But purely text-based prompting works well if structured clearly.

      const combinedPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

      const result = await this.model.generateContent(combinedPrompt);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown block quotes if present (Gemini loves markdown)
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let data;
      try {
        data = JSON.parse(text);
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
      console.error("Gemini Question Generation Error:", error);
      throw error;
    }
  }

  async analyzeQuizAttempt(input) {
    // Stub
    return { analysis: "Not implemented yet" };
  }
}

module.exports = GeminiProvider;
