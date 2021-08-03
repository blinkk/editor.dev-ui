import {ExampleApi, WorkspaceWorkflow} from './exampleApi';
import {STORAGE_SCHEME, Schemes} from '../editor/state';
import {
  TemplateResult,
  findParentByClassname,
  html,
  render,
  repeat,
} from '@blinkk/selective-edit';
import {DataStorage} from '../utility/dataStorage';
import {EVENT_RENDER_COMPLETE} from '../editor/events';

const STORAGE_ERROR_METHODS = 'example.api.error.methods';
const STORAGE_THEME = 'example.theme';
const STORAGE_WORKSPACE_WORKFLOW = 'example.workspace.workflow';

export class ExampleTool {
  api: ExampleApi;
  container: HTMLElement;
  isExpanded?: boolean;
  storage: DataStorage;
  workflow: WorkspaceWorkflow;

  constructor(api: ExampleApi, storage: DataStorage, container: HTMLElement) {
    this.api = api;
    this.storage = storage;
    this.container = container;

    // Load any existing error methods.
    const errorMethods = this.storage.getItemArray(STORAGE_ERROR_METHODS);
    for (const errorMethod of errorMethods) {
      this.api.errorController.makeError(errorMethod);
    }

    // Load any workflow.
    const workflowValue =
      this.storage.getItem(STORAGE_WORKSPACE_WORKFLOW) ||
      WorkspaceWorkflow.Success;
    this.workflow = workflowValue as WorkspaceWorkflow;
    this.api.workflow = this.workflow;

    // Update theme based on local storage value.
    const theme = this.storage.getItemRecord(STORAGE_THEME) as ThemeOption;
    if (theme.text && theme.background) {
      document.addEventListener(
        EVENT_RENDER_COMPLETE,
        () => {
          this.updateTheme(theme);
        },
        {
          once: true,
        }
      );
    }

    // Auto close when clicking out of expanded list.
    document.addEventListener('click', (evt: Event) => {
      if (!this.isExpanded) {
        return;
      }

      const exampleContent = findParentByClassname(
        evt.target as HTMLElement,
        'example_tool__container'
      );

      // Do not close when clicking on the modal content.
      if (exampleContent) {
        return;
      }

      this.isExpanded = false;
      this.render();
    });
  }

  handleToggle(evt: Event) {
    evt.stopPropagation();
    this.isExpanded = !this.isExpanded;
    this.render();
  }

  render() {
    render(this.template(), this.container);
  }

  storeErrorMethods() {
    this.storage.setItemArray(
      STORAGE_ERROR_METHODS,
      Array.from(this.api.errorController.errorMethods) as Array<string>
    );
  }

  template(): TemplateResult {
    return html`${this.templateFloatButton()} ${this.templateStructure()}`;
  }

  templateApiResponse(): TemplateResult {
    if (!this.isExpanded) {
      return html``;
    }

    const apiMethods = getMethodsOfClass(this.api);

    return html`<div class="example_tool__api_response">
      <h3>API Responses</h3>
      ${repeat(
        apiMethods,
        methodName => methodName,
        methodName => {
          const shouldError = this.api.errorController.shouldError(methodName);
          return html`<div
            class="example_tool__api_method ${shouldError
              ? 'example_tool__api_method--should-error'
              : ''} le__clickable"
            @click=${() => {
              this.api.errorController.toggleError(methodName);
              this.storeErrorMethods();
              this.render();
            }}
          >
            <span class="material-icons"
              >${shouldError ? 'error' : 'check_circle'}</span
            >
            ${methodName}
          </div>`;
        }
      )}
    </div>`;
  }

  templateFloatButton(): TemplateResult {
    return html`<div
      class="example_tool__float_button ${this.api.errorController.errorMethods
        .size > 0
        ? 'example_tool__float_button--should-error'
        : ''} le__clickable"
      @click=${this.handleToggle.bind(this)}
    >
      <span class="material-icons">bug_report</span>
    </div>`;
  }

  templateSettings(): TemplateResult {
    if (!this.isExpanded) {
      return html``;
    }

    let publishWorkflow = this.storage.getItem(STORAGE_WORKSPACE_WORKFLOW);

    const publishWorklowOptions = [
      {
        value: WorkspaceWorkflow.NoPublish,
        label: 'No publish',
      },
      {
        value: WorkspaceWorkflow.NoChanges,
        label: 'No changes to publish',
      },
      {
        value: WorkspaceWorkflow.Success,
        label: 'Success',
      },
      {
        value: WorkspaceWorkflow.SuccessNoFields,
        label: 'Success (No fields)',
      },
      {
        value: WorkspaceWorkflow.SuccessChangeWorkspace,
        label: 'Success (Different workspace)',
      },
      {
        value: WorkspaceWorkflow.Pending,
        label: 'Pending after publish',
      },
      {
        value: WorkspaceWorkflow.Failure,
        label: 'Failure after publish',
      },
    ];

    return html`<div class="example_tool__settings">
      <h3>Settings</h3>

      <h4>Publish Workflow</h4>

      ${repeat(
        publishWorklowOptions,
        option => option.value,
        (option: Record<string, any>) => {
          const handlePublishClick = () => {
            publishWorkflow = option.value;
            this.storage.setItem(STORAGE_WORKSPACE_WORKFLOW, option.value);
            window.location.reload();
          };

          return html`<div class="example_tool__setting">
            <label>
              <input
                type="radio"
                name="publishWorkflow"
                value="normal"
                ?checked=${publishWorkflow === option.value}
                @click=${handlePublishClick}
              />
              ${option.label}
            </label>
          </div>`;
        }
      )}
    </div>`;
  }

  templateStructure(): TemplateResult {
    if (!this.isExpanded) {
      return html``;
    }

    return html`<div class="example_tool__container">
      <div class="example_tool__column">${this.templateApiResponse()}</div>
      <div class="example_tool__column">
        ${this.templateSettings()} ${this.templateTheme()}
      </div>
    </div>`;
  }

  templateTheme(): TemplateResult {
    if (!this.isExpanded) {
      return html``;
    }

    let theme: ThemeOption = this.storage.getItemRecord(
      STORAGE_THEME
    ) as ThemeOption;

    let mode: string = this.storage.getItem(STORAGE_SCHEME) || '';

    const themeOptions = [
      {
        text: '',
        background: '',
        label: 'Default',
      } as ThemeOption,
      {
        text: 'dark',
        background: 'light',
        label: 'Dark text on light back',
      } as ThemeOption,
      {
        text: 'light',
        background: 'dark',
        label: 'Light text on dark back',
      } as ThemeOption,
    ];

    const modeOptions = [
      {
        value: Schemes.Light,
        label: 'Light Mode',
      },
      {
        value: Schemes.Dark,
        label: 'Dark Mode',
      },
    ];

    return html`<div class="example_tool__settings">
      <h3>Theme</h3>

      <h4>Light/Dark Mode</h4>

      ${repeat(
        modeOptions,
        option => option.value,
        option => {
          const handleClick = () => {
            mode = option.value;
            this.updateThemeMode(mode);
          };

          return html`<div class="example_tool__setting">
            <label>
              <input
                type="radio"
                name="scheme"
                ?checked=${mode === option.value}
                @click=${handleClick}
              />
              <span class="material-icons"
                >${`${option.value.toLowerCase()}_mode`}</span
              >
              ${option.label}
            </label>
          </div>`;
        }
      )}

      <h4>Colors</h4>

      ${repeat(
        themeOptions,
        option => option.label,
        option => {
          const handlePublishClick = () => {
            theme = option;
            this.updateTheme(option);
          };

          return html`<div class="example_tool__setting">
            <label>
              <input
                type="radio"
                name="theme"
                ?checked=${theme.label === option.label}
                @click=${handlePublishClick}
              />
              ${option.label}
            </label>
          </div>`;
        }
      )}
    </div>`;
  }

  updateTheme(theme: ThemeOption) {
    this.storage.setItemRecord(STORAGE_THEME, theme);
    const container = document.querySelector('.le') as HTMLElement;
    if (container) {
      container.dataset.text = theme.text;
      container.dataset.background = theme.background;
    }
  }

  updateThemeMode(mode: string) {
    this.storage.setItem(STORAGE_SCHEME, mode);
    const container = document.querySelector('.le') as HTMLElement;
    if (container) {
      container.classList.remove('scheme-light');
      container.classList.remove('scheme-dark');
      container.classList.add(`scheme-${mode.toLowerCase()}`);
    }
  }
}

interface ThemeOption {
  text: string;
  background: string;
  label: string;
}

function getMethodsOfClass(obj: any): Array<string> {
  const methods = new Set();
  obj = Reflect.getPrototypeOf(obj);
  const keys = Reflect.ownKeys(obj);
  keys.forEach(k => {
    if (
      k !== 'constructor' &&
      typeof obj[k] === 'function' &&
      !k.toString().startsWith('_')
    ) {
      methods.add(k);
    }
  });
  return Array.from(methods) as Array<string>;
}
