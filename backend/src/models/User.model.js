import mongoose from "mongoose";
import validator from "validator";

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
    tupe: String,
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

export default User = mongoose.model('User', userSchema)
