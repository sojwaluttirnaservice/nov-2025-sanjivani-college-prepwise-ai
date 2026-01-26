require("dotenv").config();
const LLMFactory = require("../services/llm/LLMFactory");

async function testLLM() {
  try {
    console.log("--------------------------------------------------");
    console.log("🧪 Testing LLM Provider Factory");
    console.log("--------------------------------------------------");

    const provider = LLMFactory.getProvider();
    console.log(`✅ Provider Instantiated: ${provider.constructor.name}`);

    const mockInput = {
      unit: { id: "unit_123", name: "Introduction to C Programming" },
      topics: [
        { id: "topic_1", name: "Variables and Data Types", weight: 3 },
        { id: "topic_2", name: "Control Structures", weight: 2 },
      ],
      quizType: "DIAGNOSTIC",
      totalQuestions: 2, // Keep it small for test speed
      difficultyDistribution: { EASY: 1, MEDIUM: 1, HARD: 0 },
    };

    console.log("\n📤 Sending Request to LLM...");
    console.time("LLM Generation Time");

    // Uncomment to actually hit the API (costs money/credits)
    // const questions = await provider.generateQuestions(mockInput);

    console.timeEnd("LLM Generation Time");
    // console.log("\n📥 Received Questions:");
    // console.log(JSON.stringify(questions, null, 2));

    console.log(
      "\n[NOTE] Actual API call commented out to save credits. Factory logic verified.",
    );
  } catch (error) {
    console.error("\n❌ Test Failed:", error.message);
  }
}

testLLM();
