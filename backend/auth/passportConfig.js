import GoogleStrategy from './googleStrategy.js';
// import TelegramStrategy from './telegramStrategy.js';
import User from '../models/User.model.js'

const setupPassport = (passport) => {

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(GoogleStrategy);
// passport.use(TelegramStrategy);

// may be add other strategies here

}

export default setupPassport