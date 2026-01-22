const Branch = require("../../schemas/Branch");
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

    return sendSuccess(
      res,
      STATUS.OK,
      "Branches retrieved successfully",
      branches,
    );
  }),
};

module.exports = resourcesController;
