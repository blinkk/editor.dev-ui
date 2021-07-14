import {ConstructorConfig} from '../generic/field/constructor';
import {DataType} from '@blinkk/selective-edit';
import {LiveEditorAutoFields} from '../../editor/autoFields';

export class AmagakiAutoFields extends LiveEditorAutoFields {
  protected deepGuessObject(
    data: Record<string, any>,
    keyBase?: Array<string>
  ) {
    keyBase = keyBase || [];
    const key = keyBase.join('.');

    // Check for constrctor field.
    if (data._type && DataType.isString(data._type)) {
      let type = '';
      if (data._type === 'pod.doc') {
        type = 'document';
      } else if (data._type === 'pod.staticFile') {
        type = 'static';
      } else if (data._type === 'pod.string') {
        type = 'string';
      } else if (data._type === 'pod.yaml') {
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
