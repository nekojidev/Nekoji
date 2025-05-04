import {createClien} from 'redis'
import logger from '../utils/logger'
import { log } from 'winston';


const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on('error', (err) => {
  logger.error(`Redis Client Error: ${err}`);
})

const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis client connected');
  }catch (err){
    logger.error(`Error connecting to Redis: ${err.message}`);
  }
}

connectRedis()

// key: ключ кеша (строка)
// value: данные для сохранения (любой тип, будет преобразован в JSON)
// ttl: время жизни кеша в секундах (опционально)

const set = async (key, value, ttl) => {
  try {
    const jsonValue = JSON.stringify(value)
    if(ttl){
      await redisClient.set(key, jsonValue, { EX: ttl }); // EX устанавливает время жизни в секундах
    } else {
    await redisClient.set(key, jsonValue);
    }
    logger.debug(`Cache set: ${key}`);

  } catch (err) {
    logger.error(`Error setting cache for key ${key} : ${err.message}`)
  }
}

const get = async (key) => {
  try {
   const jsonValue = await redisClient.get(key)
    if(jsonValue){
      logger.debug(`Cache GET: ${key}`);
      return JSON.parse(jsonValue)
    } 
    logger.debug(`Cache miss: ${key}`);
    return null
  } catch (err) {
    logger.error(`Error getting cache for key ${key} : ${err.message}`)
    return null
  }
}

 const del = async (key) => {
  try {
    await redisClient.del(key)
    logger.debug(`Cache deleted: ${key}`);
  } catch (err) {
    logger.error(`Error deleting cache for key ${key} : ${err.message}`)
  }
 }

 export {
  set,
  get,
  del,
  connectRedis
 }

