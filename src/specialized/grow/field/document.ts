import {GrowConstructorConfig, GrowConstructorField} from './constructor';
import {IncludeExcludeFilterConfig} from '../../../utility/filter';
import {LiveEditorGlobalConfig} from '../../../editor/editor';
import {Types} from '@blinkk/selective-edit';

export interface GrowDocumentConfig extends GrowConstructorConfig {
  /**
   * Filter to apply for the file list.
   */
  filter?: IncludeExcludeFilterConfig;
}

export class GrowDocumentField extends GrowConstructorField {
  config: GrowDocumentConfig;
  globalConfig: LiveEditorGlobalConfig;

  constructor(
    types: Types,
    config: GrowDocumentConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'document'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.tag = '!g.doc';
  }
}
