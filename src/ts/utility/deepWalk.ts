import {DataType} from '@blinkk/selective-edit/dist/utility/dataType';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeepWalkConfig {}

export type WalkableType = Record<string, any> | Array<any>;

export type TransformFunction = (value: any) => Promise<any>;
export type TransformFunctionSync = (value: any) => any;

export class DeepWalk {
  config: DeepWalkConfig;

  constructor(config?: DeepWalkConfig) {
    this.config = config || {};
  }

  async walk(
    value: WalkableType,
    transformValue: TransformFunction
  ): Promise<WalkableType> {
    if (DataType.isArray(value)) {
      return await this.walkArray(value as Array<any>, transformValue);
    }
    return await this.walkRecord(value as Record<string, any>, transformValue);
  }

  walkSync(
    value: WalkableType,
    transformValue: TransformFunctionSync
  ): WalkableType {
    if (DataType.isArray(value)) {
      return this.walkArraySync(value as Array<any>, transformValue);
    }
    return this.walkRecordSync(value as Record<string, any>, transformValue);
  }

  protected async walkArray(
    originalValue: Array<any>,
    transformValue: TransformFunction
  ): Promise<Array<any>> {
    const newValue: Array<any> = [];
    for (let value of originalValue) {
      if (DataType.isObject(value)) {
        // Clean in depth before testing for walking.
        value = await this.walkRecord(value, transformValue);
      } else if (DataType.isArray(value)) {
        value = await this.walkArray(value as Array<any>, transformValue);
      } else {
        value = await transformValue(value);
      }
      newValue.push(value);
    }

    return newValue;
  }

  protected walkArraySync(
    originalValue: Array<any>,
    transformValue: TransformFunctionSync
  ): Array<any> {
    const newValue: Array<any> = [];
    for (let value of originalValue) {
      if (DataType.isObject(value)) {
        // Clean in depth before testing for walking.
        value = this.walkRecordSync(value, transformValue);
      } else if (DataType.isArray(value)) {
        value = this.walkArraySync(value as Array<any>, transformValue);
      } else {
        value = transformValue(value);
      }
      newValue.push(value);
    }
    return newValue;
  }

  protected async walkRecord(
    originalValue: Record<string, any>,
    transformValue: TransformFunction
  ): Promise<Record<string, any>> {
    const newValue: Record<string, any> = {};
    // eslint-disable-next-line prefer-const
    for (let [key, value] of Object.entries(originalValue)) {
      if (DataType.isObject(value)) {
        // Clean in depth before testing for walking.
        value = await this.walkRecord(value, transformValue);
      } else if (DataType.isArray(value)) {
        value = await this.walkArray(value as Array<any>, transformValue);
      } else {
        value = await transformValue(value);
      }
      newValue[key] = value;
    }
    return newValue;
  }

  protected walkRecordSync(
    originalValue: Record<string, any>,
    transformValue: TransformFunctionSync
  ): Record<string, any> {
    const newValue: Record<string, any> = {};
    // eslint-disable-next-line prefer-const
    for (let [key, value] of Object.entries(originalValue)) {
      if (DataType.isObject(value)) {
        // Clean in depth before testing for walking.
        value = this.walkRecordSync(value, transformValue);
      } else if (DataType.isArray(value)) {
        value = this.walkArraySync(value as Array<any>, transformValue);
      } else {
        value = transformValue(value);
      }
      newValue[key] = value;
    }

    return newValue;
  }
}
