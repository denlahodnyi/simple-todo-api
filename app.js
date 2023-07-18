require('dotenv').config({ debug: true });
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const responseTime = require('response-time');

const { NODE_ENV } = process.env;

if (NODE_ENV !== 'development') {
  // eslint-disable-next-line global-require
  require('dotenv').config({
    path: path.resolve(`.env.${NODE_ENV}`),
    override: true,
  });
}

const app = express();
const router = require('./routes');
const errorMiddleware = require('./middlewares/errorsMiddleware');
const { apiLimiter } = require('./middlewares/rateLimiters');

// enable CORS
app.use(cors());
// security-related HTTP response headers
// app.use(helmet());
// adds a X-Response-Time header to responses
app.use(responseTime());
// for parsing application/json
app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// logger
if (NODE_ENV !== 'test') {
  app.use(
    morgan('-> :method :url :status :res[content-length] – :response-time ms')
  );
}

app.use('/api/v1/', apiLimiter, router, (req, res) => {
  res.status(404).send('Not Found');
});
app.use(errorMiddleware);

module.exports = app;
