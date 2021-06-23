import {TemplateResult, html, render} from '@blinkk/selective-edit';

const COPIED_CLASS = 'local__instruction__command--copied';
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
    let inputTimeout: undefined | number = undefined;

    const handleCommandClick = (evt: Event) => {
      // Clean any existing input timeout.
      if (inputTimeout) {
        window.clearTimeout(inputTimeout);
      }

      const target = evt.target as HTMLInputElement;
      if (target) {
        target.select();
        document.execCommand('copy');

        const inputContainer = target.parentElement;
        inputContainer?.classList.add(COPIED_CLASS);

        inputTimeout = window.setTimeout(() => {
          inputContainer?.classList.remove(COPIED_CLASS);
        }, 10000);
      }
    };

    return html`<div class="le">
      <div class="le__local">
        <h2>Local editor not found</h2>
        <p>To use the editor with a local project run the following command in the main directory of your local project:</p>
        <p><pre><code><span class="le__local__version"># Requires <a href="https://nodejs.org/" target="_blank">Node.js</a> &gt;= 14</span>
<div class="le__local__command__input"><input class="le__local__command" readonly @click=${handleCommandClick} value="npx @blinkk/editor.dev${
      this.isNonDefaultPort ? ` --port ${this.options?.port}` : ''
    }" /></div></code></pre></p>
      </div>
    </div>`;
  }
}
