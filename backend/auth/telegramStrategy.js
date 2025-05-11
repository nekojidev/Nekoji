import {Strategy as TelegramStrategy} from 'passport-telegram';
import User from '../models/User.model.js'
import logger from '../utils/logger.js';

// const telegramStrategy = () => {}
// console.log(process.env.TELEGRAM_BOT_TOKEN)

const telegramStrategy = new TelegramStrategy({
  clientID: process.env.TELEGRAM_BOT_USERNAME,
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  passReqToCallback: true,
},
async (req, profile, done) => {
  try {
    let user = await User.findOne({telegramId: profile.id})

    if(user){
      logger.info(`User found with Telegram ID: ${profile.id} `)
      done(null, user)
    }
    else { 
      logger.info(`Creating new user with Telegram Id: ${profile.id}`)
      const newUser = await User.create({
        telegramId: profile.id,
        username: profile.username,
        avatar: profile.photo_url || null
      });
      done(null, newUser)
    }
  } catch (err) {
    logger.error(`Error during Telegram authentication: ${err.message}`);
    done(err, null)
  }
}
)

export default telegramStrategy