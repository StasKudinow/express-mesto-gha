const User = require('../models/user');
const { ERROR_SERVER, ERROR_VALIDATION, ERROR_NOT_FOUND } = require('../utils/constants');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((data) => res.send(data))
    .catch(() => res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === 'NotFoundError' || req.params.userId !== req.user._id) {
        return res.status(ERROR_NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.postUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_VALIDATION).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' });
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
      if (err.name === 'ValidationError' || req.user._id.length !== 24) {
        return res.status(ERROR_VALIDATION).send({ message: 'Переданы некорректные данные' });
      } if (err.name === 'NotFoundError' || req.params.userId !== req.user._id) {
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
      if (err.name === 'ValidationError' || req.user._id.length !== 24) {
        return res.status(ERROR_VALIDATION).send({ message: 'Переданы некорректные данные' });
      } if (err.name === 'NotFoundError' || req.params.userId !== req.user._id) {
        return res.status(ERROR_NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' });
    });
};
