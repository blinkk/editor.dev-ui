import {Base} from '@blinkk/selective-edit/dist/mixins';
import {EVENT_RENDER} from '../editor/events';
import {EditorState} from '../editor/state';
import {ListenersMixin} from '../mixin/listeners';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProjectTypeState {}

export class BaseProjectTypeState
  extends ListenersMixin(Base)
  implements ProjectTypeState
{
  editorState: EditorState;
  /**
   * Keep track of active promises to keep from requesting the same data
   * multiple times.
   */
  protected promises: Record<string, Promise<any>>;

  constructor(editorState: EditorState) {
    super();
    this.promises = {};
    this.editorState = editorState;
  }

  /**
   * Determines if there is an existing promise for a given key.
   *
   * @param key Key identifying the promise or loading status.
   */
  inProgress(key: string): boolean {
    return key in this.promises;
  }

  /**
   * Signal for the editor to re-render.
   */
  render() {
    document.dispatchEvent(new CustomEvent(EVENT_RENDER));
  }
}
