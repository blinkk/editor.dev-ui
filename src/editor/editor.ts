import {TemplateResult, html} from 'lit-html';
import {Base} from '@blinkk/selective-edit/dist/src/mixins';
import {DataMixin} from '@blinkk/selective-edit/dist/src/mixins/data';

export interface LiveEditorConfig {}

export class LiveEditor extends DataMixin(Base) {
  config: LiveEditorConfig;
  container: HTMLElement;

  constructor(config: LiveEditorConfig, container: HTMLElement) {
    super();
    this.config = config;
    this.container = container;
  }

  template(editor: LiveEditor): TemplateResult {
    return html`${editor.config}`;
  }
}
