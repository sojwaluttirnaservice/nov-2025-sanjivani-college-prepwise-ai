import { instance } from "../utils/instance";

export const adminService = {
  /**
   * Get all students with pagination and filtering
   * @param {Object} params - { page, limit, search, branch, year, semester }
   */
  getStudents: async (params) => {
    const response = await instance.get("/users", { params });
    return response.data;
  },

  /**
   * Get all branches for dropdown
   */
  getBranches: async () => {
    const response = await instance.get("/resources/branches");
    return response.data;
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async () => {
    const response = await instance.get("/admin/stats");
    return response.data;
  },

  /**
   * Get student details by ID
   * @param {string} id
   */
  getStudentById: async (id) => {
    // We can reuse the profile endpoint if we allowed admins to view profiles by ID
    // But currently /users/me is only for the logged-in user.
    // Let's assume for now we might need a specific endpoint or just fetch the list and filter client-side if we don't have a direct endpoint yet.
    // Actually, looking at usersController, we don't have a getStudentById endpoint yet.
    // But we DO have getUsers.
    // For now, let's just use getUsers with a search by ID or Email if needed, or unimplemented.
    // WAIT: The plan didn't explicitly add getStudentById to backend.
    // Let's implement getStudentById in frontend by reuse or add it to backend if strictly needed.
    // Actually, I can add a `getStudentById` to backend easily?
    // UsersRouter doesn't have it.
    // Let's stick to the list for now, and maybe just show details from the list data or add the endpoint if I find I need it.
    // Actually, for a detail view, I usually need fetched data.
    // Let's add `getStudentById` to backend quickly to be robust.
    const response = await instance.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Get student analytics (stats, trends, topics)
   * @param {string} studentId
   */
  getStudentAnalytics: async (studentId) => {
    const response = await instance.get(
      `/admin/students/${studentId}/analytics`,
    );
    return response.data;
  },

  // --- ACADEMIC MANAGEMENT ---

  // Branches
  createBranch: async (data) => {
    const response = await instance.post("/admin/resources/branches", data);
    return response.data;
  },

  updateBranch: async (id, data) => {
    const response = await instance.put(
      `/admin/resources/branches/${id}`,
      data,
    );
    return response.data;
  },

  deleteBranch: async (id) => {
    const response = await instance.delete(`/admin/resources/branches/${id}`);
    return response.data;
  },

  // Subjects
  getSubjects: async (params) => {
    const response = await instance.get("/resources/subjects", { params });
    return response.data;
  },

  getSubject: async (id) => {
    const response = await instance.get(`/admin/resources/subjects/${id}`);
    return response.data;
  },

  createSubject: async (data) => {
    const response = await instance.post("/admin/resources/subjects", data);
    return response.data;
  },

  updateSubject: async (id, data) => {
    const response = await instance.put(
      `/admin/resources/subjects/${id}`,
      data,
    );
    return response.data;
  },

  deleteSubject: async (id) => {
    const response = await instance.delete(`/admin/resources/subjects/${id}`);
    return response.data;
  },
  // --- UNITS & TOPICS ---

  // Units
  getUnits: async (subjectId) => {
    const response = await instance.get(
      `/admin/resources/subjects/${subjectId}/units`,
    );
    return response.data;
  },

  createUnit: async (subjectId, data) => {
    const response = await instance.post(
      `/admin/resources/subjects/${subjectId}/units`,
      data,
    );
    return response.data;
  },

  updateUnit: async (unitId, data) => {
    const response = await instance.put(
      `/admin/resources/units/${unitId}`,
      data,
    );
    return response.data;
  },

  deleteUnit: async (unitId) => {
    const response = await instance.delete(`/admin/resources/units/${unitId}`);
    return response.data;
  },

  // Topics
  getTopics: async (unitId) => {
    const response = await instance.get(
      `/admin/resources/units/${unitId}/topics`,
    );
    return response.data;
  },

  createTopic: async (unitId, data) => {
    const response = await instance.post(
      `/admin/resources/units/${unitId}/topics`,
      data,
    );
    return response.data;
  },

  updateTopic: async (topicId, data) => {
    const response = await instance.put(
      `/admin/resources/topics/${topicId}`,
      data,
    );
    return response.data;
  },

  deleteTopic: async (topicId) => {
    const response = await instance.delete(
      `/admin/resources/topics/${topicId}`,
    );
    return response.data;
  },
};
