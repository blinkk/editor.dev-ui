import {TemplateResult, html, render} from 'lit-html';
import {ContentPart} from './parts/content';
import {EVENT_RENDER_COMPLETE} from './events';
import {FieldConstructor} from '@blinkk/selective-edit/dist/src/selective/field';
import {MenuPart} from './parts/menu';
import {ModalsPart} from './parts/modals';
import {OverviewPart} from './parts/overview';
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

export interface LiveEditorParts {
  content: ContentPart;
  menu: MenuPart;
  modals: ModalsPart;
  overview: OverviewPart;
  preview: PreviewPart;
}

export class LiveEditor {
  config: LiveEditorConfig;
  container: HTMLElement;
  isPendingRender: boolean;
  isRendering: boolean;
  parts: LiveEditorParts;

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

    // When menu is docked, change to three panes.
    if (this.parts.menu.isDocked) {
      classes.push('live_editor--docked-menu');
    }

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
      ${this.parts.menu.template(editor)}
      <div class="live_editor__structure__content">
        <div class="live_editor__structure__content_header">
          ${this.parts.overview.template(editor)}
        </div>
        <div class="live_editor__structure__content_panes">
          ${this.parts.content.template(editor)}
          ${this.parts.preview.template(editor)}
        </div>
      </div>
      ${this.parts.modals.template(editor)}
    </div>`;
  }
}
