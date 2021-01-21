import {EVENT_RENDER} from './editor/events';
import {ExampleApi} from './exampleApi';
import {LiveEditor} from './editor/editor';
import {EVENT_RENDER as SELECTIVE_EVENT_RENDER} from '@blinkk/selective-edit/dist/src/selective/events';

const container = document.querySelector('.container');
const exampleEditor = new LiveEditor(
  {
    api: new ExampleApi(),
    selectiveConfig: {},
  },
  container as HTMLElement
);

exampleEditor.render();

// Bind to the custom event to re-render the editor.
document.addEventListener(EVENT_RENDER, () => {
  exampleEditor.render();
});

// Bind to the selective event for rendering as well.
document.addEventListener(SELECTIVE_EVENT_RENDER, () => {
  exampleEditor.render();
});
