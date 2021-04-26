import {ApiError, PartialData, catchError} from '../../editor/api';
import {BaseProjectTypeState} from '../state';

export class AmagakiState extends BaseProjectTypeState {
  partials?: Record<string, PartialData>;

  get api() {
    return this.editorState.api;
  }

  getPartials(
    callback?: (devices: Record<string, PartialData>) => void,
    callbackError?: (error: ApiError) => void
  ): Record<string, PartialData> | undefined {
    const promiseKey = 'getPartials';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api.projectTypes.amagaki
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
