const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { ERROR_NOT_FOUND } = require('./utils/constants');

const app = express();
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb');

// временное решение авторизации
app.use((req, res, next) => {
  req.user = {
    _id: '636fb0b5a2179657f4a83fb0',
  };
  next();
});

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.all('*', (req, res, next) => {
  res.status(ERROR_NOT_FOUND).send({ message: 'Страница не найдена' });
  next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Сервер запущен на:');
  // eslint-disable-next-line no-console
  console.log('http://localhost:3000');
});
