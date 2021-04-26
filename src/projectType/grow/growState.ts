import {ApiError, GrowPartialData, catchError} from '../../editor/api';
import {BaseProjectTypeState} from '../state';

export class GrowState extends BaseProjectTypeState {
  partials?: Record<string, GrowPartialData>;

  get api() {
    return this.editorState.api;
  }

  getPartials(
    callback?: (devices: Record<string, GrowPartialData>) => void,
    callbackError?: (error: ApiError) => void
  ): Record<string, GrowPartialData> | undefined {
    const promiseKey = 'getPartials';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api.projectTypes.grow
      .getPartials()
      .then(data => {
        this.partials = data;

        delete this.promises[promiseKey];
        if (callback) {
          callback(this.partials || {});
        }
        this.triggerListener(promiseKey, this.partials);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.partials;
  }
}
