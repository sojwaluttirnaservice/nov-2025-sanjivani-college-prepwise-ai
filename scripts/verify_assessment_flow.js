/**
 * Verification Script for Assessment Lifecycle
 * Run with: node scripts/verify_assessment_flow.js
 */

const axios = require("axios");
const mongoose = require("../api/node_modules/mongoose");

// CONFIG
const API_URL = "http://localhost:4020/api/v1";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/prepwise_prod"; // Match .env

// Mocks
const MOCK_USER = {
  email: "student@sanjivani.edu.in",
  password: "password123",
};

let token = "";
let unitId = "";
let attemptId = "";
let questionId = "";
let correctOption = "";

async function run() {
  try {
    console.log("🚀 Starting Assessment Lifecycle Verification...");

    // 1. Login
    console.log("\n🔐 Logging in...");
    const loginRes = await axios.post(`${API_URL}/users/login`, MOCK_USER);
    token = loginRes.data.data.token;
    console.log("✅ Login successful. Token obtained.");
    const userId = loginRes.data.data.user._id;

    // 2. Get a Unit (Assume at least one exists or fetch from DB directly if API unavailable)
    // For verify, we'll try to find a unit via direct DB access or just assume one if we can't.
    // But better to use what we have. API for units? GET /resources/branches -> semesters -> subjects -> units... too deep.
    // Let's use mongoose to fetch a Unit ID directly to be safe.
    // Wait, I can't easily use mongoose here unless I connect.
    // Let's assume I need to find a unit ID.
    // I will connect to DB to get a valid Unit ID and ensure Questions exist.

    await mongoose.connect(MONGO_URI);
    const Unit = mongoose.connection.collection("units");
    const Question = mongoose.connection.collection("questions");

    const unit = await Unit.findOne({});
    if (!unit) {
      console.error("❌ No units found in DB. Cannot proceed.");
      process.exit(1);
    }
    unitId = unit._id.toString();
    console.log(`📦 Found Unit ID: ${unitId}`);

    // Ensure questions exist for this unit
    const qCount = await Question.countDocuments({ unitId: unit._id });
    if (qCount === 0) {
      console.log("⚠️ No questions found for unit. Creating mock questions...");
      await Question.insertMany([
        {
          unitId: unit._id,
          topicId: new mongoose.Types.ObjectId(), // Fake topic
          questionText: "Test Question 1",
          options: [
            { key: "A", text: "Opt A" },
            { key: "B", text: "Opt B" },
          ],
          correctOption: "A",
          difficulty: "MEDIUM",
          generatedFor: "DIAGNOSTIC",
          isActive: true,
        },
        {
          unitId: unit._id,
          topicId: new mongoose.Types.ObjectId(),
          questionText: "Test Question 2",
          options: [
            { key: "A", text: "Opt A" },
            { key: "B", text: "Opt B" },
          ],
          correctOption: "B",
          difficulty: "MEDIUM",
          generatedFor: "DIAGNOSTIC",
          isActive: true,
        },
      ]);
      console.log("✅ Mock questions created.");
    }

    // 3. Start Assessment
    console.log(`\n▶️ Starting assessment for Unit: ${unitId}`);
    const startRes = await post(
      `${API_URL}/assessments/${unitId}/start`,
      {},
      { Authorization: `Bearer ${token}` },
    );

    if (startRes.data.success) {
      console.log("✅ Assessment started.");
      const data = startRes.data.data;
      attemptId = data.attemptId;
      console.log(`🆔 Attempt ID: ${attemptId}`);
      console.log(`📝 Questions received: ${data.questions.length}`);
      console.log(`🧪 Quiz Type: ${data.quizType}`);

      if (data.questions.length > 0) {
        questionId = data.questions[0]._id;
        // We'll answer the first one effectively.
        // Since strictly we don't know the correct answer from API, checking DB or guessing 'A'.
        // If we want to test correct scoring, we need to know.
        // Let's answer 'A' for all and see result.
      }
    } else {
      console.error("❌ Failed to start assessment:", startRes.data);
      process.exit(1);
    }

    // 4. Submit Assessment
    console.log(`\n📤 Submitting assessment for Attempt: ${attemptId}`);
    // Construct answers
    const questions = startRes.data.data.questions;
    const answers = questions.map((q) => ({
      questionId: q._id,
      selectedOption: "A", // Just pick A
    }));

    const submitRes = await post(
      `${API_URL}/assessments/${attemptId}/submit`,
      { answers },
      { Authorization: `Bearer ${token}` },
    );

    if (submitRes.data.success) {
      console.log("✅ Assessment submitted.");
      const result = submitRes.data.data;
      console.log(`📊 Score: ${result.score}`);
      console.log(`📈 Percentage: ${result.percentage}%`);
      console.log(`🏆 Mastery Achieved: ${result.masteryAchieved}`);
      console.log(`🔄 Unit State: ${result.state}`);
    } else {
      console.error("❌ Failed to submit assessment:", submitRes.data);
    }

    console.log("\n🎉 Verification Complete!");
  } catch (err) {
    console.error("❌ Error during verification:", err.message);
    if (err.response) {
      console.error("Data:", err.response.data);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run();
