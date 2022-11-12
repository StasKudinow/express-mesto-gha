const router = require('express').Router();
const { getCards, postCard, deleteCardById} = require('../controllers/cards');

router.get('/cards', getCards);

router.post('/cards', postCard);

router.delete('/cards/:cardId', deleteCardById);

module.exports = router;