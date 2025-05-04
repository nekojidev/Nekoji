import GoogleStrategy from './googleStrategy.js';
import TelegramStrategy from './telegramStrategy.js';
import User from '../models/User.model.js'

const setupPassport = (passport) => {
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser(async (user, done) => {
  try {
    const userData = await User.findById(user._id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

passport.use(GoogleStrategy);
passport.use(TelegramStrategy);

// may be add other strategies here

}

export default setupPassport