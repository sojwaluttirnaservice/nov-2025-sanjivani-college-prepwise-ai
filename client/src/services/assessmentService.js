import { instance } from "../utils/instance";

export const assessmentService = {
  /**
   * Start an assessment for a specific unit.
   * @param {string} unitId
   * @returns {Promise<Object>} { attemptId, quizType, questions, totalQuestions }
   */
  startAssessment: async (unitId) => {
    const response = await instance.post(`/assessments/${unitId}/start`);
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
};
