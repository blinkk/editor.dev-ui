import {
  TemplateResult,
  classMap,
  html,
  render,
  repeat,
} from '@blinkk/selective-edit';

import {EVENT_RENDER_COMPLETE} from '../editor/events';
import cloneDeep from 'lodash.clonedeep';

const SOURCE_EDITOR = 'editor';
const SOURCE_PREVIEW = 'preview';

interface LogData {
  source: string;
  details?: any[];
}

class PreviewConnector {
  container: HTMLElement;
  editorWindow: Window;
  hasBoundPartials: boolean = false;
  hasPartials: boolean = false;
  hoveredPartial?: number;
  logs: Array<LogData> = [];
  observer: IntersectionObserver;
  visiblePartials: Array<number> = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.editorWindow = window.parent;

    // Listen for communication from the editor.
    window.addEventListener('message', event => {
      // All communication from the editor should is done using an 'event'.
      if (!event.data?.event) {
        return;
      }

      // If the editor indicates it has partials, then we can show them.
      if (event.data.event === 'partial') {
        this.hasPartials = true;
      }

      // If the editor indicates it has partials, then we can show them.
      if (event.data.event === 'partialHoverOn') {
        this.hoveredPartial = event.data.details.index;
      }

      // If the editor indicates it has partials, then we can show them.
      if (event.data.event === 'partialHoverOff') {
        this.hoveredPartial = undefined;
      }

      this.log(SOURCE_EDITOR, event.data);
    });

    // Send connction message to let editor know that the preview is ready.
    this.send({event: 'connect'});

    // Create intersection observer for partial inview events.
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.1],
    };

    // Update the visible partials when the observer detects a change.
    this.observer = new IntersectionObserver(entries => {
      const originalVisiblePartials = JSON.stringify(this.visiblePartials);

      for (const entry of entries) {
        const index = parseInt(
          (entry.target as HTMLElement).dataset.partial || '-1'
        );
        if (entry.isIntersecting) {
          // If the partial is already visible, do nothing.
          if (this.visiblePartials.includes(index)) {
            continue;
          }
          this.visiblePartials.push(index);
        } else {
          this.visiblePartials = this.visiblePartials.filter(
            value =>
              value !==
              parseInt((entry.target as HTMLElement).dataset.partial || '-1')
          );
        }
      }

      this.visiblePartials.sort();

      const currentVisiblePartials = JSON.stringify(this.visiblePartials);

      // No changes to the visible partials, do nothing.
      if (originalVisiblePartials === currentVisiblePartials) {
        return;
      }

      this.send({
        event: 'partialVisible',
        details: {
          indexes: this.visiblePartials,
        },
      });
    }, options);
  }

  /**
   * Utility for logging from the preview to be able to easily distinguish
   * from the normal app logging.
   *
   * @param args Pass arguments to the console log.
   */
  log(source: string, ...args: any[]) {
    console.log(`[from:${source}]`, ...args);
    this.logs.unshift({
      source: source,
      details: cloneDeep(args),
    });
    this.render();
  }

  render() {
    render(this.template, this.container);
    document.dispatchEvent(new CustomEvent(EVENT_RENDER_COMPLETE));
  }

  send(message: any) {
    this.editorWindow.postMessage(message, '*');
    this.log(SOURCE_PREVIEW, message);
  }

  get template(): TemplateResult {
    if (!this.hasPartials) {
      return html``;
    }

    return html`<div class="preview">
        <p class="details">
          The editor and preview can communicate via
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage"
            target="_blank"
            ><code>postMessage</code></a
          >
          and allows for advanced integration. The example shows some of the
          possibile usage that the communication can enable.

          <!-- TODO: Link to documentation on what events are supported. -->
        </p>

        ${this.templatePartials()}
      </div>
      ${this.templateLog()}`;
  }

  templatePartials(): TemplateResult {
    if (!this.hasBoundPartials) {
      this.hasBoundPartials = true;

      // Add partial inview observing.
      document.addEventListener(
        EVENT_RENDER_COMPLETE,
        () => {
          const partials = document.querySelectorAll('.partial');
          partials.forEach(partial => {
            this.observer.observe(partial);
          });
        },
        {
          once: true,
        }
      );
    }

    return html`<div class="communication__partials">
      <div class="partials">
        ${repeat(
          [0, 1, 2, 3, 4, 5],
          partial => html`<div
            class=${classMap({
              partial: true,
              'partial--hovered': this.hoveredPartial === partial,
            })}
            data-partial="${partial}"
            @mouseenter=${() => {
              this.send({
                event: 'partialHoverOn',
                details: {index: partial},
              });
            }}
            @mouseleave=${() => {
              this.send({
                event: 'partialHoverOff',
                details: {index: partial},
              });
            }}
          >
            Example partial ${partial + 1}
            <span
              class="partial__edit"
              @click=${() => {
                this.send({
                  event: 'partialEdit',
                  details: {index: partial},
                });
              }}
            >
              (Edit)
            </span>
          </div>`
        )}
      </div>
    </div>`;
  }

  templateLog(): TemplateResult {
    return html`<div class="communication__log">
      <h3>Communication log: (newest shown first)</h3>
      <div class="communication__log__items">
        ${repeat(
          this.logs,
          log => html` <div class="communication__log__item__source">
              ${log.source}
            </div>
            ${repeat(
              log.details || [],
              detail =>
                html`<div class="communication__log__item__event">
                    ${detail.event ?? ''}
                  </div>
                  <div class="communication__log__item__details">
                    ${detail.details ? JSON.stringify(detail.details) : ''}
                  </div>`
            )}`
        )}
      </div>
    </div>`;
  }
}

const connectionContainer = document.querySelector('.connection');

if (!connectionContainer) {
  throw new Error('connection container not found for preview logs');
}

const connector = new PreviewConnector(connectionContainer as HTMLElement);

connector.render();
