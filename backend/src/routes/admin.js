import express from 'express';
import { createUser, getUsers, updateUserStatus } from '../controllers/adminController.js';
import { requireRoles, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireRoles(['admin', 'supervisor']));
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id/status', updateUserStatus);

export default router;
