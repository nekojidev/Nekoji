import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoritesController.js';
import { protect } from '../middleware/authMiddleware.js'; 
import { check } from 'express-validator'; 

const router = express.Router();

router.use(protect) //protect all routes in this file

router.get('/', getFavorites);
router.post('/', [
  check('animeId', 'animeId is required').notEmpty(),
  check('title', 'title is required').notEmpty(),
  check('poster', 'poster is required').optional().isURL(),
], addFavorite);

router.delete('/:animeId', removeFavorite);

export default router;