/**
 * Script for generating screenshots used for the documentation.
 *
 * Automated to help keep documentation screenshot updated in an
 * easy and reproducable manner.
 *
 * To generate the screenshots run `yarn run screenshot:docs`
 */
import {Screenshotter} from './screenshotter/screenshotter';
import express from 'express';

// Crazy port number for serving the example locally.
const PORT = 7689;

const screenshotter = new Screenshotter({
  baseUrl: `http://localhost:${PORT}/`,
  // Screenshots are configured in the website directory.
  configFile: './website/screenshot-docs.yaml',
  // Screenshots are generated into the website where the docs are generated.
  outputDir: './website/static/img/screenshots',
});

const app = express();

app.use('/', express.static('static/example'));
app.use('/', express.static('dist/css/example'));
app.use('/', express.static('dist'));

const server = app.listen(PORT, () => {
  console.log(`Running for screenshots on http://localhost:${PORT}`);

  // Preceed to generate the screenshots.
  screenshotter
    .generate()
    .then(() => {
      console.log('Screenshots complete!');
      console.log('Closing screenshots server.');
      server.close();
    })
    .catch(err => {
      console.error('Screenshots failed');
      console.log('Closing screenshots server.');
      server.close();

      throw err;
    });
});
