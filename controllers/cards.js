const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then(data => res.send(data))
    .catch(() => {
      return res.status(500).send({ message: 'Неизвестная ошибка'});
    });
};

module.exports.postCard = (req, res) => {
  console.log(req.user._id);
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then(data => res.send(data))
    .catch((err) => {
      const badRequest = err.name;
      if(err.name === badRequest) {
        return res.status(400).send({ message: 'Переданы некорректные данные'});
      }
      return res.status(500).send({ message: 'Неизвестная ошибка'});
    });
};

module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then(data => res.send(data))
    .catch((err) => {
      const notFound = err.name;
      if(err.name === notFound) {
        return res.status(404).send({ message: 'Запрашиваемая карточка не найдена'});
      }
      return res.status(500).send({ message: 'Неизвестная ошибка'});
    });
};

module.exports.likeCard = (req, res) => {
  console.log(res)
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then(data => res.send(data))
    .catch((err) => {
      const notFound = err.name;
      if(err.name === notFound) {
        return res.status(404).send({ message: 'Запрашиваемая карточка не найдена'});
      }
      return res.status(500).send({ message: 'Неизвестная ошибка'});
    });
};

module.exports.dislikeCard = (res, req) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .then(data => res.send(data))
  .catch((err) => {
    const notFound = err.name;
    if(err.name === notFound) {
      return res.status(404).send({ message: 'Запрашиваемая карточка не найдена'});
    }
    return res.status(500).send({ message: 'Неизвестная ошибка'});
  });
};