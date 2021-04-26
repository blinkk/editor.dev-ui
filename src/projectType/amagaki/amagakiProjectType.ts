import {AmagakiPartialsField} from './field/partials';
import {FieldConstructor} from '@blinkk/selective-edit';
import {ProjectTypeComponent} from '../projectType';

export class AmagakiProjectType implements ProjectTypeComponent {
  type = 'amagaki';

  get fieldTypes(): Record<string, FieldConstructor> {
    return {
      partials: (AmagakiPartialsField as unknown) as FieldConstructor,
    };
  }
}
