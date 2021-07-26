import {
  AutoFields,
  guessLabel,
} from '@blinkk/selective-edit/dist/selective/autoFields';
import {EXT_TO_MIME_TYPE, MediaFieldConfig} from './field/media';

import {DataType} from '@blinkk/selective-edit/dist/utility/dataType';

export class LiveEditorAutoFields extends AutoFields {
  protected deepGuessObject(
    data: Record<string, any>,
    keyBase?: Array<string>
  ) {
    keyBase = keyBase || [];

    // Check for media field.
    if (data.url && DataType.isString(data.url)) {
      if (this.isMediaValue(data.url as string)) {
        const key = keyBase.join('.');
        return [
          {
            key: key,
            type: 'media',
            label: guessLabel(key),
          } as MediaFieldConfig,
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
    // Check for media list field.
    if (DataType.isArray(data)) {
      if (data.length > 0 && data[0].url && DataType.isString(data[0].url)) {
        if (this.isMediaValue(data[0].url as string)) {
          // TODO: Detect extra fields as fields on the media list.
          return 'mediaList';
        }
      }
    }

    return super.guessType(key, data);
  }

  private isMediaValue(value: string): boolean {
    for (const ext of Object.keys(EXT_TO_MIME_TYPE)) {
      if (value.endsWith(`.${ext}`)) {
        return true;
      }
    }

    // Support google images.
    return /\.googleusercontent\.com/.test(value);
  }
}
