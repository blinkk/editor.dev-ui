import {TemplateResult, html, render} from 'lit-html';
import {ContentPart} from './parts/content';
import {EVENT_RENDER_COMPLETE} from './events';
import {FieldConstructor} from '@blinkk/selective-edit/dist/src/selective/field';
import {MenuPart} from './parts/menu';
import {ModalsPart} from './parts/modals';
import {OverviewPart} from './parts/overview';
import {Part} from './parts';
import {PreviewPart} from './parts/preview';
import {RuleConstructor} from '@blinkk/selective-edit/dist/src/selective/validationRules';
import {expandClasses} from '@blinkk/selective-edit/dist/src/utility/dom';

export interface SelectiveConfig {
  fieldTypes?: Record<string, FieldConstructor>;
  ruleTypes?: Record<string, RuleConstructor>;
}

export interface LiveEditorConfig {
  selectiveConfig: SelectiveConfig;
}

export class LiveEditor {
  config: LiveEditorConfig;
  container: HTMLElement;
  isPendingRender: boolean;
  isRendering: boolean;
  parts: Record<string, Part>;

  constructor(config: LiveEditorConfig, container: HTMLElement) {
    this.config = config;
    this.container = container;
    this.isRendering = false;
    this.isPendingRender = false;
    this.parts = {
      content: new ContentPart(),
      menu: new MenuPart(),
      modals: new ModalsPart(),
      overview: new OverviewPart(),
      preview: new PreviewPart(),
    };
  }

  classesForEditor(): Array<string> {
    const classes: Array<string> = ['live_editor'];

    // TODO: Add class based on number of panes to show.
    // Ex: two_panes or three_panes if menu is expanded.

    return classes;
  }

  render() {
    if (this.isRendering) {
      this.isPendingRender = true;
      return;
    }
    this.isPendingRender = false;
    this.isRendering = true;

    render(this.template(this), this.container);

    this.isRendering = false;
    document.dispatchEvent(new CustomEvent(EVENT_RENDER_COMPLETE));

    if (this.isPendingRender) {
      this.render();
    }
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForEditor())}>
      <div class="live_editor__header">
        ${this.parts.overview.template(editor)}
      </div>
      <div class="live_editor__panes">
        ${this.parts.menu.template(editor)}
        ${this.parts.content.template(editor)}
        ${this.parts.preview.template(editor)}
      </div>
      ${this.parts.modals.template(editor)}
    </div>`;
  }
}
