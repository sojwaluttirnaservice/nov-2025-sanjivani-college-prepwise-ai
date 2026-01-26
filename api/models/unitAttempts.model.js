const { UnitAttempt, UNIT_STATES } = require("../schemas/UnitAttempt");

const unitAttemptsModel = {
  findOrCreate: async ({ userId, unitId }) => {
    let attempt = await UnitAttempt.findOne({ userId, unitId });
    if (!attempt) {
      attempt = await UnitAttempt.create({
        userId,
        unitId,
        state: UNIT_STATES.NOT_STARTED,
      });
    }
    return attempt;
  },

  updateState: async (id, updates) => {
    return UnitAttempt.findByIdAndUpdate(id, updates, { new: true });
  },

  handleQuizCompletion: async (unitAttemptId, quizType, percentage) => {
    const unitAttempt = await UnitAttempt.findById(unitAttemptId);
    if (!unitAttempt) throw new Error("Unit attempt not found");

    let updates = {};

    if (quizType === "DIAGNOSTIC") {
      updates.diagnosticScore = percentage;
      updates.state = UNIT_STATES.DIAGNOSTIC_COMPLETED;
    } else if (quizType === "ADAPTIVE") {
      updates.adaptiveQuizCount = (unitAttempt.adaptiveQuizCount || 0) + 1;

      if (percentage >= 80) {
        updates.masteryAchieved = true;
        updates.masteredAt = new Date();
        updates.state = UNIT_STATES.MASTERED;
      }
    }

    return await unitAttemptsModel.updateState(unitAttemptId, updates);
  },

  getUnitContext: async (unitId) => {
    // Need to require Unit inside method to avoid circular deps if any,
    // or typically we can require it at top if safe.
    // Assuming Unit schema is registered.
    const Unit = require("mongoose").model("Unit");
    return Unit.findById(unitId).populate("topics");
  },

  Model: UnitAttempt,
};

module.exports = unitAttemptsModel;
