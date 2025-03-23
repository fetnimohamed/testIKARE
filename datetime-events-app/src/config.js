const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  environment: process.env.REACT_APP_ENV || 'development',
  logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
  disableAnimations: process.env.REACT_APP_DISABLE_ANIMATIONS === 'true',
  useTestData: process.env.REACT_APP_USE_TEST_DATA === 'true',
};

export default config;
