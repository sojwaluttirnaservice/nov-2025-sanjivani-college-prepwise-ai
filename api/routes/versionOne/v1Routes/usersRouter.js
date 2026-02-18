// Protected routes
const { isAuthenticated } = require("../../../middlewares/auth");
const usersController = require("../../../controllers/v1/usersController");
const getRouter = require("../../../utils/getRouter");

const usersRouter = getRouter();

usersRouter.get("/", isAuthenticated, usersController.getUsers);
usersRouter.get("/:id", isAuthenticated, usersController.getUserById);
usersRouter.post("/", usersController.createUser);

usersRouter.post("/login", usersController.login);

usersRouter.get("/verify", isAuthenticated, usersController.verifyUser);

usersRouter.get("/me", isAuthenticated, usersController.getProfile);

usersRouter.patch("/me", isAuthenticated, usersController.updateProfile);

module.exports = usersRouter;
