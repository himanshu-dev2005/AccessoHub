const Joi = require('joi');

const mongoose = require('../../../db');
const ensureInitialized = require('../../../db/ensureInitialized');
const { isDefaultAdminCredentials, issueDefaultAdminSession } = require('./defaultAdminAuth');

const authUser = require('./authUser');

const login = async (req, res, { userModel }) => {
  const { email, password } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  const { error } = objectSchema.validate({ email, password });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid/Missing credentials.',
      errorMessage: error.message,
    });
  }

  // Fast direct login for built-in default admin without requiring a DB read
  if (userModel === 'Admin' && isDefaultAdminCredentials(email, password)) {
    return res.status(200).json({
      success: true,
      result: issueDefaultAdminSession(req.body.remember),
      message: 'Successfully login user',
    });
  }

  await ensureInitialized();
  const UserPasswordModel = mongoose.model(userModel + 'Password');
  const UserModel = mongoose.model(userModel);

  const user = await UserModel.findOne({ email: email, removed: false });

  if (!user)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  const databasePassword = await UserPasswordModel.findOne({ user: user._id, removed: false });

  if (!user.enabled)
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    });

  authUser(req, res, {
    user,
    databasePassword,
    password,
    UserPasswordModel,
  });
};

module.exports = login;
