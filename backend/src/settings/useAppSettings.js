const useAppSettings = () => {
  let settings = {};
  settings['accessohub_app_email'] = process.env.APP_EMAIL || 'noreply@accessohub.com';
  settings['accessohub_base_url'] = process.env.FRONTEND_URL || 'http://localhost:3000';
  return settings;
};

module.exports = useAppSettings;
