// seeds/seedTopics.js
const mongoose = require("mongoose");
const Unit = require("../schemas/Unit");
const Topic = require("../schemas/Topic");
const config = require("../config/config");

const TOPICS = [
  { unitName: "Introduction to C", name: "History of C" },
  { unitName: "Introduction to C", name: "Structure of C Program" },
  { unitName: "Introduction to C", name: "Keywords and Identifiers" },
  { unitName: "Introduction to C", name: "Variables and Constants" },
  { unitName: "Introduction to C", name: "Data Types" },
  { unitName: "Introduction to C", name: "Input / Output Functions" },
];

async function seedTopics() {
  await mongoose.connect(config.db.uri);

  let seeded = 0;
  for (const topic of TOPICS) {
    const unit = await Unit.findOne({ name: topic.unitName });
    if (!unit) {
      console.warn(
        `⚠️  Unit "${topic.unitName}" not found — skipping topic "${topic.name}"`,
      );
      continue;
    }

    const existing = await Topic.findOne({
      name: topic.name,
      unitId: unit._id,
    });
    if (!existing) {
      const newTopic = await Topic.create({
        name: topic.name,
        unitId: unit._id,
      });

      // Add topic ref to unit if not already there
      if (!unit.topics?.includes(newTopic._id)) {
        await Unit.findByIdAndUpdate(unit._id, {
          $addToSet: { topics: newTopic._id },
        });
      }
      seeded++;
    }
  }

  console.log(
    `✅ Topics: ${seeded} added, ${TOPICS.length - seeded} already existed — skipped.`,
  );
}

module.exports = seedTopics;
