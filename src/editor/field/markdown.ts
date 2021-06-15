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
import Editor from '@toast-ui/editor';
import {LiveEditorGlobalConfig} from '../editor';

export interface MarkdownFieldConfig extends FieldConfig {
  /**
   * Placeholder for the markdown field.
   */
  placeholder?: string;
  /**
   * Size of the hrml field. Allows for the field to be taller
   * or shorter.
   */
  size: MarkdownFieldSize | string;
}

/**
 * Sizes available for the markdown field size.
 */
export enum MarkdownFieldSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export class MarkdownField extends Field {
  markdownEditor?: Editor;
  config: MarkdownFieldConfig;

  constructor(
    types: Types,
    config: MarkdownFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'html'
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
        const container = document.querySelector(`#html-${this.uid}`);
        if (!container) {
          return;
        }
        this.markdownEditor = new Editor({
          el: container as HTMLElement,
          events: {
            change: () => {
              this.currentValue = this.markdownEditor?.getMarkdown().trim();

              // Triggering before the initialization is finished.
              if (this.markdownEditor) {
                this.render();
              }
            },
          },
          hideModeSwitch: true,
          initialEditType: 'markdown',
          initialValue: this.currentValue || '',
          placeholder: this.config.placeholder || '',
          previewStyle: 'tab',
          usageStatistics: false,
        });
      },
      {
        once: true,
      }
    );
  }

  /**
   * Template for rendering the html container.
   *
   * @param editor Selective editor used to render the template.
   * @param data Data provided to render the template.
   */
  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    this.createEditorIfMissing();

    return html`${this.templateHelp(editor, data)}
      <div class="selective__field__input">
        <div
          id="html-${this.uid}"
          class="selective__field__toastui selective__field__toastui--${this
            .config.size || 'medium'}"
        >
          ${this.currentValue || ''}
        </div>
      </div>`;
  }
}
