const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const errorCodes = require('../errors/errorCodes');
const ValidationError = require('../errors/ValidationError');
const DuplicateError = require('../errors/DuplicateError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const { DEFAULT_SECRET_KEY } = require('../utils/config');

const {
  NODE_ENV = 'develop',
  JWT_SECRET,
} = process.env;

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((user) => res.send(user.deletePasswordFromUser()))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя'));
      } else if (err.code === errorCodes.DuplicateErrorCode) {
        next(new DuplicateError('Пользователь с указанным email уже существует'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
          }
          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : DEFAULT_SECRET_KEY,
            { expiresIn: '7d' },
          );

          res.send({ token });
        });
    })
    .catch(next);
};

const updateUserProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => res.send(user.deletePasswordFromUser()))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Введены некорректные данные при обновлении пользователя'));
      } else if (err.code === errorCodes.DuplicateErrorCode) {
        next(new DuplicateError('Пользователь с указанным email уже существует'));
      } else {
        next(err);
      }
    });
};

const getUserProfile = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};

module.exports = {
  createUser,
  updateUserProfile,
  login,
  getUserProfile,
};
