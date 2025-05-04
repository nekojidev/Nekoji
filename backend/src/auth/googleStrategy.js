import {Strategy as GoogleOAuth20Strategy} from 'passport-google-oauth20';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';

const googleStrategy = new GoogleOAuth20Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({googleId: profile.id})

      if(user){
        logger.info(`User found with Google ID: ${profile.id} `)
        done(null, user)
      } else {
        logger.info('Creating new user with Google Id: ${profile.id')
        const newUser = await User.create({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
        })
        done(null, newUser)
      } 
    } catch (err) {
      logger.error(`Error during Google authentication: ${err.message}`);
      done(err, null)
    }
  }
)

export default googleStrategy