import {
  EditorNotification,
  readNotification,
  showNotification,
} from './parts/notifications';
import {
  TemplateResult,
  classMap,
  findParentByClassname,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {UiPartComponent, UiPartConfig} from './parts';

import {BaseUI} from './index';
import {ListenersMixin} from '../../mixin/listeners';
import {UuidMixin} from '@blinkk/selective-edit/dist/mixins/uuid';

export interface ToastConfig extends UiPartConfig {
  classes?: Array<string>;
  notification: EditorNotification;
  noAutoClose?: boolean;
  noPauseOnFocusLoss?: boolean;
  noPauseOnHover?: boolean;
}

export class Toast
  extends ListenersMixin(UuidMixin(BaseUI))
  implements UiPartComponent
{
  config: ToastConfig;
  element?: HTMLElement;
  isClosed: boolean;
  isPaused: boolean;
  isVisible: boolean;

  constructor(config: ToastConfig) {
    super();
    this.config = config;
    this.isClosed = false;
    this.isPaused = false;
    this.isVisible = false;

    if (!this.config.noPauseOnFocusLoss) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.isPaused = false;
        } else {
          this.isPaused = true;
          // The render does not always work when the tab is not in focus.
          // Need to manually add the class to make sure that it is correctly
          // paused when the tab is not in focus.
          if (this.element) {
            this.element.classList.add('le__toast--paused');
          }
        }
        this.render();
      });
    }
  }

  classesForToast(): Record<string, boolean> {
    const classes: Record<string, boolean> = {
      le__clickable: true,
      le__toast: true,
      'le__toast--no-hover-pause': this.config.noPauseOnHover || false,
      'le__toast--paused': this.isPaused,
      'le__toast--removed': this.isClosed,
    };

    if (this.config.classes) {
      for (const classname of this.config.classes) {
        classes[classname] = true;
      }
    }

    return classes;
  }

  handleToastClick(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();
    showNotification(this.config.notification);
    this.hide();
  }

  handleAnimationStart(evt: Event) {
    this.element =
      findParentByClassname(evt.target as HTMLElement, 'le__toast') ||
      undefined;
  }

  hide() {
    this.isClosed = true;
    this.triggerListener('hide');
    // Give time for the animations to complete before completely removing.
    window.setTimeout(() => {
      this.isVisible = false;
    }, 5000);
    this.render();
  }

  show() {
    this.isClosed = false;
    this.isVisible = true;
    this.triggerListener('show');
    this.render();
  }

  template(): TemplateResult {
    if (!this.isVisible) {
      return html``;
    }

    return html`<div
      class=${classMap(this.classesForToast())}
      @click=${this.handleToastClick.bind(this)}
    >
      <div class="le__toast__structure">
        <div class="le__toast__message">
          ${this.config.notification.message}
        </div>
        <div class="le__toast__actions">
          ${repeat(
            this.config.notification.actions || [],
            action => action.label,
            action => {
              const handleClick = (evt: Event) => {
                evt.preventDefault();
                evt.stopPropagation();
                document.dispatchEvent(
                  new CustomEvent(action.customEvent, {
                    detail: action.details,
                  })
                );

                this.hide();
                readNotification(this.config.notification);
              };

              return html`<div
                class="le__toast__action le__clickable"
                @click=${handleClick}
              >
                ${action.label}
              </div>`;
            }
          )}
        </div>
        <div
          class="le__toast__close le__clickable"
          @click=${(evt: Event) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.hide();
            readNotification(this.config.notification);
          }}
        >
          <span class="material-icons">close</span>
        </div>
      </div>
      ${this.config.noAutoClose
        ? html``
        : html`<div
            class="le__toast__timer"
            @animationend=${() => {
              this.hide();
            }}
            @animationstart=${this.handleAnimationStart.bind(this)}
          ></div>`}
    </div>`;
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}
