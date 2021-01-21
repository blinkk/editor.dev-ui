import {TemplateResult, html, render} from 'lit-html';
import {ContentPart} from './parts/content';
import {EVENT_RENDER_COMPLETE} from './events';
import {FieldConstructor} from '@blinkk/selective-edit/dist/src/selective/field';
import {LiveEditorApiComponent} from './api';
import {MenuPart} from './parts/menu';
import {ModalsPart} from './parts/modals';
import {OverviewPart} from './parts/overview';
import {PreviewPart} from './parts/preview';
import {RuleConstructor} from '@blinkk/selective-edit/dist/src/selective/validationRules';
import {Storage} from '../utility/storage';
import {expandClasses} from '@blinkk/selective-edit/dist/src/utility/dom';

export interface SelectiveConfig {
  fieldTypes?: Record<string, FieldConstructor>;
  ruleTypes?: Record<string, RuleConstructor>;
}

export interface LiveEditorConfig {
  api: LiveEditorApiComponent;
  selectiveConfig: SelectiveConfig;
  isTest?: boolean;
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
  storage: Storage;

  constructor(config: LiveEditorConfig, container: HTMLElement) {
    this.config = config;
    this.container = container;
    this.isRendering = false;
    this.isPendingRender = false;
    this.storage = new Storage(Boolean(this.config.isTest));
    this.parts = {
      content: new ContentPart(),
      menu: new MenuPart({
        api: this.config.api,
        storage: this.storage,
      }),
      modals: new ModalsPart(),
      overview: new OverviewPart({
        api: this.config.api,
      }),
      preview: new PreviewPart(),
    };
  }

  classesForEditor(): Array<string> {
    const classes: Array<string> = ['le'];

    // When menu is docked, change to three panes.
    if (this.parts.menu.isDocked) {
      classes.push('le--docked-menu');
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
      <div class="le__structure__content">
        <div class="le__structure__content_header">
          ${this.parts.overview.template(editor)}
        </div>
        <div class="le__structure__content_panes">
          ${this.parts.content.template(editor)}
          ${this.parts.preview.template(editor)}
        </div>
      </div>
      ${this.parts.modals.template(editor)}
    </div>`;
  }
}
