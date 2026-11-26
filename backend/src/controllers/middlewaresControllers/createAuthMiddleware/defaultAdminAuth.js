const jwt = require('jsonwebtoken');

const DEFAULT_ADMIN_ID = 'accessohub_default_admin';
const DEFAULT_ADMIN_EMAIL = 'admin@accessohub.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

const DEFAULT_ADMIN_PROFILE = {
  _id: DEFAULT_ADMIN_ID,
  id: DEFAULT_ADMIN_ID,
  name: 'AccessoHub',
  surname: 'Admin',
  role: 'owner',
  email: DEFAULT_ADMIN_EMAIL,
  photo: null,
  enabled: true,
  removed: false,
};

const revokedDefaultTokens = new Set();

function getJwtSecret(secretEnvKey = 'JWT_SECRET') {
  return process.env[secretEnvKey] || process.env.JWT_SECRET || 'accessohub_crm_default_jwt_secret';
}

function isDefaultAdminCredentials(email, password) {
  return (
    String(email || '').trim().toLowerCase() === DEFAULT_ADMIN_EMAIL &&
    String(password || '') === DEFAULT_ADMIN_PASSWORD
  );
}

function issueDefaultAdminSession(remember) {
  const token = jwt.sign(
    {
      id: DEFAULT_ADMIN_ID,
      isDefaultAdmin: true,
    },
    getJwtSecret(),
    { expiresIn: remember ? 365 * 24 + 'h' : '24h' }
  );
  return {
    _id: DEFAULT_ADMIN_PROFILE._id,
    name: DEFAULT_ADMIN_PROFILE.name,
    surname: DEFAULT_ADMIN_PROFILE.surname,
    role: DEFAULT_ADMIN_PROFILE.role,
    email: DEFAULT_ADMIN_PROFILE.email,
    photo: DEFAULT_ADMIN_PROFILE.photo,
    token,
    maxAge: remember ? 365 : null,
  };
}

function revokeDefaultAdminToken(token) {
  if (token) revokedDefaultTokens.add(token);
}

function isDefaultAdminTokenRevoked(token) {
  return Boolean(token && revokedDefaultTokens.has(token));
}

module.exports = {
  DEFAULT_ADMIN_ID,
  DEFAULT_ADMIN_PROFILE,
  getJwtSecret,
  isDefaultAdminCredentials,
  issueDefaultAdminSession,
  revokeDefaultAdminToken,
  isDefaultAdminTokenRevoked,
};
