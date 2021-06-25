import {DataType} from '@blinkk/selective-edit/dist/utility/dataType';

export interface DeepCleanConfig {
  protectedKeyPatterns?: Array<string | RegExp>;
  removeEmptyArrays?: boolean;
  removeEmptyObjects?: boolean;
  removeEmptyStrings?: boolean;
  removeKeys?: Array<string>;
  removeNulls?: boolean;
  removeUndefineds?: boolean;
}

type CleanableType = Record<string, any> | Array<any>;

export class DeepClean {
  config: DeepCleanConfig;

  constructor(config: DeepCleanConfig) {
    this.config = config;

    // Convert non-regex protected into regex.
    const patterns = this.config.protectedKeyPatterns || [];
    for (let i = 0; i < patterns.length; i++) {
      if (DataType.isString(patterns[i])) {
        patterns[i] = new RegExp(patterns[i]);
      }
    }
  }

  clean(value: CleanableType): CleanableType {
    if (DataType.isArray(value)) {
      return this.cleanArray(value as Array<any>);
    }
    return this.cleanRecord(value as Record<string, any>);
  }

  protected cleanArray(originalValue: Array<any>): Array<any> {
    const newValue: Array<any> = [];

    for (let value of originalValue) {
      if (DataType.isObject(value)) {
        // Clean in depth before testing for cleaning.
        value = this.cleanRecord(value);

        if (this.config.removeEmptyObjects && !Object.keys(value).length) {
          continue;
        }
      } else if (DataType.isArray(value)) {
        value = this.cleanArray(value as Array<any>);

        if (this.config.removeEmptyArrays && !value.length) {
          continue;
        }
      } else if (DataType.isString(value)) {
        if (this.config.removeEmptyStrings && !value.trim().length) {
          continue;
        }
      } else if (DataType.isNull(value) && this.config.removeNulls) {
        continue;
      } else if (DataType.isUndefined(value) && this.config.removeUndefineds) {
        continue;
      }
      newValue.push(value);
    }

    return newValue;
  }

  protected cleanRecord(
    originalValue: Record<string, any>
  ): Record<string, any> {
    const newValue: Record<string, any> = {};
    const removeKeys = this.config.removeKeys || [];

    // eslint-disable-next-line prefer-const
    for (let [key, value] of Object.entries(originalValue)) {
      if (this.isProtectedKey(key)) {
        newValue[key] = value;
        continue;
      }

      if (removeKeys.includes(key)) {
        continue;
      }

      if (DataType.isObject(value)) {
        // Clean in depth before testing for cleaning.
        value = this.cleanRecord(value);

        if (this.config.removeEmptyObjects && !Object.keys(value).length) {
          continue;
        }
      } else if (DataType.isArray(value)) {
        value = this.cleanArray(value as Array<any>);

        if (this.config.removeEmptyArrays && !value.length) {
          continue;
        }
      } else if (DataType.isString(value)) {
        if (this.config.removeEmptyStrings && !value.trim().length) {
          continue;
        }
      } else if (DataType.isNull(value) && this.config.removeNulls) {
        continue;
      } else if (DataType.isUndefined(value) && this.config.removeUndefineds) {
        continue;
      }
      newValue[key] = value;
    }

    return newValue;
  }

  isProtectedKey(key: string): boolean {
    for (const pattern of this.config.protectedKeyPatterns || []) {
      if ((pattern as RegExp).test(key)) {
        return true;
      }
    }
    return false;
  }
}
