import express from 'express';
import {
  createLocation,
  createShift,
  createUserAssignment,
  createUser,
  getLocations,
  getManagerDashboard,
  getShifts,
  getTodayOverview,
  getUserAssignments,
  getUsers,
  updateAssignmentStatus,
  updateLocationStatus,
  updateShift,
  updateUser,
  updateUserStatus,
} from '../controllers/adminController.js';
import { requireRoles, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireRoles(['admin', 'supervisor']));
router.get('/dashboard', getManagerDashboard);
router.get('/today', getTodayOverview);
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/status', updateUserStatus);
router.get('/locations', getLocations);
router.post('/locations', createLocation);
router.patch('/locations/:id/status', updateLocationStatus);
router.get('/shifts', getShifts);
router.post('/shifts', createShift);
router.patch('/shifts/:id', updateShift);
router.get('/users/:id/assignments', getUserAssignments);
router.post('/users/:id/assignments', createUserAssignment);
router.patch('/assignments/:id/status', updateAssignmentStatus);

export default router;
