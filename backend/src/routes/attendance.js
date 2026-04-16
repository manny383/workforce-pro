import express from 'express';
import { clockIn, clockOut, getAttendance } from '../controllers/attendanceController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/clock-in', verifyToken, clockIn);
router.post('/clock-out', verifyToken, clockOut);
router.get('/:user_id', verifyToken, getAttendance);

export default router;