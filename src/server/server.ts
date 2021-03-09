const express = require('express');

const PORT = 8080;
const HOST = '0.0.0.0';
const MODE = process.env.MODE || 'dev';

// App
const app = express();

// Determine where to server static files from.
if (MODE === 'dev') {
  app.use(express.static('static/server'));
  app.use(express.static('dist/css/server'));
  app.use(express.static('dist/src/server'));
} else {
  app.use(express.static('public'));
}

app.listen(process.env.PORT || PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
