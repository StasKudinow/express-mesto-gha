const Card = require('../models/card');

const {
  STATUS_CREATED,
  STATUS_OK,
} = require('../utils/constants');

const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

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
  Card.findById(req.params.cardId)
    .populate('owner')
    .then((data) => {
      if (!data) {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      }
      if (data.owner._id.toString() !== req.user._id) {
        throw new ForbiddenError('Нет доступа');
      }
      return res.status(STATUS_OK).send(data);
    })
    .then(() => Card.findByIdAndRemove(req.params.cardId))
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      }
      return res.status(STATUS_OK).send(data);
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      }
      return res.status(STATUS_OK).send(data);
    })
    .catch(next);
};
