const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { userValidation } = require('../validations/user');

const ValidationError = require('../errors/ValidationError');
// const NotFoundError = require('../errors/NotFoundError');
// const ConflictError = require('../errors/ConflictError');

const {
  STATUS_CREATED,
  STATUS_OK,
  ERROR_SERVER,
  ERROR_VALIDATION,
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
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_VALIDATION).send({ message: 'Передан некорректный id пользователя' });
      }
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
  const { error } = userValidation(req.body);
  if (error) {
    throw new ValidationError('Переданы некорректные данные');
  }
  return bcrypt.hash(password, SALT_ROUND)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(STATUS_CREATED).send({
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
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
  const { error } = userValidation(req.body);
  if (error) {
    throw new ValidationError('Переданы некорректные данные');
  }
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

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(() => {
      const error = new Error();
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_VALIDATION).send({ message: 'Переданы некорректные данные' });
      } if (err.statusCode === ERROR_NOT_FOUND) {
        return res.status(ERROR_NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const { error } = userValidation(req.body);
  if (error) {
    throw new ValidationError('Переданы некорректные данные');
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
};
