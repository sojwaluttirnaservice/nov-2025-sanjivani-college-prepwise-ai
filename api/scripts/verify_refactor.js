const assert = require("assert");
const path = require("path");
const { UNIT_STATES } = require("../schemas/UnitAttempt");

// Set up paths
const modelsDir = path.join(__dirname, "../models");

// Load Models
const unitAttemptsModel = require(
  path.join(modelsDir, "unitAttempts.model.js"),
);
const quizAttemptsModel = require(
  path.join(modelsDir, "quizAttempts.model.js"),
);
const questionsModel = require(path.join(modelsDir, "questions.model.js"));

// Patch Mongoose Models
const QuizAttempt = quizAttemptsModel.Model;
const UnitAttempt = unitAttemptsModel.Model;

async function runTests() {
  console.log("Running detailed verification tests...");

  // --- TEST: weakTopics Analysis ---
  console.log("Test: evaluateAndSubmit with Weak Topics...");

  const mockAttemptId = "attempt_rich_123";
  const mockAnswers = [
    { questionId: "q1", selectedOption: "A" }, // Correct
    { questionId: "q2", selectedOption: "B" }, // Incorrect
  ];

  // Mock QuizAttempt.findById
  QuizAttempt.findById = async (id) => {
    if (id === mockAttemptId) {
      return {
        _id: mockAttemptId,
        status: "IN_PROGRESS",
        totalQuestions: 2,
        unitAttemptId: "unit_123",
      };
    }
    return null;
  };

  // Mock questionsModel.Model.find().populate()
  questionsModel.Model = {
    find: (query) => {
      return {
        populate: async (path, select) => {
          return [
            {
              _id: "q1",
              correctOption: "A",
              topicId: { _id: "topic_1", name: "Arrays" }, // Correct
            },
            {
              _id: "q2",
              correctOption: "C",
              topicId: { _id: "topic_2", name: "Pointers" }, // Incorrect (Ans B vs C)
            },
          ];
        },
      };
    },
  };

  // Mock QuizAttempt.findByIdAndUpdate
  let updateArgs = null;
  QuizAttempt.findByIdAndUpdate = async (id, updates, options) => {
    updateArgs = updates;
    return { ...updates, _id: id, toObject: () => ({ ...updates, _id: id }) };
  };

  const result = await quizAttemptsModel.evaluateAndSubmit(
    mockAttemptId,
    mockAnswers,
  );

  assert.strictEqual(result.score, 1, "Score should be 1");
  assert.strictEqual(result.percentage, 50, "Percentage should be 50");
  assert.strictEqual(result.status, "SUBMITTED", "Status should be SUBMITTED");

  // Verify Weak Topics
  assert.ok(result.weakTopics, "weakTopics should exist");
  assert.strictEqual(result.weakTopics.length, 1, "Should have 1 weak topic");
  assert.strictEqual(
    result.weakTopics[0].topicTitle,
    "Pointers",
    "Weak topic should be Pointers",
  );
  console.log("PASS: Weak Topics Analysis");
}

runTests().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
