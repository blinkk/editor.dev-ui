import {FieldConstructor} from '@blinkk/selective-edit';
import {GrowDocumentField} from './field/document';
import {ProjectTypeComponent} from '../projectType';

export class GrowProjectType implements ProjectTypeComponent {
  type = 'grow';

  get fieldTypes(): Record<string, FieldConstructor> {
    return {
      document: (GrowDocumentField as unknown) as FieldConstructor,
    };
  }
}
