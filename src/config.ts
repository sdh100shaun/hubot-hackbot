const Config = {
  api_url: process.env['HACK24API_URL'] || 'http://api.hack24.co.uk/api',
  api_password: process.env['HACKBOT_PASSWORD'] || 'PASSWORD NOT SET',
  error_channel: process.env['ERROR_CHANNEL'] || "#hubot-errors",
};

export default Config;
