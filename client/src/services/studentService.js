import { STUDENT_STATS } from "../data/student";
import { instance } from "../utils/instance";

// Mock Data
const MOCK_SUBJECTS = [
  { id: "sub-1", name: "Software Engineering", code: "SE", units: 6 },
  { id: "sub-2", name: "Database Management", code: "DBMS", units: 5 },
  { id: "sub-3", name: "Computer Networks", code: "CN", units: 4 },
  { id: "sub-4", name: "Management", code: "MAN", units: 6 },
];

const MOCK_UNITS = {
  "sub-1": [
    { id: "u1", title: "Unit I: Introduction to SE", topics: 8 },
    { id: "u2", title: "Unit II: Software Process Models", topics: 10 },
    { id: "u3", title: "Unit III: Agility", topics: 12 },
  ],
  // ... add more as needed
};

const MOCK_QUESTIONS = [
  {
    id: "q1",
    question: "Which of the following is NOT a phase of the Waterfall model?",
    options: ["Requirements", "Design", "Coding", "Marketing"],
    topicCode: "SDLC-01",
    subtopic: "Waterfall Phases",
  },
  {
    id: "q2",
    question: "Agile methodology focuses on:",
    options: [
      "Rigid planning",
      "Iterative development",
      "Minimal communication",
      "Sequential phases",
    ],
    topicCode: "AG-01",
    subtopic: "Agile Principles",
  },
  // Mocking 10 questions...
  ...Array(8)
    .fill(0)
    .map((_, i) => ({
      id: `q${i + 3}`,
      question: `Sample Question ${i + 3} for Assessment Training?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      topicCode: `TOPIC-${i}`,
      subtopic: `Subtopic ${i}`,
    })),
];

export const studentService = {
  getStats: async () => {
    const response = await instance.get("/analytics/dashboard");
    console.log(
      "[Service] getStats - Full response from interceptor:",
      response,
    );
    console.log("[Service] getStats - response.data:", response.data);
    // Interceptor already returns response.data, so response IS the API envelope
    // API structure: { statusCode, success, data: { stats: {...} } }
    return response.data; // This returns { stats: {...} }
  },

  getDashboardStats: async () => {
    const response = await instance.get("/analytics/dashboard");
    console.log("[Service] Dashboard - Full interceptor response:", response);
    console.log(
      "[Service] Dashboard - response.data (payload):",
      response.data,
    );
    // Interceptor already unwrapped, response = { statusCode, success, data: {...} }
    return response.data; // Returns { stats: {...} }
  },

  getPerformanceTrends: async (range = "30d") => {
    const response = await instance.get(
      `/analytics/performance?range=${range}`,
    );
    console.log(
      `[Service] Performance (${range}) - response.data:`,
      response.data,
    );
    return response.data; // Returns { trends: [...] }
  },

  getTopicMastery: async () => {
    const response = await instance.get("/analytics/topics");
    console.log("[Service] Topics - response.data:", response.data);
    return response.data; // Returns { topics: [...] }
  },

  getSubjects: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_SUBJECTS), 500);
    });
  },

  getUnits: async (subjectId) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_UNITS[subjectId] || []), 500);
    });
  },
};
