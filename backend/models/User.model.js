import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    },
  googleId : {
    type: String,
    unique: true,
    sparse: true,
  },
  telegramId: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message: 'Invalid email format'
    }
  },
  avatar: {
    type: String,
    default: 'https://example.com/default-avatar.png', 
  },
  isAdmin: {
    type: Boolean,
    default: false,
  }

},{
  timestamps: true,
}
)


userSchema.pre('save', async function (next) {
  if(!this.isModified('password')){
    return next();
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}
userSchema.methods.generateAvatar = function () {
  return `https://api.dicebear.com/5.x/initials/svg?seed=${this.username}`
}





const User = mongoose.model('User', userSchema)
export default User