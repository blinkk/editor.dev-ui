import {EditorAppShell} from './app/index';
import StackdriverErrorReporter from 'stackdriver-errors-js';

// Check for configured stackdriver error reporting.
const stackdriverKey = document.body.dataset.stackdriverKey;
if (stackdriverKey) {
  const projectId = document.body.dataset.projectId;
  if (projectId) {
    const errorHandler = new StackdriverErrorReporter();
    errorHandler.start({
      projectId: projectId,
      key: stackdriverKey,
      service: 'editor.dev',
    });
  }
}

const container = document.querySelector('.container') as HTMLElement;
const shellApp = new EditorAppShell(container);
shellApp.init();
