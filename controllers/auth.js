const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
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

//@desc      forgot user password
//url        POST /api/v1/auth/forgotpassword
//@access    public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse('user not found', 404));
  }
  // get reset Token
  const resetToken = user.getResetPasswordToken();
  // update the user with the reset token
  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `you are recieving this email as you have requested for password reset. Please make a PUT request to ${resetUrl}`;

    await sendEmail({
      toEmail: user.email,
      subject: 'password reset token',
      message,
    });
    res
      .status(200)
      .json({ success: true, data: 'forgot password reset email sent' });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    return next(new ErrorResponse('Error sending the email', 500));
  }
});

//@desc      reset password
//url        PUT /api/v1/auth/resetpassword/:resettoken
//@access    public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // generate hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  // find user by hashed token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log(Date.now());

  if (!user) {
    return next(new ErrorResponse('invalid token or token expired', 500));
  }

  //reset password & clear reset token & expire
  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  // save the details
  await user.save();

  // create token & send response with token in a cookie
  sendTokenResponse(user, 200, res);
});

//@desc      update user name & email
//url        PUT /api/v1/auth/userdetails
//@access    private
exports.updateUserDetails = asyncHandler(async (req, res, next) => {
  const detailsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, detailsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

//@desc      update user password
//url        PUT /api/v1/auth/userpassword
//@access    private
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  // get user details
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new ErrorResponse('user not found', 404));
  }
  // check for the password
  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('invalid user password details', 401));
  }
  user.password = req.body.newPassword;
  await user.save();

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
