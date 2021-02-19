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
  unsafeHTML,
} from '@blinkk/selective-edit';
import {LiveEditorGlobalConfig} from '../../editor/editor';

export interface ExampleFieldConfig extends FieldConfig {
  field: FieldConfig;
}

export class ExampleFieldField extends Field {
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
  }

  handleExpandClick(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isExpanded = true;
    this.render();
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
          Show config...
        </div>`;
    }

    return html`${this.field?.template(editor, data) || ''}
      <div class="selective__example_field__code">
        <pre><code>${unsafeHTML(
          formatCodeSample(yaml.dump(this.config.field))
        )}</code></pre>
      </div>`;
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
