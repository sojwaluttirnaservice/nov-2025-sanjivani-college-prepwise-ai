// Protected routes
const { isAuthenticated } = require("../../../middlewares/auth");
const usersController = require("../../../controllers/v1/usersController");
const getRouter = require("../../../utils/getRouter");

const usersRouter = getRouter();

// 1. Specific Keys/Paths (Priority)
usersRouter.post("/login", usersController.login);
usersRouter.get("/verify", isAuthenticated, usersController.verifyUser);

// 'me' is a specific string, so it must check before ':id'
usersRouter.get("/me", isAuthenticated, usersController.getProfile);
usersRouter.patch("/me", isAuthenticated, usersController.updateProfile);

// 2. Root Paths
usersRouter.get("/", isAuthenticated, usersController.getUsers);
usersRouter.post("/", usersController.createUser);

// 3. Dynamic Paths (Wildcards like :id) - Must be last
usersRouter.get("/:id", isAuthenticated, usersController.getUserById);

module.exports = usersRouter;
