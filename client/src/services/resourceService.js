import { instance } from "../utils/instance";

const resourceService = {
  /**
   * Fetch all branches
   * @returns {Promise<Array>} List of branches
   */
  getBranches: async () => {
    const response = await instance.get("/resources/branches");
    return response.data;
  },

  /**
   * Fetch all subjects
   * @param {string} [branchId] Optional branch filter
   * @returns {Promise<Array>} List of subjects
   */
  getSubjects: async (branchId) => {
    const params = branchId ? { branchId } : {};
    const response = await instance.get("/resources/subjects", { params });
    return response.data;
  },

  /**
   * Fetch units for a subject
   * @param {string} subjectId
   * @returns {Promise<Array>} List of units
   */
  getUnits: async (subjectId) => {
    const response = await instance.get(
      `/resources/subjects/${subjectId}/units`,
    );
    return response.data;
  },
};

export { resourceService };
