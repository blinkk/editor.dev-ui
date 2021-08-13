import {ApiError, PartialData, catchError} from '../../editor/api';
import {BaseProjectTypeState} from '../state';

export class AmagakiState extends BaseProjectTypeState {
  partials?: Record<string, PartialData> | null;

  get api() {
    return this.editorState.api;
  }

  getPartials(
    callback?: (devices: Record<string, PartialData>) => void,
    callbackError?: (error: ApiError) => void
  ): Record<string, PartialData> | undefined | null {
    const promiseKey = AmagakiStatePromiseKeys.GetPartials;
    if (this.promises[promiseKey]) {
      return this.partials;
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
      .catch(error => {
        this.partials = null;
        catchError(error, callbackError);
      });
    return this.partials;
  }

  /**
   * Lazy load of partials data.
   *
   * Understands the null state when there is an error requesting.
   */
  partialsOrGetPartials(): Record<string, PartialData> | undefined | null {
    if (
      this.partials === undefined &&
      !this.inProgress(AmagakiStatePromiseKeys.GetPartials)
    ) {
      this.getPartials();
    }
    return this.partials;
  }
}

/**
 * Promise keys used for tracking in operation promises for the state.
 */
export enum AmagakiStatePromiseKeys {
  GetPartials = 'GetPartials',
}
