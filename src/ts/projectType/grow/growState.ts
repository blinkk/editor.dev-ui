import {ApiError, PartialData, catchError} from '../../editor/api';
import {BaseProjectTypeState} from '../state';

export class GrowState extends BaseProjectTypeState {
  partials?: Record<string, PartialData>;
  strings?: Record<string, any>;

  get api() {
    return this.editorState.api;
  }

  getPartials(
    callback?: (partials: Record<string, PartialData>) => void,
    callbackError?: (error: ApiError) => void
  ): Record<string, PartialData> | undefined {
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

  getStrings(
    callback?: (strings: Record<string, any>) => void,
    callbackError?: (error: ApiError) => void
  ): Record<string, any> | undefined {
    const promiseKey = 'getStrings';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api.projectTypes.grow
      .getStrings()
      .then(data => {
        this.strings = data;

        delete this.promises[promiseKey];
        if (callback) {
          callback(this.strings || {});
        }
        this.triggerListener(promiseKey, this.strings);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.strings;
  }
}
