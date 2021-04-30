import {DataType} from '@blinkk/selective-edit/dist/src/utility/dataType';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeepWalkConfig {}

export type WalkableType = Record<string, any> | Array<any>;

export type TransformFunction = (value: any) => Promise<any>;
export type TransformArrayFunction = (
  originalValue: Array<any>,
  transformValue: TransformFunction,
  transformArray: TransformArrayFunction,
  transformRecord: TransformRecordFunction
) => Promise<Array<any>>;
export type TransformRecordFunction = (
  originalValue: Record<string, any>,
  transformValue: TransformFunction,
  transformArray: TransformArrayFunction,
  transformRecord: TransformRecordFunction
) => Promise<Record<string, any>>;

export type TransformFunctionSync = (value: any) => any;
export type TransformArrayFunctionSync = (
  originalValue: Array<any>,
  transformValue: TransformFunctionSync,
  transformArray: TransformArrayFunctionSync,
  transformRecord: TransformRecordFunctionSync
) => Array<any>;
export type TransformRecordFunctionSync = (
  originalValue: Record<string, any>,
  transformValue: TransformFunctionSync,
  transformArray: TransformArrayFunctionSync,
  transformRecord: TransformRecordFunctionSync
) => Record<string, any>;

export class DeepWalk {
  config: DeepWalkConfig;

  constructor(config?: DeepWalkConfig) {
    this.config = config || {};
  }

  async walk(
    value: WalkableType,
    transformValue: TransformFunction,
    transformArray?: TransformArrayFunction,
    transformRecord?: TransformRecordFunction
  ): Promise<WalkableType> {
    if (!transformArray) {
      transformArray = this.walkArray;
    }
    if (!transformRecord) {
      transformRecord = this.walkRecord;
    }

    if (DataType.isArray(value)) {
      return await transformArray(
        value as Array<any>,
        transformValue,
        transformArray,
        transformRecord
      );
    }
    return await transformRecord(
      value as Record<string, any>,
      transformValue,
      transformArray,
      transformRecord
    );
  }

  walkSync(
    value: WalkableType,
    transformValue: TransformFunctionSync,
    transformArray?: TransformArrayFunctionSync,
    transformRecord?: TransformRecordFunctionSync
  ): WalkableType {
    if (!transformArray) {
      transformArray = this.walkArraySync;
    }
    if (!transformRecord) {
      transformRecord = this.walkRecordSync;
    }

    if (DataType.isArray(value)) {
      return transformArray(
        value as Array<any>,
        transformValue,
        transformArray,
        transformRecord
      );
    }
    return transformRecord(
      value as Record<string, any>,
      transformValue,
      transformArray,
      transformRecord
    );
  }

  protected async walkArray(
    originalValue: Array<any>,
    transformValue: TransformFunction,
    transformArray: TransformArrayFunction,
    transformRecord: TransformRecordFunction
  ): Promise<Array<any>> {
    const newValue: Array<any> = [];

    for (let value of originalValue) {
      if (DataType.isObject(value)) {
        // Clean in depth before testing for walking.
        value = await transformRecord(
          value,
          transformValue,
          transformArray,
          transformRecord
        );
      } else if (DataType.isArray(value)) {
        value = await transformArray(
          value as Array<any>,
          transformValue,
          transformArray,
          transformRecord
        );
      } else {
        value = await transformValue(value);
      }
      newValue.push(value);
    }

    return newValue;
  }

  protected walkArraySync(
    originalValue: Array<any>,
    transformValue: TransformFunctionSync,
    transformArray: TransformArrayFunctionSync,
    transformRecord: TransformRecordFunctionSync
  ): Array<any> {
    const newValue: Array<any> = [];

    for (let value of originalValue) {
      if (DataType.isObject(value)) {
        // Clean in depth before testing for walking.
        value = transformRecord(
          value,
          transformValue,
          transformArray,
          transformRecord
        );
      } else if (DataType.isArray(value)) {
        value = transformArray(
          value as Array<any>,
          transformValue,
          transformArray,
          transformRecord
        );
      } else {
        value = transformValue(value);
      }
      newValue.push(value);
    }
    return newValue;
  }

  protected async walkRecord(
    originalValue: Record<string, any>,
    transformValue: TransformFunction,
    transformArray: TransformArrayFunction,
    transformRecord: TransformRecordFunction
  ): Promise<Record<string, any>> {
    const newValue: Record<string, any> = {};

    // eslint-disable-next-line prefer-const
    for (let [key, value] of Object.entries(originalValue)) {
      if (DataType.isObject(value)) {
        // Clean in depth before testing for walking.
        value = await transformRecord(
          value,
          transformValue,
          transformArray,
          transformRecord
        );
      } else if (DataType.isArray(value)) {
        value = await transformArray(
          value as Array<any>,
          transformValue,
          transformArray,
          transformRecord
        );
      } else {
        value = await transformValue(value);
      }
      newValue[key] = value;
    }
    return newValue;
  }

  protected walkRecordSync(
    originalValue: Record<string, any>,
    transformValue: TransformFunctionSync,
    transformArray: TransformArrayFunctionSync,
    transformRecord: TransformRecordFunctionSync
  ): Record<string, any> {
    const newValue: Record<string, any> = {};

    // eslint-disable-next-line prefer-const
    for (let [key, value] of Object.entries(originalValue)) {
      if (DataType.isObject(value)) {
        // Clean in depth before testing for walking.
        value = transformRecord(
          value,
          transformValue,
          transformArray,
          transformRecord
        );
      } else if (DataType.isArray(value)) {
        value = transformArray(
          value as Array<any>,
          transformValue,
          transformArray,
          transformRecord
        );
      } else {
        value = transformValue(value);
      }
      newValue[key] = value;
    }

    return newValue;
  }
}
