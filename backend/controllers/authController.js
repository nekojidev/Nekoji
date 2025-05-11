import User from '../models/User.model.js'
import asyncHandler from 'express-async-handler'
import logger from '../utils/logger.js'
import { validationResult } from 'express-validator'




const registerUser = asyncHandler(async (req, res) => {
  // Add validation result check
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const {username, email, password} = req.body
  
  // if(!username || !email || !password){
  //   res.status(400)
  //   throw new Error('Please provide all fields')
  // }

  const userExist = await User.findOne({$or: [{username}, {email}]})
  if(userExist){
    res.status(400)
    throw new Error('User already exists')
  }

  const userCount = await User.countDocuments()
  const isAdmin = userCount === 0 ? true : false
  const avatar = `https://api.dicebear.com/5.x/initials/svg?seed=${username}`

  const user = await User.create({
    username,
    email,
    password,
    avatar,
    isAdmin,
  })

  const token = user.generateToken(user._id)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  })  


  if(user){
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email, 
     token,
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

const loginUser = asyncHandler(async (req, res) => {
  // Add validation result check
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const {email, password} = req.body;

  if(!email || !password){
    res.status(400)
    throw new Error('Please provide email and password')
  }


  const user = await User.findOne({email})

  if(user && (await user.matchPassword(password) )){
    logger.info(`User logged in: ${user.username}`)

    const token = user.generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    })

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
      avatar: user.avatar,
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})


const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  if(user){
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      googleId: user.googleId,
      telegramId: user.telegramId,
      avatar: user.avatar,
      isAdmin: user.isAdmin
    })
  } else{
    res.status(404).json({
      message: 'User not found'
    })
    throw new Error('User not found')
  }

})

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('token')
  res.status(200).json({
    message: 'Logged out successfully'
  })
})


export {registerUser, loginUser, getUserProfile, logoutUser}

