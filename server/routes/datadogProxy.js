const express = require('express');
const router = express.Router();
const https = require('https');

router.post('/*', (req, res) => {
  const targetPath = req.url; 
  const targetUrl = `https://browser-intake-us5-datadoghq.com${targetPath}`;
  
  // Clean headers for proxying
  const proxyHeaders = { ...req.headers };
  proxyHeaders.host = 'browser-intake-us5-datadoghq.com';
  delete proxyHeaders['origin'];
  delete proxyHeaders['referer'];

  const options = {
    method: 'POST',
    headers: proxyHeaders
  };

  const proxyReq = https.request(targetUrl, options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Datadog Proxy Error:', err);
    if (!res.headersSent) res.status(502).send('Bad Gateway');
  });

  req.pipe(proxyReq);
});

module.exports = router;
