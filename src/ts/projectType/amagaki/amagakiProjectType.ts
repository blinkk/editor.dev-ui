import {AmagakiAutoFields} from './amagakiAutoFields';
import {AmagakiDocumentField} from './field/document';
import {AmagakiPartialsField} from './field/partials';
import {AmagakiStaticField} from './field/static';
import {AmagakiStringField} from './field/string';
import {AmagakiYamlField} from './field/yaml';
import {FieldConstructor} from '@blinkk/selective-edit';
import {ProjectTypeComponent} from '../projectType';

export class AmagakiProjectType implements ProjectTypeComponent {
  type = 'amagaki';
  AutoFieldsCls = AmagakiAutoFields;

  get fieldTypes(): Record<string, FieldConstructor> {
    return {
      document: AmagakiDocumentField as unknown as FieldConstructor,
      partials: AmagakiPartialsField as unknown as FieldConstructor,
      string: AmagakiStringField as unknown as FieldConstructor,
      static: AmagakiStaticField as unknown as FieldConstructor,
      yaml: AmagakiYamlField as unknown as FieldConstructor,
    };
  }
}
