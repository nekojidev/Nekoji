import Favorite from '../models/Favorite.model.js'
import asyncHandler from 'express-async-handler'
import logger from '../utils/logger.js'

const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({user: req.user._id})

  res.json(favorites)

} )


const addFavorite = asyncHandler(async (req, res) => {
  const {animeId} = req.body
  
  const existingAnime = await Anime.findOne({animeId})

  if(!existingAnime){
    res.status(404)
    throw new Error('Anime not found')
  }
  
  const existingFavorite = await Favorite.findOne({userId: req.user._id, animeId})
  if(existingFavorite){

    res.status(400)
    throw new Error('Anime already in favorites')
  }

  const favorite = await Favorite.create({
    userId: req.user._id,
    animeId,

  })

  res.status(201).json(favorite)

})
