const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user');

const ValidationError = require('../errors/ValidationError');

const {
  STATUS_CREATED,
  STATUS_OK,
  ERROR_NOT_FOUND,
  ERROR_CONFLICT,
  SALT_ROUND,
} = require('../utils/constants');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((data) => res.status(STATUS_OK).send(data))
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findOne({})
    .then((data) => res.status(STATUS_OK).send(data))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      const error = new Error();
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .then((data) => res.status(STATUS_OK).send(data))
    .catch((err) => {
      if (err.statusCode === ERROR_NOT_FOUND) {
        return res.status(ERROR_NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return next(err);
    });
};

module.exports.postUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!validator.isEmail(email)) {
    throw new ValidationError('Передан некорректный email');
  }
  return bcrypt.hash(password, SALT_ROUND)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(STATUS_CREATED).send(user);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(ERROR_CONFLICT).send({ message: 'Пользователь с переданным email уже существует' });
      }
      return next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((data) => res.status(STATUS_OK).send(data))
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((data) => res.status(STATUS_OK).send(data))
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email)) {
    throw new ValidationError('Передан некорректный email');
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.status(STATUS_OK).send({ token });
    })
    .catch(next);
};
