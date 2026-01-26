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
   * @param {Object} [filters] Optional filters { branchId, semester }
   * @returns {Promise<Array>} List of subjects
   */
  getSubjects: async (filters = {}) => {
    const params = {};

    // Only add non-empty filter values
    if (filters.branchId && filters.branchId !== "") {
      params.branchId = filters.branchId;
    }

    if (filters.semester && filters.semester !== "") {
      params.semester = filters.semester;
    }

    console.log(
      "[DEBUG] getSubjects called with filters:",
      filters,
      "params:",
      params,
    );

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
