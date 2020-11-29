const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// env variables
dotenv.config({ path: './config/config.env' });

// connection to mongoDB
connectDB();

// routes files
const bootcamps = require('./routes/bootcamps');

const PORT = process.env.PORT || 5000;

const app = express();

// express body parser
app.use(express.json());

// routing the api calls
app.use('/api/v1/bootcamps', bootcamps);

// server startup
const server = app.listen(
  PORT,
  console.log(
    `server has started at ${process.env.NODE_ENV} using port ${PORT}`
  )
);

// handle promise rejections
process.on('unhandledRejection', (error, promise) => {
  console.log(`error: ${error.message}`);
  server.close(() => process.exit(1));
});
