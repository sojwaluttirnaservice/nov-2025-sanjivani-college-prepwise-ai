/**
 * Base LLM Provider Interface
 * Defines the contract that all LLM providers must implement.
 */
class LLMProvider {
  constructor(config = {}) {
    if (new.target === LLMProvider) {
      throw new Error("Cannot instantiate abstract LLMProvider directly");
    }
  }

  /**
   * Generates questions based on the input context using the LLM.
   *
   * @param {Object} input - Context for question generation
   * @param {Object} input.unit - { id, name }
   * @param {Array<Object>} input.topics - type { id, name, weight }
   * @param {string} input.quizType - "DIAGNOSTIC" | "ADAPTIVE"
   * @param {number} input.totalQuestions - Total questions to generate
   * @param {Object} input.difficultyDistribution - { EASY, MEDIUM, HARD }
   *
   * @returns {Promise<Array<Object>>} Structured array of question objects (see Output Contract)
   */
  async generateQuestions(input) {
    throw new Error("generateQuestions() must be implemented by provider");
  }

  /**
   * Analyzes a completed quiz attempt.
   * (Stub for future implementation)
   */
  async analyzeQuizAttempt(input) {
    throw new Error("analyzeQuizAttempt() must be implemented by provider");
  }

  /**
   * Generates study notes for weak topics.
   *
   * @param {Object} input - { topics: [string] }
   * @returns {Promise<Object>} { summary, keyPoints, detailedContent }
   */
  async generateStudyNotes(input) {
    throw new Error("generateStudyNotes() must be implemented by provider");
  }

  /**
   * Helper to validate that the output JSON matches the required Question schema structure.
   * Throws detailed errors if validation fails.
   */
  validateQuestions(questions, inputContext) {
    if (!Array.isArray(questions)) {
      throw new Error("LLM Output Error: Expected an array of questions.");
    }

    if (questions.length === 0) {
      throw new Error("LLM Output Error: Received empty questions array.");
    }

    questions.forEach((q, idx) => {
      if (!q.topicId) {
        throw new Error(
          `Question ${idx + 1} validation failed: Missing topicId`,
        );
      }
      // Ensure topicId belongs to one of the input topics
      const isValidTopic = inputContext.topics.some(
        (t) => String(t.id) === String(q.topicId),
      );
      if (!isValidTopic) {
        throw new Error(
          `Question ${idx + 1} validation failed: topicId ${q.topicId} not found in input topics`,
        );
      }
      if (!q.questionText) {
        throw new Error(
          `Question ${idx + 1} validation failed: Missing questionText`,
        );
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(
          `Question ${idx + 1} validation failed: Must have at least 2 options`,
        );
      }
      if (!q.correctOption) {
        throw new Error(
          `Question ${idx + 1} validation failed: Missing correctOption`,
        );
      }
      // Check if correctOption matches one of the option keys
      const optionKeys = q.options.map((o) => o.key);
      if (!optionKeys.includes(q.correctOption)) {
        throw new Error(
          `Question ${idx + 1} validation failed: correctOption '${q.correctOption}' not found in options [${optionKeys}]`,
        );
      }
      if (!["EASY", "MEDIUM", "HARD"].includes(q.difficulty)) {
        throw new Error(
          `Question ${idx + 1} validation failed: Invalid difficulty '${q.difficulty}'`,
        );
      }
    });

    return questions;
  }
}

module.exports = LLMProvider;
