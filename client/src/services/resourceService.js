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
};

export { resourceService };
