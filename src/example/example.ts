import {
  FieldConstructor,
  GroupField,
  LengthRule,
  ListField,
  MatchRule,
  PatternRule,
  RangeRule,
  RequireRule,
  SelectField,
  TextField,
  TextareaField,
  VariantField,
} from '@blinkk/selective-edit';
import {EVENT_RENDER} from '../editor/events';
import {ExampleApi} from './exampleApi';
import {ExampleTool} from './exampleTool';
import {LiveEditor} from '../editor/editor';
import {RuleConstructor} from '@blinkk/selective-edit';
import {EVENT_RENDER as SELECTIVE_EVENT_RENDER} from '@blinkk/selective-edit/dist/src/selective/events';

const container = document.querySelector('.container');
const exampleEditor = new LiveEditor(
  {
    api: new ExampleApi(),
    selectiveConfig: {
      fieldTypes: {
        group: (GroupField as unknown) as FieldConstructor,
        list: (ListField as unknown) as FieldConstructor,
        select: (SelectField as unknown) as FieldConstructor,
        text: (TextField as unknown) as FieldConstructor,
        textarea: (TextareaField as unknown) as FieldConstructor,
        variant: (VariantField as unknown) as FieldConstructor,
      },
      ruleTypes: {
        length: (LengthRule as unknown) as RuleConstructor,
        match: (MatchRule as unknown) as RuleConstructor,
        pattern: (PatternRule as unknown) as RuleConstructor,
        range: (RangeRule as unknown) as RuleConstructor,
        require: (RequireRule as unknown) as RuleConstructor,
      },
    },
  },
  container as HTMLElement
);

exampleEditor.state.loadFile({
  path: '/content/pages/index.yaml',
});

exampleEditor.render();

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
  toolContainer as HTMLElement
);
tool.render();
