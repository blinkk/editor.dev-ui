import {
  DeepObject,
  Field,
  FieldConfig,
  SelectiveEditor,
  TemplateResult,
  Types,
  html,
} from '@blinkk/selective-edit';
import {EVENT_RENDER_COMPLETE} from '../events';
import {LiveEditorGlobalConfig} from '../editor';
import {MarkdownEditor} from '../../prose/markdownEditor';

export interface MarkdownFieldConfig extends FieldConfig {
  /**
   * Default the editor to show the raw markdown when showing the field
   * instead of the WYSIWYG view.
   */
  defaultSource: boolean;
}

export class MarkdownField extends Field {
  config: MarkdownFieldConfig;
  markdownEditor?: MarkdownEditor;

  constructor(
    types: Types,
    config: MarkdownFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'markdown'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
  }

  createEditorIfMissing() {
    if (this.markdownEditor) {
      return;
    }

    document.addEventListener(
      EVENT_RENDER_COMPLETE,
      () => {
        const container = document.querySelector(`#markdown-${this.uid}`);
        if (!container) {
          return;
        }
        this.markdownEditor = new MarkdownEditor(container as HTMLElement);
        console.log('markdown container', container);
      },
      {
        once: true,
      }
    );
  }

  // /**
  //  * Template for rendering the field header.
  //  *
  //  * Used for rendering the icons for the field.
  //  *
  //  * @param editor Selective editor used to render the template.
  //  * @param data Data provided to render the template.
  //  */
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // templateHeader(editor: SelectiveEditor, data: DeepObject): TemplateResult {
  //   return html`<div
  //     class="selective__field__header__icons selective__field__icons"
  //   >
  //     <div class="selective__field__icons__section"></div>
  //     <div class="selective__field__icons__section">
  //       <span class="material-icons">source</span>
  //     </div>
  //   </div>`;
  // }

  /**
   * Template for rendering the markdown container.
   *
   * @param editor Selective editor used to render the template.
   * @param data Data provided to render the template.
   */
  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    this.createEditorIfMissing();

    return html`${this.templateHelp(editor, data)}
      <div class="selective__field__input">
        <div
          id="markdown-${this.uid}"
          class="selective__field__prosemirror"
        ></div>
      </div>`;
  }
}
