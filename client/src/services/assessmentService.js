import { instance } from "../utils/instance";

export const assessmentService = {
  /**
   * Start an assessment for a specific unit.
   * @param {string} unitId
   * @returns {Promise<Object>} { attemptId, quizType, questions, totalQuestions }
   */
  startAssessment: async (unitId) => {
    const response = await instance.post(
      `/assessments/${unitId}/start`,
      {},
      {
        timeout: 60000, // Increase timeout to 60s for LLM generation
      },
    );
    return response.data;
  },

  /**
   * Submit assessment answers.
   * @param {string} attemptId
   * @param {Array<{questionId: string, selectedOption: string}>} answers
   * @returns {Promise<Object>} { score, percentage, masteryAchieved, state }
   */
  submitAssessment: async (attemptId, answers) => {
    const response = await instance.post(`/assessments/${attemptId}/submit`, {
      answers,
    });
    return response.data;
  },

  /**
   * Get assessment history.
   * @returns {Promise<Array>} List of past assessments
   */
  getHistory: async () => {
    const response = await instance.get("/assessments/history");
    return response.data;
  },

  /**
   * Update elapsed time for active assessment (auto-save).
   * @param {string} attemptId
   * @param {number} timeSpent - Elapsed time in seconds
   */
  updateTimeSpent: async (attemptId, timeSpent) => {
    const response = await instance.patch(`/assessments/${attemptId}/time`, {
      timeSpent,
    });
    return response.data;
  },

  /**
   * Get specific assessment result with analysis.
   * @param {string} attemptId
   */
  getResult: async (attemptId) => {
    const response = await instance.get(`/assessments/${attemptId}/result`);
    return response.data;
  },
};
