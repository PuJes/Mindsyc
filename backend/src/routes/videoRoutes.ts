import { Router } from 'express';
import { extractVideoInfo } from '../controllers/VideoController';

const router = Router();

router.post('/extract', extractVideoInfo);

export default router;
