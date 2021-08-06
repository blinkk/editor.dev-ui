import {ConstructorConfig} from '../generic/field/constructor';
import {DataType} from '@blinkk/selective-edit';
import {LiveEditorAutoFields} from '../../editor/autoFields';
import {guessLabel} from '@blinkk/selective-edit/dist/selective/autoFields';

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
            label: guessLabel(key),
          } as ConstructorConfig,
        ];
      }
    }

    return super.deepGuessObject(data, keyBase);
  }

  /**
   * Guess the type of field to use based on the key and value.
   *
   * @param key Key to guess the type of field.
   * @param data Data to use for guessing field type.
   */
  guessType(key: string, data: any): string {
    // Check for partials field.
    if (key === 'partials' && DataType.isArray(data)) {
      return 'partials';
    }

    return super.guessType(key, data);
  }
}
