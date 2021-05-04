import {GrowProjectTypeApi, PartialData} from '../../editor/api';
import {ServerApiComponent} from '../../server/api';
import bent from 'bent';

const postJSON = bent('json', 'POST');

export class GrowApi implements GrowProjectTypeApi {
  api: ServerApiComponent;
  constructor(api: ServerApiComponent) {
    this.api = api;
  }

  async getPartials(): Promise<Record<string, PartialData>> {
    return postJSON(
      this.api.resolveApiUrl('/grow/partials.get'),
      this.api.expandParams({})
    ) as Promise<Record<string, PartialData>>;
  }

  async getStrings(): Promise<Record<string, any>> {
    return postJSON(
      this.api.resolveApiUrl('/grow/strings.get'),
      this.api.expandParams({})
    ) as Promise<Record<string, any>>;
  }
}
