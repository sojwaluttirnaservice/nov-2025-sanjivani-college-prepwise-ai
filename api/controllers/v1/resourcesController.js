const mongoose = require("mongoose");
const Branch = require("../../schemas/Branch");
const Subject = require("../../schemas/Subject");
const Unit = require("../../schemas/Unit");
const { sendSuccess } = require("../../utils/responses/ApiResponse");
const STATUS = require("../../utils/status");
const asyncHandler = require("../../utils/asyncHandler");

const resourcesController = {
  /**
   * Get all branches
   * @route GET /api/v1/resources/branches
   */
  getBranches: asyncHandler(async (req, res) => {
    const branches = await Branch.find().select("name _id").sort({ name: 1 });

    return sendSuccess(res, STATUS.OK, "Branches retrieved successfully", {
      branches,
    });
  }),

  /**
   * Get all subjects
   * @route GET /api/v1/resources/subjects
   */
  getSubjects: asyncHandler(async (req, res) => {
    // Optionally filter by branchId and semester if provided in query
    const { branchId, semester } = req.query;
    const matchStage = {};

    if (branchId) {
      matchStage.branchId = new mongoose.Types.ObjectId(branchId);
    }

    if (semester) {
      matchStage.semester = parseInt(semester);
    }

    const subjects = await Subject.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "units",
          localField: "_id",
          foreignField: "subjectId",
          as: "unitsData",
        },
      },
      {
        $project: {
          name: 1,
          code: 1,
          semester: 1,
          branchId: 1,
          units: { $size: "$unitsData" },
        },
      },
      { $sort: { semester: 1, name: 1 } },
    ]);

    return sendSuccess(res, STATUS.OK, "Subjects retrieved successfully", {
      subjects,
    });
  }),

  /**
   * Get units for a subject
   * @route GET /api/v1/resources/subjects/:subjectId/units
   */
  getUnits: asyncHandler(async (req, res) => {
    const { subjectId } = req.params;

    if (!subjectId) {
      throw new AppError("Subject ID is required", STATUS.BAD_REQUEST);
    }

    const units = await Unit.find({ subjectId })
      .select("name unitNumber description topics")
      .populate("topics", "name")
      .sort({ unitNumber: 1 });

    return sendSuccess(res, STATUS.OK, "Units retrieved successfully", {
      units,
    });
  }),
};

module.exports = resourcesController;
