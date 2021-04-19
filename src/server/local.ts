import {TemplateResult, html, render} from '@blinkk/selective-edit';

export class LocalStatus {
  container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
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
        <p><pre><code>npx @blinkk/editor.dev</code></pre></p>
      </div>
    </div>`;
  }
}
