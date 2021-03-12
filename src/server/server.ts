import express from 'express';
import nunjucks from 'nunjucks';

const PORT = 8080;
const MODE = process.env.MODE || 'dev';

// App
const app = express();

nunjucks.configure('static/server', {
  noCache: MODE === 'dev',
  autoescape: true,
  express: app,
});

// Determine where to server static files from.
if (MODE === 'dev') {
  app.use(express.static('static/server'));
  app.use(express.static('dist/css/server'));
  app.use(express.static('dist/src/server'));
} else {
  app.use(express.static('public'));
}

app.get('/local/:port/', (req, res) => {
  res.render('index.njk', {
    port: req.params.port,
  });
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
