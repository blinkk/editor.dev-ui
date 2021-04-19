import {GrowPartialData, GrowProjectTypeApi} from '../../editor/api';
import {ServerApiComponent} from '../../server/api';
import bent from 'bent';

const postJSON = bent('json', 'POST');

export class GrowApi implements GrowProjectTypeApi {
  api: ServerApiComponent;
  constructor(api: ServerApiComponent) {
    this.api = api;
  }

  async getPartials(): Promise<Array<GrowPartialData>> {
    return postJSON(
      this.api.resolveApiUrl('/grow/partials.get'),
      this.api.expandParams({})
    ) as Promise<Array<GrowPartialData>>;
  }
}
