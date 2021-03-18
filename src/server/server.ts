import express from 'express';
import nunjucks from 'nunjucks';

const PORT = 8080;
const MODE = process.env.MODE || 'dev';

// App
const app = express();

nunjucks.configure('views', {
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

// Use local server connector.
app.get('/local/:port/*', (req, res) => {
  res.render('index.njk', {
    port: req.params.port,
    file: req.params['0'],
  });
});

// Use github connector.
app.get('/gh/:organization/:project/:branch/*', (req, res) => {
  res.render('index.njk', {
    service: 'gh',
    organization: req.params.organization,
    project: req.params.project,
    branch: req.params.branch,
    file: req.params['0'],
    mode: MODE,
  });
});

app.all('/gh/callback', (req, res) => {
  res.render('gh/callback.njk', {
    service: 'gh',
    mode: MODE,
  });
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
