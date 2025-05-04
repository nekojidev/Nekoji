import mongoose from "mongoose";


const viewedAnimeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  animeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
  episodesWatched: [{
     type: Number
     }], 
  lastEpisodeWatched: { 
    type: Number 
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

viewedAnimeSchema.index({ userId: 1, animeId: 1 }, { unique: true });

export default mongoose.model('ViewedAnime', viewedAnimeSchema);