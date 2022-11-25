const Card = require('../models/card');

const {
  STATUS_CREATED,
  STATUS_OK,
  ERROR_NOT_FOUND,
} = require('../utils/constants');

const NotFoundError = require('../errors/NotFoundError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((data) => res.status(STATUS_OK).send(data))
    .catch(next);
};

module.exports.postCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((data) => res.status(STATUS_CREATED).send(data))
    .catch(next);
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => {
      throw new NotFoundError('Запрашиваемая карточка не найдена');
    })
    .then((data) => res.status(STATUS_OK).send(data))
    .catch((err) => {
      if (err.statusCode === ERROR_NOT_FOUND) {
        return res.status(ERROR_NOT_FOUND).send({ message: err.message });
      }
      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Запрашиваемая карточка не найдена');
    })
    .then((data) => res.status(STATUS_OK).send(data))
    .catch((err) => {
      if (err.statusCode === ERROR_NOT_FOUND) {
        return res.status(ERROR_NOT_FOUND).send({ message: err.message });
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Запрашиваемая карточка не найдена');
    })
    .then((data) => res.status(STATUS_OK).send(data))
    .catch((err) => {
      if (err.statusCode === ERROR_NOT_FOUND) {
        return res.status(ERROR_NOT_FOUND).send({ message: err.message });
      }
      return next(err);
    });
};
