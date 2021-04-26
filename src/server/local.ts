import {TemplateResult, html, render} from '@blinkk/selective-edit';

const DEFAULT_PORT = 9090;

export interface LocalStatusOptions {
  port: number;
}

export class LocalStatus {
  container: HTMLElement;
  options?: LocalStatusOptions;

  constructor(container: HTMLElement, options?: LocalStatusOptions) {
    this.container = container;
    this.options = options;
  }

  get isNonDefaultPort(): boolean {
    if (!this.options?.port) {
      return false;
    }
    return this.options.port !== DEFAULT_PORT;
  }

  render() {
    render(this.template(this), this.container);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  template(localStatus: LocalStatus): TemplateResult {
    return html`<div class="le">
      <div class="le__local">
        <h2>Local editor not found</h2>
        <p>To use the editor with a local project run the following command in the main directory of your local project:</p>
        <p><pre><code>npx @blinkk/editor.dev ${
          this.isNonDefaultPort ? `--port ${this.options?.port}` : ''
        }</code></pre></p>
      </div>
    </div>`;
  }
}
