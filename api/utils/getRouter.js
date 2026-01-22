/**
 * @module getRouter
 * @description
 * Utility function for initializing and returning a new Express Router instance.
 *
 * This helper provides a clean and consistent way to create routers
 * for modular route handling across the application.
 *
 * Example usage:
 * ```js
 * const getRouter = require('./utils/getRouter');
 * const router = getRouter();
 *
 * router.get('/status', (req, res) => {
 *   res.json({ message: 'Server is running' });
 * });
 *
 * module.exports = router;
 * ```
 */

const { Router } = require('express');

/**
 * Returns a new instance of the Express Router.
 *
 * @function
 * @returns {import('express').Router} A new Express Router instance.
 *
 * @example
 * const router = getRouter();
 * router.post('/login', loginController);
 */
const getRouter = () => {
    return Router();
};

module.exports = getRouter;
