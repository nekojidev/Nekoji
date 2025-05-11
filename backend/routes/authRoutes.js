import express from 'express';
import {registerUser, loginUser, getUserProfile, logoutUser } from '../controllers/authController.js';
import {googleAuthCallback, telegramAuthCallback, authFailure } from '../controllers/socialAuthController.js'
import {protect} from '../middleware/authMiddleware.js';
import passport from 'passport';
import {check} from 'express-validator';

const router = express.Router();

router.post('/register', [
  check('username').notEmpty().withMessage('Username is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
],
registerUser
)

router.post('/login', [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').notEmpty().withMessage('Password is required'),
],
loginUser
)

router.post('/logout', logoutUser)

router.get('/profile', protect, getUserProfile)
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/api/v1/auth/failure' }), googleAuthCallback )

// Initiates Telegram login
router.get('/telegram', passport.authenticate('telegram'));

router.get('/telegram/callback', passport.authenticate('telegram', {failureRedirect: '/api/v1/auth/failure'}), telegramAuthCallback)

router.get('/failure', authFailure)

export default router;