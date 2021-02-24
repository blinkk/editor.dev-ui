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
  TextField,
  TextareaField,
  TimeField,
  VariantField,
} from '@blinkk/selective-edit';
import {AsideField} from '../editor/field/aside';
import {EVENT_RENDER} from '../editor/events';
import {EditorState} from '../editor/state';
import {ExampleApi} from './exampleApi';
import {ExampleFieldField} from './field/exampleField';
import {ExampleTool} from './exampleTool';
import {LiveEditor} from '../editor/editor';
import {MediaField} from '../editor/field/media';
import {RuleConstructor} from '@blinkk/selective-edit';
import {EVENT_RENDER as SELECTIVE_EVENT_RENDER} from '@blinkk/selective-edit/dist/src/selective/events';

const container = document.querySelector('.container');
const exampleApi = new ExampleApi();
const exampleState = new EditorState(exampleApi);
const exampleEditor = new LiveEditor(
  {
    api: exampleApi,
    selectiveConfig: {
      fieldTypes: {
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
        number: (NumberField as unknown) as FieldConstructor,
        radio: (RadioField as unknown) as FieldConstructor,
        text: (TextField as unknown) as FieldConstructor,
        textarea: (TextareaField as unknown) as FieldConstructor,
        time: (TimeField as unknown) as FieldConstructor,
        variant: (VariantField as unknown) as FieldConstructor,
      },
      ruleTypes: {
        length: (LengthRule as unknown) as RuleConstructor,
        match: (MatchRule as unknown) as RuleConstructor,
        pattern: (PatternRule as unknown) as RuleConstructor,
        range: (RangeRule as unknown) as RuleConstructor,
        require: (RequireRule as unknown) as RuleConstructor,
      },
      global: {
        api: exampleApi,
        labels: {},
        state: exampleState,
      },
    },
    state: exampleState,
  },
  container as HTMLElement
);

const url = new URL(window.location.toString());
if (url.searchParams.get('path')) {
  exampleEditor.state.getFile({
    path: url.searchParams.get('path') || '',
  });
}

// Bind to the custom event to re-render the editor.
document.addEventListener(EVENT_RENDER, () => {
  exampleEditor.render();
});

// Bind to the selective event for rendering as well.
document.addEventListener(SELECTIVE_EVENT_RENDER, () => {
  exampleEditor.render();
});

/**
 * Tool for working with the api through the UI.
 */
const toolContainer = document.querySelector('.example_tool');
const tool = new ExampleTool(
  exampleEditor.config.api as ExampleApi,
  exampleEditor.storage,
  toolContainer as HTMLElement
);
tool.render();

// Render the editor after the tool is created so that stored
// error states can be loaded before the editor calls them.
exampleEditor.render();
