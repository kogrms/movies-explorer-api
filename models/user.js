const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'неправильный формат email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

function deletePasswordFromUser() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
}

userSchema.methods.deletePasswordFromUser = deletePasswordFromUser;

module.exports = mongoose.model('user', userSchema);
