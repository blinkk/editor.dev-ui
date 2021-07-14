import {FieldConstructor} from '@blinkk/selective-edit';
import {GrowAutoFields} from './growAutoFields';
import {GrowDocumentField} from './field/document';
import {GrowPartialsField} from './field/partials';
import {GrowStaticField} from './field/static';
import {GrowStringField} from './field/string';
import {ProjectTypeComponent} from '../projectType';

export class GrowProjectType implements ProjectTypeComponent {
  type = 'grow';
  AutoFieldsCls = GrowAutoFields;

  get fieldTypes(): Record<string, FieldConstructor> {
    return {
      document: GrowDocumentField as unknown as FieldConstructor,
      partials: GrowPartialsField as unknown as FieldConstructor,
      static: GrowStaticField as unknown as FieldConstructor,
      string: GrowStringField as unknown as FieldConstructor,
    };
  }
}
