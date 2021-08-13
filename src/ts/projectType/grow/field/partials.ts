import {GenericPartialsField} from '../../generic/field/partials';
import {PartialData} from '../../../editor/api';

export class GrowPartialsField extends GenericPartialsField {
  get partials(): Record<string, PartialData> | undefined | null {
    return this.globalConfig.state.projectTypes.grow.partialsOrGetPartials();
  }
}
