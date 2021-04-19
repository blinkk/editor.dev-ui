import {ApiError, GrowPartialData, catchError} from '../../editor/api';
import {BaseProjectTypeState} from '../state';

export class GrowState extends BaseProjectTypeState {
  partials?: Array<GrowPartialData>;

  get api() {
    return this.editorState.api;
  }

  getPartials(
    callback?: (devices: Array<GrowPartialData>) => void,
    callbackError?: (error: ApiError) => void
  ): Array<GrowPartialData> | undefined {
    const promiseKey = 'getDevices';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api.projectTypes.grow
      .getPartials()
      .then(data => {
        this.partials = data;

        delete this.promises[promiseKey];
        if (callback) {
          callback(this.partials || []);
        }
        this.triggerListener(promiseKey);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.partials;
  }
}
