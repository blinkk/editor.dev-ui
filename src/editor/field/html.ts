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
import Quill from 'quill';

export interface HtmlFieldConfig extends FieldConfig {
  /**
   * Size of the hrml field. Allows for the field to be taller
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
}

export class HtmlField extends Field {
  htmlEditor?: Quill;
  config: HtmlFieldConfig;

  constructor(
    types: Types,
    config: HtmlFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'html'
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
        const container = document.querySelector(`#html-${this.uid}`);
        if (!container) {
          return;
        }
        this.htmlEditor = new Quill(container as HTMLElement, {
          modules: {
            toolbar: [
              [{header: [1, 2, 3, 4, 5, 6, false]}],
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{list: 'ordered'}, {list: 'bullet'}],
              ['link', 'image', 'video'],
              ['clean'],
            ],
          },
          theme: 'snow',
        });

        this.htmlEditor.on('text-change', () => {
          const pendingImgs: Array<HTMLElement> = Array.from(
            this.htmlEditor?.root.querySelectorAll(
              'img[src^="data:"]:not(.selective__image__uploading)'
            ) || []
          );

          for (const pendingImg of pendingImgs) {
            pendingImg.classList.add('selective__image__uploading');
            // TODO: Upload image.
            // this.imageUpload(pendingImg).then(url => {
            //   pendingImg.setAttribute('src', url);
            //   pendingImg.classList.remove('selective__image__uploading');
            // });
          }

          this.currentValue =
            (this.htmlEditor?.root as HTMLElement).innerHTML || '';

          this.render();
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
          class="selective__field__quill selective__field__quill--${this.config
            .size || 'medium'}"
        >
          ${this.currentValue || ''}
        </div>
      </div>`;
  }
}
