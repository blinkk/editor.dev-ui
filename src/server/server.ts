import express from 'express';
import nunjucks from 'nunjucks';

const PORT = 8080;
const MODE = process.env.MODE || 'dev';
const PROJECT_ID = process.env.PROJECT_ID || '';
const DEFAULT_LOCAL_PORT = 9090;

// Stackdriver api key
const STACKDRIVER_KEY =
  process.env.STACKDRIVER_KEY || 'AIzaSyAvmyHYE91XvlFzPI5SA5LcRoIx-aOCGJU';

// App
const app = express();

nunjucks.configure('views', {
  noCache: MODE === 'dev',
  autoescape: true,
  express: app,
});

// Use local server connector.
app.get('/local/:port(\\d+)/*', (req, res) => {
  res.render('index.njk', {
    port: (req.params as any).port,
    file: (req.params as any)['0'],
    mode: MODE,
    projectId: PROJECT_ID,
    stackdriverKey: MODE === 'dev' ? undefined : STACKDRIVER_KEY,
  });
});

// Use local server with default port.
app.get('/local/*', (req, res) => {
  res.render('index.njk', {
    port: DEFAULT_LOCAL_PORT,
    file: (req.params as any)['0'],
    mode: MODE,
    projectId: PROJECT_ID,
    stackdriverKey: MODE === 'dev' ? undefined : STACKDRIVER_KEY,
  });
});

// Use github connector.
app.get('/gh/:organization/:project/:branch/*', (req, res) => {
  res.render('index.njk', {
    service: 'gh',
    organization: req.params.organization,
    project: req.params.project,
    branch: req.params.branch,
    file: (req.params as any)['0'],
    mode: MODE,
    projectId: PROJECT_ID,
    stackdriverKey: MODE === 'dev' ? undefined : STACKDRIVER_KEY,
  });
});

app.all('/gh/callback', (req, res) => {
  res.render('callback.njk', {
    service: 'gh',
    mode: MODE,
    projectId: PROJECT_ID,
    message: 'Processing GitHub login. Please wait.',
  });
});

// Determine where to server static files from.
if (MODE === 'dev') {
  app.use(express.static('dist/css/server'));
  app.use(express.static('dist/src/server'));
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
