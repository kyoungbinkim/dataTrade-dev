const proxy = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(
    proxy.createProxyMiddleware('/api', { 
      target: 'http://127.0.0.1:60325/',
      changeOrigin: true,
    })
  )
}
