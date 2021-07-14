import express from 'express';
import path from 'path';

const PORT = 8080;
const MODE = process.env.MODE || 'dev';

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
app.get('/gh/*', (req, res, next) => {
  res.sendFile('gh/index.html', websiteOptions, err => {
    if (err) {
      next(err);
    }
  });
});

// Determine where to server static files from.
if (MODE === 'dev') {
  // Need to show the latest versions of the js and css without rebuild.
  app.use('/static', express.static('dist/server'));
  app.use('/static', express.static('dist/css/server'));

  // Use the website build output as static files for the server.
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
