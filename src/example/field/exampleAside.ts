import {AsideField, AsideFieldConfig} from '../../editor/field/aside';
import {
  DeepObject,
  SelectiveEditor,
  TemplateResult,
  Types,
  html,
  styleMap,
  unsafeHTML,
} from '@blinkk/selective-edit';
import {LiveEditorGlobalConfig} from '../../editor/editor';
import marked from 'marked';

export class ExampleAsideField extends AsideField {
  isExpanded?: boolean;

  constructor(
    types: Types,
    config: AsideFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'exampleAside'
  ) {
    super(types, config, globalConfig, fieldType);
  }

  handleExpandClick(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isExpanded = true;
    this.render();
  }

  /**
   * Template for rendering the field structure.
   *
   * Used for controlling the order that parts of the field are rendered.
   *
   * @param editor Selective editor used to render the template.
   * @param data Data provided to render the template.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateStructure(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    if (!this.isExpanded) {
      return html`<div
        class="le__clickable selective__example_aside__expand"
        @click=${this.handleExpandClick.bind(this)}
      >
        Show config...
      </div>`;
    }

    return html`<div class="selective__example_aside__code">
      ${unsafeHTML(marked(this.config.source))}
    </div>`;
  }
}
