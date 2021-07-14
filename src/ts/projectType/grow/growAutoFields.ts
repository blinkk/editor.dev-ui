import {ConstructorConfig} from '../generic/field/constructor';
import {DataType} from '@blinkk/selective-edit';
import {LiveEditorAutoFields} from '../../editor/autoFields';

export class GrowAutoFields extends LiveEditorAutoFields {
  protected deepGuessObject(
    data: Record<string, any>,
    keyBase?: Array<string>
  ) {
    keyBase = keyBase || [];
    const key = keyBase.join('.');

    // Check for constrctor field.
    if (data._type && DataType.isString(data._type)) {
      let type = '';
      if (data._type === 'g.doc') {
        type = 'document';
      } else if (data._type === 'g.static') {
        type = 'static';
      } else if (data._type === 'g.string') {
        type = 'string';
      } else if (data._type === 'g.yaml') {
        type = 'yaml';
      }
      if (type !== '') {
        return [
          {
            key: key,
            type: type,
            label: this.guessLabel(key),
          } as ConstructorConfig,
        ];
      }
    }

    return super.deepGuessObject(data, keyBase);
  }
}
