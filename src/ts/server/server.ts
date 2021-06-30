import express from 'express';
import nunjucks from 'nunjucks';
import path from 'path';

const PORT = 8080;
const MODE = process.env.MODE || 'dev';
const PROJECT_ID = process.env.PROJECT_ID || '';
const STACKDRIVER_KEY =
  process.env.STACKDRIVER_KEY || 'AIzaSyAvmyHYE91XvlFzPI5SA5LcRoIx-aOCGJU';

// Determine base for website files.
let websiteRoot = path.join(process.cwd(), 'public');
if (MODE === 'dev') {
  websiteRoot = path.join(process.cwd(), 'website', 'build');
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
  res.sendFile('local/index.html', websiteOptions, err => {
    if (err) {
      next(err);
    }
  });
});

app.all('/gh/callback', (req, res, next) => {
  res.sendFile('gh/callback/index.html', websiteOptions, err => {
    if (err) {
      next(err);
    }
  });
});

// Use github connector.
app.get('/gh/*', (req, res) => {
  res.render('index.njk', {
    service: 'gh',
    mode: MODE,
    projectId: PROJECT_ID,
    stackdriverKey: MODE === 'dev' ? undefined : STACKDRIVER_KEY,
  });
});

// Determine where to server static files from.
if (MODE === 'dev') {
  app.use(express.static('dist/server'));
  app.use(express.static('website/build'));
  app.use(express.static('website/build/static'));
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
