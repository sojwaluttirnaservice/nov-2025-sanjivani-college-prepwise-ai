const getRouter = require("../../../utils/getRouter");
const resourcesController = require("../../../controllers/v1/resourcesController");

const resourcesRouter = getRouter();

resourcesRouter.get("/branches", resourcesController.getBranches);
resourcesRouter.get("/subjects", resourcesController.getSubjects);
resourcesRouter.get("/subjects/:subjectId/units", resourcesController.getUnits);

module.exports = resourcesRouter;
