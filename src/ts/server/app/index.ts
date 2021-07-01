import {EditorAppComponent} from './editorApp';
import {GithubEditorApp} from './githubApp';
import {LocalEditorApp} from './localApp';

/**
 * Use the container data attributes to determine which app to create and use.
 *
 * @param container Container for the application to render.
 * @returns App customized for the settings based on the container attributes.
 */
export function appFromContainer(container: HTMLElement): EditorAppComponent {
  const localPort = parseInt(container.dataset.port || '');
  const isLocal = localPort > 0;

  if (isLocal) {
    return new LocalEditorApp(container, {
      port: localPort,
    });
  }

  const service = container.dataset.service;

  if (service === 'gh') {
    return new GithubEditorApp(container);
  }

  throw new Error('Unable to determine app to use');
}
