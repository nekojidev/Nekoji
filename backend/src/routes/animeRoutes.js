import express from 'express';
import {getPopular, search, getDetails} from '../controllers/animeController.js';

const router = express.Router();

router.get('/popular', getPopular);
router.get('/search', search);

router.get('/:id', getDetails);

export default router
