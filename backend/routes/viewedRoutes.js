import express from 'express';
import{getViewedAnime, addOrUpdateViewedAnime, removeViewedAnimem, UpdateViewedProgress} from '../controllers/viewedController.js'
import { protect } from '../middleware/authMiddleware.js'; 
import { check } from 'express-validator'; 

const router = express.Router();

router.use(protect) //protect all routes in this file
router.get('/', getViewedAnime);

router.post('/', [
  check('animeId' , 'animeId is required ').notEmpty(),
  check('title' , 'title is required').notEmpty(),
  check('poster' , 'poster is required ').optional().isURL(),
], addOrUpdateViewedAnime )

router.delete('/:animeId', removeViewedAnime);

router.put('/progress/:animeId', [
  check('episodesWatched', 'episodesWatched is an array of numbers').optional().isArray().custom(arr => arr.every(num => typeof num === 'number')),
  check('lastEpisodeWatched' , 'lastEpisodeWatched is a number').optional().isNumeric()
],
UpdateViewedProgress
);

export default router;