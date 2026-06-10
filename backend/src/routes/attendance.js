import express from 'express';
import { clockIn, clockOut, getAttendance, getAttendanceStatus, getEmployeeDashboard, getMyAttendance, getTodayAssignments } from '../controllers/attendanceController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/clock-in', verifyToken, clockIn);
router.post('/clock-out', verifyToken, clockOut);
router.get('/me', verifyToken, getMyAttendance);
router.get('/status', verifyToken, getAttendanceStatus);
router.get('/dashboard', verifyToken, getEmployeeDashboard);
router.get('/today-assignments', verifyToken, getTodayAssignments);
router.get('/:user_id', verifyToken, getAttendance);

export default router;
