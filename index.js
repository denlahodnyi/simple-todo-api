require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const responseTime = require('response-time');
const rateLimit = require('express-rate-limit');
const app = express();
const router = require('./routes');
const connectDB = require('./db/connect');
const errorMiddleware = require('./middlewares/errorsMiddleware');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

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

app.use('/api/v1/tasks', apiLimiter, router, (req, res) => {
  res.status(404).send('Not Found');
});
app.use(errorMiddleware);

const start = async () => {
  try {
    await connectDB();
    app.listen(3000, () => {
      console.log('🚀 App is listening on port 3000');
    });
  } catch (error) {
    console.error(error);
  }
};

start();
