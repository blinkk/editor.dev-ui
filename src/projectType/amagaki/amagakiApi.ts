import {AmagakiPartialData, AmagakiProjectTypeApi} from '../../editor/api';
import {ServerApiComponent} from '../../server/api';
import bent from 'bent';

const postJSON = bent('json', 'POST');

export class AmagakiApi implements AmagakiProjectTypeApi {
  api: ServerApiComponent;
  constructor(api: ServerApiComponent) {
    this.api = api;
  }

  async getPartials(): Promise<Record<string, AmagakiPartialData>> {
    return postJSON(
      this.api.resolveApiUrl('/amagaki/partials.get'),
      this.api.expandParams({})
    ) as Promise<Record<string, AmagakiPartialData>>;
  }
}
