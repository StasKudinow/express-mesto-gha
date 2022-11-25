const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers,
  getCurrentUser,
  getUserById,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

router.get('/users', getUsers);

router.get('/users/me', getCurrentUser);

router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
}), getUserById);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUser);

router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(/http:\/\/|https:\/\/|(?:www\.)?\w\W(?:#)?/),
  }),
}), updateAvatar);

module.exports = router;
