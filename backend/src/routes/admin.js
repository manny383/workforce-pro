import express from 'express';
import {
  createLocation,
  createUser,
  getLocations,
  getUsers,
  updateLocationStatus,
  updateUserStatus,
} from '../controllers/adminController.js';
import { requireRoles, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireRoles(['admin', 'supervisor']));
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id/status', updateUserStatus);
router.get('/locations', getLocations);
router.post('/locations', createLocation);
router.patch('/locations/:id/status', updateLocationStatus);

export default router;
