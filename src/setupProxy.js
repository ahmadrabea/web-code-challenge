const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/amadeus-api',
    createProxyMiddleware({
      target: 'https://test.api.amadeus.com',
      changeOrigin: true,
      pathRewrite: { '^/amadeus-api': '' },
      secure: true,
    })
  );
};
