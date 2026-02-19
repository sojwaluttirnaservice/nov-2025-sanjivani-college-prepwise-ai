const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/prepwise_prod";

async function fixIndexes() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected.");

    const collection = mongoose.connection.collection("analysiscaches");

    console.log("🔍 Listing indexes...");
    const indexes = await collection.indexes();
    console.log(
      "Current Indexes:",
      indexes.map((i) => i.name),
    );

    const indexName = "unitId_1_cacheKey_1";
    const exists = indexes.find((i) => i.name === indexName);

    if (exists) {
      console.log(`⚠️ Found zombie index: ${indexName}. Dropping...`);
      await collection.dropIndex(indexName);
      console.log(`✅ Dropped index: ${indexName}`);
    } else {
      console.log(`info: Index ${indexName} not found. No action needed.`);
    }

    console.log("🎉 Done.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixIndexes();
