import {Field, FieldConfig, Types} from '@blinkk/selective-edit';
import {LiveEditorGlobalConfig} from '../editor';

export interface MarkdownFieldConfig extends FieldConfig {
  /**
   * Default the editor to show the raw markdown when showing the field
   * instead of the WYSIWYG view.
   */
  defaultSource: boolean;
}

export class MarkdownField extends Field {
  config: MarkdownFieldConfig;

  constructor(
    types: Types,
    config: MarkdownFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'markdown'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
  }
}
