import express from 'express';
import { getGigs, createGig, getGigById } from '../controllers/gigController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getGigs);
router.get('/:id', getGigById);
router.post('/', authMiddleware, createGig);

export default router;
