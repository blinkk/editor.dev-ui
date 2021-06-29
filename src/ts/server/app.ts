import StackdriverErrorReporter from 'stackdriver-errors-js';
import {appFromContainer} from './app/index';

// Check for configured stackdriver error reporting.
const stackdriverKey = document.body.dataset.stackdriverKey;
if (stackdriverKey) {
  const projectId = document.body.dataset.projectId;
  const errorHandler = new StackdriverErrorReporter();
  errorHandler.start({
    projectId: projectId,
    key: stackdriverKey,
    service: 'editor.dev',
  });
}

const container = document.querySelector('.container') as HTMLElement;
const app = appFromContainer(container);
app.init();
