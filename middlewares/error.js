const errorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  //console logging for dev
  console.log(err);
  // mongo error invalid id
  if (err.name === 'CastError') {
    const message = `Resource no found for id: ${err.value}`;
    error = new errorResponse(message, 404);
  }
  // mongo error ValidatorError
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new errorResponse(message, 400);
  }
  //mongo error duplicate insert
  if (err.code === 11000) {
    const message = `Duplicate entry not allowed`;
    error = new errorResponse(message, 409);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'server error',
  });
};

module.exports = errorHandler;
