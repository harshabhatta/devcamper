const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middlewares/async');

//@desc      register user
//url        POST /api/v1/auth/register
//@access    public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;
  const user = await User.create({
    name,
    email,
    role,
    password,
  });

  // create token & send response with token in a cookie
  sendTokenResponse(user, 200, res);
});

//@desc      login user
//url        POST /api/v1/auth/login
//@access    public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('please enter both email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  // invalid email
  if (!user) {
    return next(new ErrorResponse('invalid credentials', 401));
  }

  const isMatch = await user.matchPassword(password);
  // invalid password
  if (!isMatch) {
    return next(new ErrorResponse('invalid credentials', 401));
  }

  // create token & send response with token in a cookie
  sendTokenResponse(user, 200, res);
});

// create token and sending token in a cookie
const sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedJwtTokens();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};

//@desc      logged in user
//url        GET /api/v1/auth/me
//@access    public
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse('user not found', 404));
  }
  res.status(200).json({ success: true, data: user });
});
