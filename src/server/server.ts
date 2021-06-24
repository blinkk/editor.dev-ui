import express from 'express';
import nunjucks from 'nunjucks';
import path from 'path';

const PORT = 8080;
const MODE = process.env.MODE || 'dev';
const PROJECT_ID = process.env.PROJECT_ID || '';

// Determine base for website files.
let websiteRoot = path.join(__dirname, '..', '..', 'public');

if (MODE === 'dev') {
  websiteRoot = path.join(__dirname, '..', '..', 'website', 'build');
}

const websiteOptions = {
  root: websiteRoot,
  dotfiles: 'deny',
};

// App
const app = express();

nunjucks.configure('views', {
  noCache: MODE === 'dev',
  autoescape: true,
  express: app,
});

// Use local server page.
app.get('/local/*', (req, res, next) => {
  const filename = 'local/index.html';
  res.sendFile(filename, websiteOptions, err => {
    if (err) {
      next(err);
    }
  });
});

app.all('/gh/callback', (req, res, next) => {
  const filename = 'gh/callback/index.html';
  res.sendFile(filename, websiteOptions, err => {
    if (err) {
      next(err);
    }
  });
});

app.get('/gh/*', (req, res, next) => {
  const filename = 'gh/index.html';
  res.sendFile(filename, websiteOptions, err => {
    if (err) {
      next(err);
    }
  });
});

// Determine where to server static files from.
if (MODE === 'dev') {
  app.use(express.static('website/build'));
} else {
  app.use(express.static('public'));
}

/**
 * Check for missing trailing slashes and redirect.
 */
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.slice(-1) !== '/') {
      res.redirect(302, req.path + '/' + req.url.slice(req.path.length));
    } else {
      next();
    }
  }
);

app.listen(process.env.PORT || PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
