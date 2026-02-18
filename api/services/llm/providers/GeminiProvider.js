const { GoogleGenerativeAI } = require("@google/generative-ai");
const LLMProvider = require("../LLMProvider");
const config = require("../../../config/config");
const {
  constructQuestionGenerationPrompt,
} = require("../prompts/questionGenerationPrompt");
const { isGeminiQuotaExceeded } = require("../../../utils/llmErrors");

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

  createQuotaError() {
    const err = new Error(
      "AI capacity is temporarily unavailable. Please try again in a few minutes.",
    );
    err.statusCode = 503;
    err.code = "AI_QUOTA_EXCEEDED";
    return err;
  }

  async generateQuestions(input) {
    // Optional: Check if Gemini is disabled
    if (process.env.GEMINI_DISABLED === "true") {
      throw this.createQuotaError();
    }

    const { systemPrompt, userPrompt } =
      constructQuestionGenerationPrompt(input);

    const MAX_RETRIES = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `[GeminiProvider] Question Generation Attempt ${attempt}/${MAX_RETRIES}`,
        );

        const combinedPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
        const result = await this.model.generateContent(combinedPrompt);
        const response = await result.response;
        let text = response.text();

        // Robust JSON Extraction
        text = text.replace(/```json/g, "").replace(/```/g, "");
        const firstBracket = text.indexOf("[");
        const lastBracket = text.lastIndexOf("]");

        if (
          firstBracket !== -1 &&
          lastBracket !== -1 &&
          lastBracket > firstBracket
        ) {
          text = text.substring(firstBracket, lastBracket + 1);
        } else {
          text = text.trim();
        }

        let data;
        try {
          data = JSON.parse(text);
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

        // Normalize options
        if (Array.isArray(data)) {
          data.forEach((q) => {
            if (Array.isArray(q.options)) {
              q.options.forEach((opt, idx) => {
                if (!opt.key) {
                  const keys = ["A", "B", "C", "D"];
                  opt.key = keys[idx] || String.fromCharCode(65 + idx);
                }
              });
            }
          });
        }

        return this.validateQuestions(data, input);
      } catch (error) {
        console.warn(
          `[GeminiProvider] Attempt ${attempt} failed:`,
          error.message,
        );

        // 🚨 HARD STOP on quota exhaustion
        if (isGeminiQuotaExceeded(error)) {
          throw this.createQuotaError();
        }

        lastError = error;

        // Only retry NON-quota errors
        if (attempt < MAX_RETRIES) {
          const delay = 2000 * attempt;
          console.log(`[GeminiProvider] Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    console.error("Gemini Question Generation All Retries Failed:", lastError);

    // Generic error for non-quota failures
    const customError = new Error(
      "We encountered a temporary issue generating your assessment. Please try again.",
    );
    customError.statusCode = 500;
    throw customError;
  }

  async analyzeQuizAttempt(input) {
    try {
      const { constructAnalysisPrompt } = require("../prompts/analysisPrompt");
      const { systemPrompt, userPrompt } = constructAnalysisPrompt(input);

      const combinedPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
      const result = await this.model.generateContent(combinedPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn("[GeminiProvider] Analysis failed:", error.message);

      // Graceful degradation on quota exhaustion
      if (isGeminiQuotaExceeded(error)) {
        return "Performance analysis will be available shortly. Please continue learning in the meantime.";
      }

      // Return fallback for other errors too (analysis is non-critical)
      return "Analysis pending. Please check back in a few minutes for your personalized performance insights.";
    }
  }

  async generateStudyNotes(input) {
    try {
      const {
        constructStudyNotesPrompt,
      } = require("../prompts/studyNotesPrompt");
      const { systemPrompt, userPrompt } = constructStudyNotesPrompt(input);

      console.log(
        `[GeminiProvider] Generating Study Notes for: ${input.topics.join(", ")}`,
      );

      const combinedPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
      const result = await this.model.generateContent(combinedPrompt);
      const response = await result.response;
      let text = response.text();

      // Clean up potential markdown code blocks wrapping the output
      text = text
        .replace(/^```markdown\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/```$/, "");

      // PARSE MARKDOWN TO EXTRACT SCHEMA FIELDS
      // 1. Extract Summary (from "What You Got Wrong")
      let summary = "Remedial notes for weak areas.";
      const summaryMatch = text.match(
        /## 🔎 What You Got Wrong\s+([\s\S]*?)(?=\n\n---|\n\n##)/,
      );
      if (summaryMatch && summaryMatch[1]) {
        summary = summaryMatch[1].trim();
      }

      // 2. Extract Key Points (from "Mistake Breakdown")
      let keyPoints = ["Review the concepts below carefully."];
      const mistakesMatch = text.match(
        /## ❌ Mistake Breakdown\s+([\s\S]*?)(?=\n\n---|\n\n##)/,
      );
      if (mistakesMatch && mistakesMatch[1]) {
        // Extract mistake titles from ### headings
        const mistakeTitles = [];
        const titleMatches = mistakesMatch[1].matchAll(
          /###\s+\d+\.\s+(.+?)\n/g,
        );
        for (const match of titleMatches) {
          mistakeTitles.push(match[1].trim());
        }

        if (mistakeTitles.length > 0) {
          keyPoints = mistakeTitles;
        }
      }

      // 3. Detailed Content is the full markdown
      const detailedContent = text;

      return {
        summary,
        keyPoints,
        detailedContent,
      };
    } catch (error) {
      console.error(
        "[GeminiProvider] Study Notes generation failed:",
        error.message,
      );

      if (isGeminiQuotaExceeded(error)) {
        throw this.createQuotaError();
      }

      throw new Error(
        "Failed to generate study notes. Please try again later.",
      );
    }
  }
}

module.exports = GeminiProvider;
