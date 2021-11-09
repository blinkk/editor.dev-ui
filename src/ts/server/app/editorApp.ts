import {
  CheckboxField,
  CheckboxMultiField,
  ColorField,
  DateField,
  DatetimeField,
  FieldConstructor,
  GroupField,
  LengthRule,
  MatchRule,
  NumberField,
  PatternRule,
  RadioField,
  RangeRule,
  RequireRule,
  RuleConstructor,
  TextField,
  TextareaField,
  TimeField,
  VariantField,
} from '@blinkk/selective-edit';

import {AsideField} from '../../editor/field/aside';
import {EditorState} from '../../editor/state';
import {ExampleFieldField} from '../../example/field/exampleField';
import {HtmlField} from '../../editor/field/html';
import {LiveEditor} from '../../editor/editor';
import {LiveEditorApiComponent} from '../../editor/api';
import {MarkdownField} from '../../editor/field/markdown';
import {MediaField} from '../../editor/field/media';
import {MediaListField} from '../../editor/field/mediaList';
import {MenuListField} from '../../editor/field/menuList';
import {ServerApiComponent} from '../api';

export interface EditorAppComponent {
  api: LiveEditorApiComponent & ServerApiComponent;
  container: HTMLElement;
  editor: LiveEditor;
  /**
   * Initialize the application.
   *
   * This may be rendering a full editor interface or render information about
   * onboarding or other required details that it needs to render the editor.
   */
  init(): Promise<void>;
  initialFile?: string;
  isDev: boolean;
  isUnstable: boolean;
  options?: EditorAppOptions;
  state: EditorState;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorAppOptions {}

/**
 * Generic, default types used in the editor.
 */
const fieldTypes = {
  aside: AsideField as unknown as FieldConstructor,
  checkbox: CheckboxField as unknown as FieldConstructor,
  checkboxMulti: CheckboxMultiField as unknown as FieldConstructor,
  color: ColorField as unknown as FieldConstructor,
  date: DateField as unknown as FieldConstructor,
  datetime: DatetimeField as unknown as FieldConstructor,
  exampleField: ExampleFieldField as unknown as FieldConstructor,
  group: GroupField as unknown as FieldConstructor,
  html: HtmlField as unknown as FieldConstructor,
  list: MenuListField as unknown as FieldConstructor,
  markdown: MarkdownField as unknown as FieldConstructor,
  media: MediaField as unknown as FieldConstructor,
  mediaList: MediaListField as unknown as FieldConstructor,
  number: NumberField as unknown as FieldConstructor,
  radio: RadioField as unknown as FieldConstructor,
  text: TextField as unknown as FieldConstructor,
  textarea: TextareaField as unknown as FieldConstructor,
  time: TimeField as unknown as FieldConstructor,
  variant: VariantField as unknown as FieldConstructor,
};

const ruleTypes = {
  length: LengthRule as unknown as RuleConstructor,
  match: MatchRule as unknown as RuleConstructor,
  pattern: PatternRule as unknown as RuleConstructor,
  range: RangeRule as unknown as RuleConstructor,
  require: RequireRule as unknown as RuleConstructor,
};

export abstract class EditorApp implements EditorAppComponent {
  container: HTMLElement;
  initialFile?: string;
  isDev: boolean;
  isUnstable: boolean;
  options?: EditorAppOptions;
  protected _editor?: LiveEditor;
  protected _state: EditorState | null;

  constructor(container: HTMLElement, options?: EditorAppOptions) {
    this.container = container;
    this.options = options;
    this._state = null;

    this.isDev = container.dataset.mode === 'default';
    this.isUnstable = window.location.hostname.includes('beta');
  }

  abstract get api(): LiveEditorApiComponent & ServerApiComponent;

  get editor(): LiveEditor {
    if (this._editor) {
      return this._editor;
    }

    this._editor = new LiveEditor(
      {
        api: this.api,
        selectiveConfig: this.selectiveConfig,
        state: this.state,
      },
      this.container
    );

    // Check for initial file to load.
    if (this.initialFile) {
      this._editor.state.getFile({
        path: this.initialFile,
      });
    }

    return this._editor;
  }

  async init() {
    this.editor.render();
  }

  get selectiveConfig() {
    return {
      fieldTypes: fieldTypes,
      ruleTypes: ruleTypes,
      global: {
        api: this.api,
        labels: {},
        state: this.state,
      },
    };
  }

  get state(): EditorState {
    if (this._state) {
      return this._state;
    }
    this._state = new EditorState(this.api);

    return this._state;
  }
}
