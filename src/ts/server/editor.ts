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
import {LiveEditor, LiveEditorSelectiveEditorConfig} from '../editor/editor';
import {LiveEditorApiComponent, PingStatus} from '../editor/api';
import {LocalServerApi, ServerApiComponent} from './api';

import {AsideField} from '../editor/field/aside';
import {EditorState} from '../editor/state';
import {ExampleFieldField} from '../example/field/exampleField';
import {GCSRemoteMedia} from '../remoteMedia/GCSRemoteMedia';
import {GithubApi} from './gh/githubApi';
import {HtmlField} from '../editor/field/html';
import {MarkdownField} from '../editor/field/markdown';
import {MediaField} from '../editor/field/media';
import {MediaListField} from '../editor/field/mediaList';
import {RemoteMediaConstructor} from '../remoteMedia';
import StackdriverErrorReporter from 'stackdriver-errors-js';
import {rafTimeout} from '../utility/rafTimeout';

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
let initialFile: string | undefined = undefined;
let api: (LiveEditorApiComponent & ServerApiComponent) | null = null;
if (isLocal) {
  const urlParts = window.location.pathname
    .split('/')
    .filter(value => value.length) // Do not need empty items.
    .slice(1); // Remove the 'local' portion of url.

  if (urlParts.length) {
    initialFile = `/${urlParts.join('/')}`;
  }

  api = new LocalServerApi(localPort);
} else {
  const service = container.dataset.service;
  let organization: string | undefined = undefined;
  let project: string | undefined = undefined;
  let branch: string | undefined = undefined;
  const urlParts = window.location.pathname
    .split('/')
    .filter(value => value.length) // Do not need empty items.
    .slice(1); // Remove the 'service' portion of url.

  if (urlParts.length >= 1) {
    organization = urlParts[0];
  }
  if (urlParts.length >= 2) {
    project = urlParts[1];
  }
  if (urlParts.length >= 3) {
    branch = urlParts[2];
  }
  if (urlParts.length >= 4) {
    initialFile = `/${urlParts.slice(3).join('/')}`;
  }

  const isUnstable = window.location.hostname.includes('beta');
  const isDev = container.dataset.mode === 'dev';

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

  if (!service || !organization || !project || !branch) {
    throw new Error(
      'Missing service, organization, project, or branch information.'
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

// Add the remote media providers.
api.remoteMediaProviders.push(
  GCSRemoteMedia as unknown as RemoteMediaConstructor
);

const state = new EditorState(api);
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
  list: ListField as unknown as FieldConstructor,
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

const selectiveConfig = {
  fieldTypes: fieldTypes,
  ruleTypes: {
    length: LengthRule as unknown as RuleConstructor,
    match: MatchRule as unknown as RuleConstructor,
    pattern: PatternRule as unknown as RuleConstructor,
    range: RangeRule as unknown as RuleConstructor,
    require: RequireRule as unknown as RuleConstructor,
  },
  global: {
    api: api,
    labels: {},
    state: state,
  },
};

const startEditor = (
  api: LiveEditorApiComponent,
  selectiveConfig: LiveEditorSelectiveEditorConfig,
  state: EditorState
): LiveEditor => {
  const editor = new LiveEditor(
    {
      api: api,
      selectiveConfig: selectiveConfig,
      state: state,
    },
    container as HTMLElement
  );

  // Check for initial file to load.
  if (initialFile) {
    editor.state.getFile({
      path: initialFile || '',
    });
  }

  return editor;
};

let editor: LiveEditor | undefined = undefined;

if (isLocal) {
  // Test the local api to make sure that it is available before
  // we start rendering the editor. Otherwise show instructions for
  // starting the local server.
  const pingApi = () => {
    (api as LocalServerApi)
      .ping()
      .then(pingResponse => {
        if (pingResponse.status === PingStatus.Ok) {
          editor = startEditor(
            api as LiveEditorApiComponent,
            selectiveConfig,
            state
          );
          editor.render();
        } else {
          console.error('Ping response not expected: ', pingResponse);
        }
      })
      .catch(err => {
        console.error('Unable to ping the api.', err);
        try {
          rafTimeout(pingApi, 2500);
        } catch (err) {
          // Ignore error.
        }
      });
  };

  try {
    pingApi();
  } catch (err) {
    // Ignore error
  }
} else {
  editor = startEditor(api as LiveEditorApiComponent, selectiveConfig, state);
  editor.render();
}