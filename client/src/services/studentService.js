import { STUDENT_STATS } from "../data/student";

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
    return new Promise((resolve) => {
      setTimeout(() => resolve(STUDENT_STATS), 500);
    });
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

  startAssessment: async (payload) => {
    console.log("Starting Assessment with:", payload);
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_QUESTIONS), 1000);
    });
  },

  submitAssessment: async (payload) => {
    console.log("Submitting Assessment:", payload);
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            score: 8,
            accuracy: 80,
            weakTopics: [
              {
                topicCode: "SDLC-01",
                topicTitle: "Software Development Life Cycle",
                subtopics: ["Waterfall Model Limitations"],
              },
              {
                topicCode: "AG-01",
                topicTitle: "Agile Principles",
                subtopics: ["Scrum Framework"],
              },
            ],
          }),
        1000
      );
    });
  },
};
