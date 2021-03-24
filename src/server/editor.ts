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
import {GithubApi} from './gh/githubApi';
import {LiveEditor} from '../editor/editor';
import {LiveEditorApiComponent} from '../editor/api';
import {LocalServerApi} from './api';
import {MediaField} from '../editor/field/media';
import {MediaListField} from '../editor/field/mediaList';
import {EVENT_RENDER as SELECTIVE_EVENT_RENDER} from '@blinkk/selective-edit/dist/src/selective/events';
import StackdriverErrorReporter from 'stackdriver-errors-js';

const projectId = document.body.dataset.projectId;

// Check for configured stackdriver error reporting.
const stackdriverKey = document.body.dataset.stackdriverKey;
if (stackdriverKey) {
  const errorHandler = new StackdriverErrorReporter();
  errorHandler.start({
    projectId: projectId,
    key: stackdriverKey,
    service: 'editor.dev',
  });
}

const container = document.querySelector('.container') as HTMLElement;
const localPort = parseInt(container.dataset.port || '');
const isLocal = localPort > 0;
let api: LiveEditorApiComponent | null = null;
if (isLocal) {
  api = new LocalServerApi(localPort);
} else {
  const service = container.dataset.service;
  const organization = container.dataset.organization;
  const project = container.dataset.project;
  const branch = container.dataset.branch;
  const isUnstable = window.location.hostname.includes('beta');
  const isDev = container.dataset.mode === 'dev';

  if (!service || !organization || !project || !branch) {
    throw new Error(
      'Missing service, organization, project, or branch information.'
    );
  }

  if (service === 'gh') {
    api = new GithubApi(
      service,
      organization,
      project,
      branch,
      isUnstable,
      isDev
    );
  }
}

if (!api) {
  throw new Error('Unable to determine api to load.');
}

// Stop the normal editor processing if the check auth fails.
// The api should have set a location redirect, so just stop JS.
if (!api.checkAuth()) {
  throw new Error('Unable to verify authentication.');
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

// Check for url path to load.
if (container.dataset.file) {
  editor.state.getFile({
    path: container.dataset.file || '',
  });
}

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
