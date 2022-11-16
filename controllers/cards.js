const Card = require('../models/card');
const { ERROR_SERVER, ERROR_VALIDATION, ERROR_NOT_FOUND } = require('../utils/constants');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((data) => res.send(data))
    .catch(() => res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' }));
};

module.exports.postCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_VALIDATION).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => {
      const error = new Error();
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_VALIDATION).send({ message: 'Передан некорректный id карточки' });
      }
      if (err.statusCode === ERROR_NOT_FOUND) {
        return res.status(ERROR_NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
      }
      return res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error();
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_VALIDATION).send({ message: 'Передан некорректный id карточки' });
      } if (err.statusCode === ERROR_NOT_FOUND) {
        return res.status(ERROR_NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
      }
      return res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error();
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    })
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_VALIDATION).send({ message: 'Передан некорректный id карточки' });
      } if (err.statusCode === ERROR_NOT_FOUND) {
        return res.status(ERROR_NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
      }
      return res.status(ERROR_SERVER).send({ message: 'Неизвестная ошибка' });
    });
};
