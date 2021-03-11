import * as yaml from 'js-yaml';
import {
  DeepObject,
  Field,
  FieldComponent,
  FieldConfig,
  SelectiveEditor,
  TemplateResult,
  Types,
  html,
  repeat,
  unsafeHTML,
} from '@blinkk/selective-edit';
import {DeepClean} from '../../utility/deepClean';
import {LiveEditorGlobalConfig} from '../../editor/editor';

export interface ExampleFieldUrl {
  label: string;
  url: string;
}

export interface ExampleFieldConfig extends FieldConfig {
  cleanerKeys?: Array<string>;
  docUrls?: Array<ExampleFieldUrl>;
  field: FieldConfig;
}

export class ExampleFieldField extends Field {
  cleaner: DeepClean;
  config: ExampleFieldConfig;
  field?: FieldComponent | null;
  isExpanded?: boolean;

  constructor(
    types: Types,
    config: ExampleFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'exampleField'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.cleaner = new DeepClean({
      removeKeys: (this.config.cleanerKeys || []).concat([
        'isGuessed',
        'parentKey',
      ]),
    });
  }

  handleExpandClick(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isExpanded = true;
    this.render();
  }

  get isClean() {
    return this.field?.isClean === undefined ? true : this.field?.isClean;
  }

  get isValid() {
    return this.field?.isValid === undefined ? true : this.field?.isValid;
  }

  /**
   * No original value update for the example.
   *
   * @param editor Selective editor used to render the template.
   * @param data Data provided to render the template.
   */
  template(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    return this.templateWrapper(editor, data);
  }

  /**
   * Show the field, but also show the config that is used to
   * generate the field.
   *
   * @param editor Selective editor used to render the template.
   * @param data Data provided to render the template.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateStructure(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    if (!this.field) {
      this.field = this.types.fields.newFromKey(
        this.config.field.type,
        this.types,
        this.config.field,
        this.globalConfig
      );
    }

    if (!this.isExpanded) {
      return html`${this.field?.template(editor, data) || ''}
        <div
          class="le__clickable selective__example_field__expand"
          @click=${this.handleExpandClick.bind(this)}
        >
          Show config…
        </div>`;
    }

    return html`${this.field?.template(editor, data) || ''}
      <div class="selective__example_field__code">
        <pre><code>${unsafeHTML(
          formatCodeSample(
            yaml.dump(
              replaceSpecialized(
                this.cleaner.clean(this.config.field) as FieldConfig
              )
            )
          )
        )}</code></pre>
      </div>
      ${this.config.docUrls
        ? html`<div class="selective__example_field__doc_url">
            ${repeat(
              this.config.docUrls,
              docUrl => docUrl.label,
              docUrl =>
                html`<a href=${docUrl.url} target="_blank">${docUrl.label}</a>`
            )}
          </div>`
        : ''}`;
  }

  get value() {
    return this.field?.value;
  }
}

function formatCodeSample(code: string): string {
  const cleanLines: Array<string> = [];
  let indentLength = -1;
  for (const line of code.split('\n')) {
    if (!line.trim()) {
      continue;
    }

    if (indentLength < 0) {
      indentLength = line.length - line.trim().length;
    }

    // Remove the same indent length off all lines based on first line.
    cleanLines.push(line.slice(indentLength));
  }

  return cleanLines.join('\n');
}

/**
 * The example page loads all the specialized fields at once.
 *
 * For the example page the field configs for the specialized fields
 * are prefixed. But when the fields are used in a specialized project,
 * the field type is not prefixed.
 *
 * Since we want the code snippet to be copyable for projects, we need
 * to clean up the type shown for the code snippet to make it easy for
 * developers to copy to their projects as a starting point.
 *
 * @param fieldConfig Field config with example field configuration.
 * @returns Updated field config with correct type.
 */
function replaceSpecialized(fieldConfig: FieldConfig): FieldConfig {
  let isModified = false;

  // Amagaki fields.
  if (fieldConfig.type.startsWith('amagaki')) {
    fieldConfig.type = fieldConfig.type.replace(/^amagaki/, '');
    isModified = true;
  }

  // Grow fields.
  if (fieldConfig.type.startsWith('grow')) {
    fieldConfig.type = fieldConfig.type.replace(/^grow/, '');
    isModified = true;
  }

  // If modified, lowercase the first letter of the type.
  if (isModified && fieldConfig.type.length) {
    fieldConfig.type = `${fieldConfig.type[0].toLowerCase()}${fieldConfig.type.slice(
      1
    )}`;
  }

  return fieldConfig;
}
