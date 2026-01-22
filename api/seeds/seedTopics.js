// seeds/seedTopics.js
const mongoose = require("mongoose");
const Unit = require("../schemas/Unit");
const Topic = require("../schemas/Topic");
const config = require("../config/config");

async function seedTopics() {
  await mongoose.connect(config.db.uri);

  const unit = await Unit.findOne({ name: "Introduction to C" });

  await Topic.deleteMany({ unitId: unit._id });

  const topics = await Topic.insertMany([
    { unitId: unit._id, name: "History of C" },
    { unitId: unit._id, name: "Structure of C Program" },
    { unitId: unit._id, name: "Keywords and Identifiers" },
    { unitId: unit._id, name: "Variables and Constants" },
    { unitId: unit._id, name: "Data Types" },
    { unitId: unit._id, name: "Input / Output Functions" },
  ]);

  console.log("Topics seeded:", topics);
}

module.exports = seedTopics;
