import express from 'express';
import usersAdminRoutes from './users';
import modelsAdminRoutes from './models';
import logsAdminRoutes from './logs';
// Import other admin route modules here as they are created (e.g., settings)

const router = express.Router();

router.use('/users', usersAdminRoutes);
router.use('/models', modelsAdminRoutes);
router.use('/logs', logsAdminRoutes);
// router.use('/settings', settingsAdminRoutes);

export default router; 