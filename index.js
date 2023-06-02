require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const responseTime = require('response-time');

const app = express();
const router = require('./routes');
const connectDB = require('./db/connect');
const errorMiddleware = require('./middlewares/errorsMiddleware');
const { apiLimiter } = require('./middlewares/rateLimiters');

const { PORT } = process.env;

// enable CORS
// app.use(cors());
// security-related HTTP response headers
// app.use(helmet());
// adds a X-Response-Time header to responses
app.use(responseTime());
// for parsing application/json
app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// logger
app.use(morgan('short'));

app.use(`/api/v1/`, apiLimiter, router, (req, res) => {
  res.status(404).send('Not Found');
});
app.use(errorMiddleware);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT || 3000, () => {
      console.log('🚀 App is listening on port 3000');
    });
  } catch (error) {
    console.error(error);
  }
};

start();
