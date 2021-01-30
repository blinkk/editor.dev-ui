import {
  TemplateResult,
  findParentByClassname,
  html,
  render,
  repeat,
} from '@blinkk/selective-edit';
import {ExampleApi} from './exampleApi';
import {Storage} from '../utility/storage';

const STORAGE_EXAMPLE_ERROR_METHODS = 'example.api.error.methods';

export class ExampleTool {
  api: ExampleApi;
  container: HTMLElement;
  isExpanded?: boolean;
  storage: Storage;

  constructor(api: ExampleApi, storage: Storage, container: HTMLElement) {
    this.api = api;
    this.storage = storage;
    this.container = container;

    // Load any existing error methods.
    const errorMethods = this.storage.getItemArray(
      STORAGE_EXAMPLE_ERROR_METHODS
    );
    for (const errorMethod of errorMethods) {
      this.api.errorController.makeError(errorMethod);
    }

    // Auto close when clicking out of expanded list.
    document.addEventListener('click', (evt: Event) => {
      if (!this.isExpanded) {
        return;
      }

      const exampleContent = findParentByClassname(
        evt.target as HTMLElement,
        'example_tool__api_response'
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
      STORAGE_EXAMPLE_ERROR_METHODS,
      Array.from(this.api.errorController.errorMethods) as Array<string>
    );
  }

  template(tool: ExampleTool): TemplateResult {
    return html`${this.templateFloatButton(tool)}
    ${this.templateApiResponse(tool)}`;
  }

  templateApiResponse(tool: ExampleTool): TemplateResult {
    if (!this.isExpanded) {
      return html``;
    }

    const apiMethods = getMethodsOfClass(this.api);

    return html`<div class="example_tool__api_response">
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
}

function getMethodsOfClass(obj: any): Array<string> {
  const methods = new Set();
  obj = Reflect.getPrototypeOf(obj);
  const keys = Reflect.ownKeys(obj);
  keys.forEach(k => {
    if (k !== 'constructor' && typeof obj[k] === 'function') {
      methods.add(k);
    }
  });
  return Array.from(methods) as Array<string>;
}
