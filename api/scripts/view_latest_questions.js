require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../config/config");
const { Question } = require("../schemas/Question");

async function viewLatestQuestions() {
  try {
    await mongoose.connect(config.db.uri);
    console.log(`Connected to DB: ${config.db.uri}`);

    const questions = await Question.find({ source: "AI" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log(`\nFound ${questions.length} recent AI-generated questions:\n`);

    questions.forEach((q, i) => {
      console.log(`[${i + 1}] [${q.difficulty}] ${q.questionText}`);
      console.log(`    Unit ID: ${q.unitId}`);
      console.log(`    Generated For: ${q.generatedFor}`);
      console.log(`    Options:`);
      q.options.forEach((o) => console.log(`      ${o.key}: ${o.text}`));
      console.log(`    Correct: ${q.correctOption}`);
      console.log("--------------------------------------------------");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

viewLatestQuestions();
