import {ApiError, PartialData, catchError} from '../../editor/api';

import {BaseProjectTypeState} from '../state';
import {EVENT_REFRESH_FILE} from '../../editor/events';
import {EditorState} from '../../editor/state';

export class GrowState extends BaseProjectTypeState {
  partials?: Record<string, PartialData> | null;
  strings?: Record<string, any> | null;

  constructor(editorState: EditorState) {
    super(editorState);

    document.addEventListener(EVENT_REFRESH_FILE, () => {
      // Reset when the file refreshes.
      this.partials = undefined;
      this.strings = undefined;
    });
  }

  get api() {
    return this.editorState.api;
  }

  getPartials(
    callback?: (partials: Record<string, PartialData>) => void,
    callbackError?: (error: ApiError) => void
  ): Record<string, PartialData> | undefined | null {
    const promiseKey = GrowStatePromiseKeys.GetPartials;
    if (promiseKey in this.promises) {
      return this.partials;
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
      .catch(error => {
        this.partials = null;
        catchError(error, callbackError);
      });
    return this.partials;
  }

  getStrings(
    callback?: (strings: Record<string, any>) => void,
    callbackError?: (error: ApiError) => void
  ): Record<string, any> | undefined | null {
    const promiseKey = GrowStatePromiseKeys.GetStrings;
    if (promiseKey in this.promises) {
      return this.strings;
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
      .catch(error => {
        this.strings = null;
        catchError(error, callbackError);
      });
    return this.strings;
  }

  /**
   * Lazy load of partials data.
   *
   * Understands the null state when there is an error requesting.
   */
  partialsOrGetPartials(): Record<string, PartialData> | undefined | null {
    if (
      this.partials === undefined &&
      !this.inProgress(GrowStatePromiseKeys.GetPartials)
    ) {
      this.getPartials();
    }
    return this.partials;
  }

  /**
   * Lazy load of strings data.
   *
   * Understands the null state when there is an error requesting.
   */
  stringsOrGetStrings(): Record<string, any> | undefined | null {
    if (
      this.strings === undefined &&
      !this.inProgress(GrowStatePromiseKeys.GetStrings)
    ) {
      this.getStrings();
    }
    return this.strings;
  }
}

/**
 * Promise keys used for tracking in operation promises for the state.
 */
export enum GrowStatePromiseKeys {
  GetPartials = 'GetPartials',
  GetStrings = 'GetStrings',
}
