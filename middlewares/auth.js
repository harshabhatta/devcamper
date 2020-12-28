const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // extract the token
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('not authorised to access the route', 401));
  }

  try {
    // verify the token using jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // get the user details & add it to request
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse('authorization failed', 401));
  }
});

// check whether user role is authorised to access a route
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `role ${req.user.role} is not authorised to access the route`,
          403
        )
      );
    }
    next();
  };
};
