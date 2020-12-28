const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');

// env variables
dotenv.config({ path: './config/config.env' });

// connection to mongoDB
connectDB();

// routes files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

const PORT = process.env.PORT || 5000;

const app = express();

// express body parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

// fileupload middleware
app.use(fileupload());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

// routing the api calls
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

// error handling middleware
app.use(errorHandler);

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
