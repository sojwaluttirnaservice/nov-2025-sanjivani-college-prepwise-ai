const usersModel = require("../../models/users.model");
const quizAttemptsModel = require("../../models/quizAttempts.model");
const { sendSuccess } = require("../../utils/responses/ApiResponse");
const STATUS = require("../../utils/status");
const asyncHandler = require("../../utils/asyncHandler");
const APP_ROLES = require("../../utils/checks/roles");
const mongoose = require("mongoose");
const Branch = require("../../schemas/Branch");
const Subject = require("../../schemas/Subject");
const Unit = require("../../schemas/Unit");
const Topic = require("../../schemas/Topic");

const adminController = {
  /**
   * Get Dashboard Statistics
   * @route GET /api/v1/admin/stats
   */
  getDashboardStats: asyncHandler(async (req, res) => {
    // 1. Total Students
    const totalStudents = await usersModel.Model.countDocuments({
      role: APP_ROLES.STUDENT,
    });

    // 2. Total Attempts
    const totalAttempts = await quizAttemptsModel.Model.countDocuments();

    // 3. Average Study Time (Mock for now, or aggregate if data exists)
    // Assuming each attempt has 'timeSpent' in seconds
    const avgTimeAgg = await quizAttemptsModel.Model.aggregate([
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$timeSpent" },
        },
      },
    ]);
    const avgStudyTimeSeconds =
      avgTimeAgg.length > 0 ? Math.round(avgTimeAgg[0].avgTime) : 0;
    // Convert to hours or minutes string for UI
    const avgStudyTime = `${(avgStudyTimeSeconds / 60).toFixed(1)}m`; // Display in minutes for now

    // 4. Active Issues (Mock)
    const activeIssues = 0; // Placeholder

    // 5. Recent Activity
    // Fetch recent 5 attempts
    const recentAttempts = await quizAttemptsModel.Model.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name")
      .populate({
        path: "quizId",
        populate: { path: "unitId", select: "name" },
      });

    const recentActivity = recentAttempts.map((attempt) => ({
      name: attempt.userId?.name || "Unknown User",
      action: `Attempted ${attempt.quizId?.unitId?.name || "Quiz"}`,
      time: attempt.createdAt,
    }));

    // 6. Popular Subjects
    // Aggregate attempts by subject (via Quiz -> Unit -> Subject is hard, maybe just by Unit?)
    // Let's aggregate by Unit for now as "Subject/Unit"
    const popularUnitsAgg = await quizAttemptsModel.Model.aggregate([
      {
        $lookup: {
          from: "quizzes",
          localField: "quizId",
          foreignField: "_id",
          as: "quiz",
        },
      },
      { $unwind: "$quiz" },
      {
        $lookup: {
          from: "units",
          localField: "quiz.unitId",
          foreignField: "_id",
          as: "unit",
        },
      },
      { $unwind: "$unit" },
      {
        $group: {
          _id: "$unit.name",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]);

    const popularSubjects = popularUnitsAgg.map((item, index) => {
      // Assign colors based on index for UI
      const colors = [
        "bg-indigo-600",
        "bg-emerald-600",
        "bg-blue-600",
        "bg-amber-600",
      ];
      return {
        name: item._id,
        count: item.count,
        color: colors[index % colors.length],
      };
    });

    return sendSuccess(res, STATUS.OK, "Dashboard stats retrieved", {
      stats: [
        {
          title: "Total Students",
          value: totalStudents.toLocaleString(),
          icon: "Users",
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          title: "Tests Attempted",
          value: totalAttempts.toLocaleString(),
          icon: "ClipboardCheck",
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          title: "Avg Test Time",
          value: avgStudyTime,
          icon: "TrendingUp",
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          title: "Active Issues",
          value: activeIssues.toString(),
          icon: "AlertCircle",
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
      ],
      recentActivity,
      popularSubjects,
      activityTrend: await getClassActivityTrend(),
    });
  }),

  /**
   * Get Student Analytics (Stats, Trends, Topics)
   * GET /api/v1/admin/students/:studentId/analytics
   */
  getStudentAnalytics: asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // Reuse specific utility logic or duplicate for now for speed
    // 1. Stats
    const activityData = await quizAttemptsModel.Model.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(studentId),
          status: "SUBMITTED",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          count: { $sum: 1 },
          avgScore: { $avg: "$score" },
          totalTime: { $sum: "$timeSpent" },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const totalSeconds = activityData.reduce(
      (acc, cur) => acc + cur.totalTime,
      0,
    );
    const totalHours = (totalSeconds / 3600).toFixed(1);
    const totalAvgScore =
      activityData.length > 0
        ? (
            activityData.reduce((acc, cur) => acc + cur.avgScore, 0) /
            activityData.length
          ).toFixed(1)
        : 0;
    const totalAssessments = activityData.reduce(
      (acc, cur) => acc + cur.count,
      0,
    );

    // 2. Performance Trends (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await quizAttemptsModel.Model.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(studentId),
          status: "SUBMITTED",
          completedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "quizId",
          foreignField: "_id",
          as: "quiz",
        },
      },
      { $unwind: "$quiz" },
      {
        $lookup: {
          from: "units",
          localField: "quiz.unitId",
          foreignField: "_id",
          as: "unit",
        },
      },
      { $unwind: "$unit" },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          score: 1,
          unitName: "$unit.name",
        },
      },
      { $sort: { date: 1 } },
    ]);

    // 3. Topic Mastery
    const topics = await quizAttemptsModel.Model.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(studentId),
          status: "SUBMITTED",
        },
      },
      { $unwind: "$answers" },
      {
        $lookup: {
          from: "questions",
          localField: "answers.questionId",
          foreignField: "_id",
          as: "questionDetails",
        },
      },
      { $unwind: "$questionDetails" },
      {
        $lookup: {
          from: "topics",
          localField: "questionDetails.topicId",
          foreignField: "_id",
          as: "topicDetails",
        },
      },
      { $unwind: "$topicDetails" },
      {
        $group: {
          _id: "$topicDetails.name",
          totalQuestions: { $sum: 1 },
          correctAnswers: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } },
        },
      },
      {
        $project: {
          topic: "$_id",
          mastery: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$correctAnswers", "$totalQuestions"] },
                  100,
                ],
              },
              0,
            ],
          },
          totalQuestions: 1,
        },
      },
      { $sort: { mastery: 1 } },
      { $limit: 10 },
    ]);

    return sendSuccess(res, STATUS.OK, "Student analytics fetched", {
      stats: {
        totalHoursStudy: totalHours,
        averageScore: totalAvgScore,
        totalAssessments,
        activityHeatmap: activityData.reduce((acc, val) => {
          acc[val._id] = val.count;
          return acc;
        }, {}),
      },
      trends, // Provide raw trends array
      topics, // Provide raw topics array
    });
  }),

  // ACADEMIC MANAGEMENT

  // --- BRANCHES ---

  /**
   * Create a new branch
   * @route POST /api/v1/admin/resources/branches
   */
  createBranch: asyncHandler(async (req, res) => {
    const { name, code } = req.body;

    if (!name || !code) {
      throw new AppError("Name and code are required", STATUS.BAD_REQUEST);
    }

    const existingBranch = await Branch.findOne({ $or: [{ name }, { code }] });
    if (existingBranch) {
      throw new AppError(
        "Branch with this name or code already exists",
        STATUS.CONFLICT,
      );
    }

    const branch = await Branch.create({ name, code });

    return sendSuccess(res, STATUS.CREATED, "Branch created successfully", {
      branch,
    });
  }),

  /**
   * Update a branch
   * @route PUT /api/v1/admin/resources/branches/:id
   */
  updateBranch: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, code } = req.body;

    const branch = await Branch.findByIdAndUpdate(
      id,
      { name, code },
      { new: true, runValidators: true },
    );

    if (!branch) {
      throw new AppError("Branch not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "Branch updated successfully", {
      branch,
    });
  }),

  /**
   * Delete a branch
   * @route DELETE /api/v1/admin/resources/branches/:id
   */
  deleteBranch: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const branch = await Branch.findByIdAndDelete(id);

    if (!branch) {
      throw new AppError("Branch not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "Branch deleted successfully");
  }),

  // --- SUBJECTS ---

  /**
   * Create a new subject
   * @route POST /api/v1/admin/resources/subjects
   */
  createSubject: asyncHandler(async (req, res) => {
    const { name, code, semester, branches, credits } = req.body;

    if (!name || !code || !semester || !branches || branches.length === 0) {
      throw new AppError(
        "Name, code, semester, and at least one branch are required",
        STATUS.BAD_REQUEST,
      );
    }

    const subject = await Subject.create({
      name,
      code,
      semester,
      branches,
      credits: credits || 0,
    });

    return sendSuccess(res, STATUS.CREATED, "Subject created successfully", {
      subject,
    });
  }),

  /**
   * Update a subject
   * @route PUT /api/v1/admin/resources/subjects/:id
   */
  updateSubject: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const subject = await Subject.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      throw new AppError("Subject not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "Subject updated successfully", {
      subject,
    });
  }),

  /**
   * Delete a subject
   * @route DELETE /api/v1/admin/resources/subjects/:id
   */
  deleteSubject: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) {
      throw new AppError("Subject not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "Subject deleted successfully");
  }),

  /**
   * Get single subject
   * @route GET /api/v1/admin/resources/subjects/:id
   */
  getSubject: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const subject = await Subject.findById(id);

    if (!subject) {
      throw new AppError("Subject not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "Subject retrieved", { subject });
  }),

  // --- UNITS ---

  /**
   * Get units for a subject (Admin Context)
   * @route GET /api/v1/admin/resources/subjects/:subjectId/units
   */
  getUnits: asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const units = await Unit.find({ subjectId })
      .populate("topics")
      .sort({ unitNumber: 1 });
    return sendSuccess(res, STATUS.OK, "Units retrieved", { units });
  }),

  /**
   * Create a new unit
   * @route POST /api/v1/admin/resources/subjects/:subjectId/units
   */
  createUnit: asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const { name, unitNumber, description } = req.body;

    if (!subjectId || !name || !unitNumber) {
      throw new AppError(
        "Subject ID, Name and Unit Number are required",
        STATUS.BAD_REQUEST,
      );
    }

    // Check for duplicate unit number in this subject
    const existing = await Unit.findOne({ subjectId, unitNumber });
    if (existing) {
      throw new AppError(
        `Unit ${unitNumber} already exists in this subject`,
        STATUS.CONFLICT,
      );
    }

    const unit = await Unit.create({
      subjectId,
      name,
      unitNumber,
      description,
    });

    return sendSuccess(res, STATUS.CREATED, "Unit created successfully", {
      unit,
    });
  }),

  /**
   * Update a unit
   * @route PUT /api/v1/admin/resources/units/:unitId
   */
  updateUnit: asyncHandler(async (req, res) => {
    const { unitId } = req.params;
    const { name, description } = req.body;

    const unit = await Unit.findByIdAndUpdate(
      unitId,
      { name, description },
      { new: true, runValidators: true },
    );

    if (!unit) {
      throw new AppError("Unit not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "Unit updated successfully", { unit });
  }),

  /**
   * Delete a unit
   * @route DELETE /api/v1/admin/resources/units/:unitId
   */
  deleteUnit: asyncHandler(async (req, res) => {
    const { unitId } = req.params;
    const unit = await Unit.findByIdAndDelete(unitId);

    if (!unit) {
      throw new AppError("Unit not found", STATUS.NOT_FOUND);
    }

    // Cascade delete topics
    await Topic.deleteMany({ unitId });

    return sendSuccess(res, STATUS.OK, "Unit deleted successfully");
  }),

  // --- TOPICS ---

  /**
   * Get topics for a unit
   * @route GET /api/v1/admin/resources/units/:unitId/topics
   */
  getTopics: asyncHandler(async (req, res) => {
    const { unitId } = req.params;
    // We can fetch from Topic collection directly or populate from Unit
    // Let's fetch from Topic collection for loose coupling if possible,
    // BUT Topic schema references Unit, so finding by unitId is correct.
    const topics = await mongoose.models.Topic.find({ unitId }).sort({
      createdAt: 1,
    });
    return sendSuccess(res, STATUS.OK, "Topics retrieved", { topics });
  }),

  /**
   * Create a new topic
   * @route POST /api/v1/admin/resources/units/:unitId/topics
   */
  createTopic: asyncHandler(async (req, res) => {
    const { unitId } = req.params;
    const { name, description } = req.body;

    if (!unitId || !name) {
      throw new AppError(
        "Unit ID and Topic Name are required",
        STATUS.BAD_REQUEST,
      );
    }

    const topic = await mongoose.models.Topic.create({
      unitId,
      name,
      description,
    });

    // Also push to Unit's topics array for reference/population
    await Unit.findByIdAndUpdate(unitId, { $push: { topics: topic._id } });

    return sendSuccess(res, STATUS.CREATED, "Topic created successfully", {
      topic,
    });
  }),

  /**
   * Update a topic
   * @route PUT /api/v1/admin/resources/topics/:topicId
   */
  updateTopic: asyncHandler(async (req, res) => {
    const { topicId } = req.params;
    const { name, description } = req.body;

    const topic = await mongoose.models.Topic.findByIdAndUpdate(
      topicId,
      { name, description },
      { new: true, runValidators: true },
    );

    if (!topic) {
      throw new AppError("Topic not found", STATUS.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, "Topic updated successfully", { topic });
  }),

  /**
   * Delete a topic
   * @route DELETE /api/v1/admin/resources/topics/:topicId
   */
  deleteTopic: asyncHandler(async (req, res) => {
    const { topicId } = req.params;
    const topic = await mongoose.models.Topic.findByIdAndDelete(topicId);

    if (!topic) {
      throw new AppError("Topic not found", STATUS.NOT_FOUND);
    }

    // Pull from Unit's topics array
    await Unit.findByIdAndUpdate(topic.unitId, {
      $pull: { topics: topic._id },
    });

    return sendSuccess(res, STATUS.OK, "Topic deleted successfully");
  }),
};

/**
 * Helper to get daily activity trend for the last 30 days
 */
async function getClassActivityTrend() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trend = await quizAttemptsModel.Model.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Format for Recharts (array of object { date, count })
  // We can also fill in missing days if needed, but for now let's just return the data we have
  return trend.map((item) => ({
    date: item._id,
    count: item.count,
  }));
}

module.exports = adminController;
