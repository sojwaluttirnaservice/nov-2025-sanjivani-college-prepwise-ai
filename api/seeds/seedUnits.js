// seeds/seedUnits.js
const mongoose = require("mongoose");
const Subject = require("../schemas/Subject");
const Unit = require("../schemas/Unit");
const config = require("../config/config");

async function seedUnits() {
  await mongoose.connect(config.db.uri);

  const cSubject = await Subject.findOne({ name: "Programming in C" });

  await Unit.deleteMany({ subjectId: cSubject._id });

  const units = await Unit.insertMany([
    {
      subjectId: cSubject._id,
      name: "Introduction to C",
      unitNumber: 1,
    },
    {
      subjectId: cSubject._id,
      name: "Control Structures",
      unitNumber: 2,
    },
  ]);

  console.log("Units seeded:", units);
}

module.exports = seedUnits;
