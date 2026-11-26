const mongoose = require('../../../db');
const { DEFAULT_ADMIN_ID, revokeDefaultAdminToken } = require('./defaultAdminAuth');

const logout = async (req, res, { userModel }) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (req.admin?._id === DEFAULT_ADMIN_ID) {
    revokeDefaultAdminToken(token);
    return res.json({
      success: true,
      result: {},
      message: 'Successfully logout',
    });
  }

  const UserPassword = mongoose.model(userModel + 'Password');

  if (token)
    await UserPassword.findOneAndUpdate(
      { user: req.admin._id },
      { $pull: { loggedSessions: token } },
      {
        new: true,
      }
    ).exec();
  else
    await UserPassword.findOneAndUpdate(
      { user: req.admin._id },
      { loggedSessions: [] },
      {
        new: true,
      }
    ).exec();

  return res.json({
    success: true,
    result: {},
    message: 'Successfully logout',
  });
};

module.exports = logout;
