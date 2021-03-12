import {
  CheckboxField,
  CheckboxMultiField,
  ColorField,
  DateField,
  DatetimeField,
  FieldConstructor,
  GroupField,
  LengthRule,
  ListField,
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
import {AsideField} from '../editor/field/aside';
import {EVENT_RENDER} from '../editor/events';
import {EditorState} from '../editor/state';
import {ExampleFieldField} from '../example/field/exampleField';
import {LiveEditor} from '../editor/editor';
import {LiveEditorApiComponent} from '../editor/api';
import {LocalServerApi} from './api';
import {MediaField} from '../editor/field/media';
import {MediaListField} from '../editor/field/mediaList';
import {EVENT_RENDER as SELECTIVE_EVENT_RENDER} from '@blinkk/selective-edit/dist/src/selective/events';

const container = document.querySelector('.container') as HTMLElement;

const localPort = parseInt(container.dataset.port || '');
const isLocal = localPort > 0;

let api: LiveEditorApiComponent | null = null;
if (isLocal) {
  api = new LocalServerApi(localPort);
}

if (!api) {
  throw new Error('Unable to determine api to load.');
}

const state = new EditorState(api);
const fieldTypes = {
  aside: (AsideField as unknown) as FieldConstructor,
  checkbox: (CheckboxField as unknown) as FieldConstructor,
  checkboxMulti: (CheckboxMultiField as unknown) as FieldConstructor,
  color: (ColorField as unknown) as FieldConstructor,
  date: (DateField as unknown) as FieldConstructor,
  datetime: (DatetimeField as unknown) as FieldConstructor,
  exampleField: (ExampleFieldField as unknown) as FieldConstructor,
  group: (GroupField as unknown) as FieldConstructor,
  list: (ListField as unknown) as FieldConstructor,
  media: (MediaField as unknown) as FieldConstructor,
  mediaList: (MediaListField as unknown) as FieldConstructor,
  number: (NumberField as unknown) as FieldConstructor,
  radio: (RadioField as unknown) as FieldConstructor,
  text: (TextField as unknown) as FieldConstructor,
  textarea: (TextareaField as unknown) as FieldConstructor,
  time: (TimeField as unknown) as FieldConstructor,
  variant: (VariantField as unknown) as FieldConstructor,
};

const selectiveConfig = {
  fieldTypes: fieldTypes,
  ruleTypes: {
    length: (LengthRule as unknown) as RuleConstructor,
    match: (MatchRule as unknown) as RuleConstructor,
    pattern: (PatternRule as unknown) as RuleConstructor,
    range: (RangeRule as unknown) as RuleConstructor,
    require: (RequireRule as unknown) as RuleConstructor,
  },
  global: {
    api: api,
    labels: {},
    state: state,
  },
};

const editor = new LiveEditor(
  {
    api: api,
    selectiveConfig: selectiveConfig,
    state: state,
  },
  container as HTMLElement
);

// TODO: Determine which fields to load based on api call.
// TODO: Reload the fields with an updated config. ex: grow fields.

// Bind to the custom event to re-render the editor.
document.addEventListener(EVENT_RENDER, () => {
  editor.render();
});

// Bind to the selective event for rendering as well.
document.addEventListener(SELECTIVE_EVENT_RENDER, () => {
  editor.render();
});

editor.render();
