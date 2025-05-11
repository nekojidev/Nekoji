
import logger from '../utils/logger.js';

const googleAuthCallback = (req, res) => {
 const user = req.user;

 if(user){
  logger.info(`Google user authenticated: ${user.username}`)

  const token = user.generateToken(user._id)
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);

 } else {
  logger.error('Google authentication failed, user not found in req.user');
  res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
 }
}


const telegramAuthCallback = (req, res) => {
  logger.info(`Telegram user authenticated: ${user.telegramId}`);
 
  if(user){
    const token = user.generateToken(user._id)
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
  } else{
    logger.error('Telegram authentication failed, user not found in req.user');
    res.redirect(`${process.env.FRONTEND_URL}/login?error=telegram_auth_failed`);
  }
}

const authFailure = (req, res) => {
  logger.warn('Authentication failed');
  res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
};

export {
  googleAuthCallback,
  telegramAuthCallback,
  authFailure
}