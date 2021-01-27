import {
  TemplateResult,
  findParentByClassname,
  html,
  render,
  repeat,
} from '@blinkk/selective-edit';
import {ExampleApi} from './exampleApi';

export class ExampleTool {
  api: ExampleApi;
  container: HTMLElement;
  isExpanded?: boolean;

  constructor(api: ExampleApi, container: HTMLElement) {
    this.api = api;
    this.container = container;

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
      class="example_tool__float_button le__clickable"
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
