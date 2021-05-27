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
import {HtmlEditor} from '../../prose/htmlEditor';
import {LiveEditorGlobalConfig} from '../editor';

export interface HtmlFieldConfig extends FieldConfig {
  /**
   * Size of the markdown field. Allows for the field to be taller
   * or shorter.
   */
  size: HtmlFieldSize | string;
}

/**
 * Sizes available for the markdown field size.
 */
export enum HtmlFieldSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
  XXLarge = 'xxlarge',
}

export class HtmlField extends Field {
  htmlEditor?: HtmlEditor;
  config: HtmlFieldConfig;

  constructor(
    types: Types,
    config: HtmlFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'markdown'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
  }

  createEditorIfMissing() {
    if (this.htmlEditor) {
      return;
    }

    document.addEventListener(
      EVENT_RENDER_COMPLETE,
      () => {
        const container = document.querySelector(`#markdown-${this.uid}`);
        if (!container) {
          return;
        }
        this.htmlEditor = new HtmlEditor(container as HTMLElement);
      },
      {
        once: true,
      }
    );
  }

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
