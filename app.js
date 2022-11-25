const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');

const { ERROR_NOT_FOUND } = require('./utils/constants');
const { login, postUser } = require('./controllers/users');
const { userBodyValidator } = require('./validators/user-validators');

const auth = require('./middlewares/auth');

const app = express();
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  autoIndex: true,
});

app.post('/signin', userBodyValidator, login);
app.post('/signup', userBodyValidator, postUser);

app.use(auth);

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.all('*', (req, res, next) => {
  res.status(ERROR_NOT_FOUND).send({ message: 'Страница не найдена' });
  next();
});

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Сервер запущен на:');
  // eslint-disable-next-line no-console
  console.log('http://localhost:3000');
});
