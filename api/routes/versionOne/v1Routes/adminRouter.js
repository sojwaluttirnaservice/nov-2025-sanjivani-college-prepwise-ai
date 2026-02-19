const getRouter = require("../../../utils/getRouter");
const adminController = require("../../../controllers/v1/adminController");
const { isAuthenticated, isAdmin } = require("../../../middlewares/auth");
const APP_ROLES = require("../../../utils/checks/roles");

const adminRouter = getRouter();

// All routes require authentication and ADMIN role
adminRouter.use(isAuthenticated, isAdmin);

adminRouter.get("/stats", adminController.getDashboardStats);
adminRouter.get(
  "/students/:studentId/analytics",
  adminController.getStudentAnalytics,
);

// Academic Management Routes
// Branches
adminRouter.post("/resources/branches", adminController.createBranch);
adminRouter.put("/resources/branches/:id", adminController.updateBranch);
adminRouter.delete("/resources/branches/:id", adminController.deleteBranch);

// Subjects
adminRouter.post("/resources/subjects", adminController.createSubject);
adminRouter.get("/resources/subjects/:id", adminController.getSubject);
adminRouter.put("/resources/subjects/:id", adminController.updateSubject);
adminRouter.delete("/resources/subjects/:id", adminController.deleteSubject);

// --- UNITS ---
adminRouter.get(
  "/resources/subjects/:subjectId/units",
  adminController.getUnits,
);
adminRouter.post(
  "/resources/subjects/:subjectId/units",
  adminController.createUnit,
);
adminRouter.put("/resources/units/:unitId", adminController.updateUnit);
adminRouter.delete("/resources/units/:unitId", adminController.deleteUnit);

// --- TOPICS ---
adminRouter.get("/resources/units/:unitId/topics", adminController.getTopics);
adminRouter.post(
  "/resources/units/:unitId/topics",
  adminController.createTopic,
);
adminRouter.put("/resources/topics/:topicId", adminController.updateTopic);
adminRouter.delete("/resources/topics/:topicId", adminController.deleteTopic);

module.exports = adminRouter;
