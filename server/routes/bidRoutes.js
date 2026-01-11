import express from 'express';
import { createBid, getBidsForGig, hireBid } from '../controllers/bidController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createBid);
router.get('/:gigId', authMiddleware, getBidsForGig);
router.patch('/:bidId/hire', authMiddleware, hireBid);

export default router;
