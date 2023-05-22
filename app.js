require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandling = require('./middlewares/errorHandling');
const routes = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { DEFAULT_MONGO_DB_LINK } = require('./utils/config');

const {
  PORT = 3000,
  NODE_ENV = 'develop',
  MONGO_PROD_DB,
} = process.env;

const options = {
  origin: [
    'https://localhost:3001',
    'http://localhost:3001',
    'https://diplom-kogrms.nomoredomains.monster',
    'http://diplom-kogrms.nomoredomains.monster',
  ],
  // origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};

const app = express();

app.use(helmet());

app.use('*', cors(options));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(NODE_ENV === 'production' ? MONGO_PROD_DB : DEFAULT_MONGO_DB_LINK);

app.use(requestLogger);

app.use(routes);

app.use(errorLogger);

app.use(errors());

app.use(errorHandling);

app.listen(PORT);
