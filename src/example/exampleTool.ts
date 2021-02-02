import {ExampleApi, WorkspaceWorkflow} from './exampleApi';
import {
  TemplateResult,
  findParentByClassname,
  html,
  render,
  repeat,
} from '@blinkk/selective-edit';
import {Storage} from '../utility/storage';

const STORAGE_ERROR_METHODS = 'example.api.error.methods';
const STORAGE_WORKSPACE_WORKFLOW = 'example.workspace.workflow';

export class ExampleTool {
  api: ExampleApi;
  container: HTMLElement;
  isExpanded?: boolean;
  storage: Storage;
  workflow: WorkspaceWorkflow;

  constructor(api: ExampleApi, storage: Storage, container: HTMLElement) {
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
    render(this.template(this), this.container);
  }

  storeErrorMethods() {
    this.storage.setItemArray(
      STORAGE_ERROR_METHODS,
      Array.from(this.api.errorController.errorMethods) as Array<string>
    );
  }

  template(tool: ExampleTool): TemplateResult {
    return html`${this.templateFloatButton(tool)}
    ${this.templateStructure(tool)}`;
  }

  templateApiResponse(tool: ExampleTool): TemplateResult {
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

  templateFloatButton(tool: ExampleTool): TemplateResult {
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

  templateSettings(tool: ExampleTool): TemplateResult {
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
        value: WorkspaceWorkflow.Success,
        label: 'Success',
      },
      {
        value: WorkspaceWorkflow.SuccessNoFields,
        label: 'Success (No fields)',
      },
      {
        value: WorkspaceWorkflow.NoChanges,
        label: 'No changes',
      },
      {
        value: WorkspaceWorkflow.Pending,
        label: 'Pending',
      },
      {
        value: WorkspaceWorkflow.Failure,
        label: 'Failure',
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

  templateStructure(tool: ExampleTool): TemplateResult {
    if (!this.isExpanded) {
      return html``;
    }

    return html`<div class="example_tool__container">
      ${this.templateApiResponse(tool)} ${this.templateSettings(tool)}
    </div>`;
  }
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
