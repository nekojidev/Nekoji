
import express from 'express';
import { triggerRecentSync, triggerFullSync } from '../controllers/syncController.js';
import { protect } from '../middleware/authMiddleware.js'; // Middleware для захисту маршрутів
// import { authorizeAdmin } from '../middleware/authMiddleware'; // Якщо є роль адміністратора

const router = express.Router();


router.use(protect);

router.post('/recent', triggerRecentSync);
router.post('/full', triggerFullSync);


export default router;