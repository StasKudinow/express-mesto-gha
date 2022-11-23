const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const {
  ERROR_SERVER,
  ERROR_VALIDATION,
  ERROR_NOT_FOUND,
  ERROR_AUTH,
  ERROR_CONFLICT,
  SALT_ROUND,
} = require('../utils/constants');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((data) => res.send(data))
    .catch(() => res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' }));
};

module.exports.getCurrentUser = (req, res) => {
  const { email } = req.body;
  User.findOne({ email })
    .then((data) => res.send(data))
    .catch(() => res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' }));
};

module.exports.getUserById = (req, res) => {
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
      return res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.postUser = (req, res) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email)) {
    return res.status(ERROR_VALIDATION).send({ message: 'Переданан некорректный email' });
  }
  return bcrypt.hash(password, SALT_ROUND)
    .then((hash) => User.create({
      email,
      password: hash,
    }))
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error());
      }
      return res.send(user);
    })
    .catch(() => {
      res.status(ERROR_CONFLICT).send({ message: 'Пользователь с переданным email уже существует' });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
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

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(() => {
      res.status(ERROR_AUTH).send({ message: 'Неправильные почта или пароль' });
    });
};
