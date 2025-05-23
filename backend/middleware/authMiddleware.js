import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import User from '../models/User.model.js'
import asyncHandler from 'express-async-handler';

const protect = asyncHandler(async (req, res , next) => {
  let token

  const authHeader = req.headers.authorization;

  if(authHeader && authHeader.startsWith('Bearer ')){
    try {
      token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password')

      if(!req.user){
        res.status(401)
        throw new Error('Not authorized, user not found')
      }
      next()
    } catch (error) {
      logger.error('Not authorized, token failed')
      res.status(401)
      throw new Error('Not authorized, token failed')
    }
  }

  if(!token){
    res.status(401)
    throw new Error('Not authorized, no token')
  }

})

const protectAdmin = (req, res, next) => {
  if(req.user && req.user.isAdmin){
    next()
  } else {
    res.status(401)
    throw new Error('Not authorized as an admin')
  }
}


export { protect }