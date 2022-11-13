const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then(data => res.send(data))
    .catch(() => {
      return res.status(500).send({ message: 'Неизвестная ошибка'});
    });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then(data => res.send(data))
    .catch((err) => {
      const notFound = err.name;
      if(err.name === notFound) {
        return res.status(404).send({ message: 'Запрашиваемый пользователь не найден'});
      }
      return res.status(500).send({ message: 'Неизвестная ошибка'});
    });
};

module.exports.postUser = (req, res) => {
  const { name, about, avatar} = req.body;
  User.create({ name, about, avatar})
    .then(data => res.send(data))
    .catch((err) => {
      const badRequest = err.name;
      if(err.name === badRequest) {
        return res.status(400).send({ message: 'Переданы некорректные данные'});
      }
      return res.status(500).send({ message: 'Неизвестная ошибка'});
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about })
    .then(data => res.send(data))
    .catch((err) => {
      const badRequest = err.name;
      if(err.name === badRequest) {
        return res.status(400).send({ message: 'Переданы некорректные данные'});
      }
      return res.status(500).send({ message: 'Неизвестная ошибка'});
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar })
  .then(data => res.send(data))
  .catch((err) => {
    const badRequest = err.name;
    if(err.name === badRequest) {
      return res.status(400).send({ message: 'Переданы некорректные данные'});
    }
    return res.status(500).send({ message: 'Неизвестная ошибка'});
  });
};