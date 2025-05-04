import 'dotenv/config.js';
import path from 'path';
import { fileURLToPath } from 'url';


import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport'
import { ExpressValidator } from 'express-validator';

import connectDB from './config/db.js';
import logger from './utils/logger.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import setupPassport from './auth/passportConfig.js';


import authRoutes from './routes/authRoutes.js';
// import favoriteRoutes from './routes/favoritesRoutes.js';
// import viewedRoutes from './routes/viewedRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import animeRoutes from './routes/animeRoutes.js';

const app = express();


app.use(morgan('combined', {stream: {write: (message) => logger.info(message.trim())}}));
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}))

app.use(passport.initialize());
app.use(passport.session())

setupPassport(passport);


app.get('/api/v1', (req, res) => {
  res.send('Nekoji server is running');
})


app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/favorites', favoriteRoutes);
// app.use('/api/v1/user', userRoutes);
// app.use('/api/v1/viewed', viewedRoutes);
// app.use('/api/v1/anime', animeRoutes);

app.use(errorMiddleware)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
})