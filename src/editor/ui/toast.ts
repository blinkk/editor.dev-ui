import {
  EditorNotification,
  readNotification,
  showNotification,
} from '../parts/notifications';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';
import {BaseUI} from '.';
import {ListenersMixin} from '../../mixin/listeners';
import {LiveEditor} from '../editor';
import {UuidMixin} from '@blinkk/selective-edit/dist/src/mixins/uuid';

export interface ToastConfig {
  classes?: Array<string>;
  notification: EditorNotification;
  noPauseOnFocusLoss?: boolean;
  noPauseOnHover?: boolean;
}

export class Toast extends ListenersMixin(UuidMixin(BaseUI)) {
  config: ToastConfig;
  isClosed: boolean;
  isVisible: boolean;

  constructor(config: ToastConfig) {
    super();
    this.config = config;
    this.isClosed = false;
    this.isVisible = false;
  }

  classesForToast(): Record<string, boolean> {
    const classes: Record<string, boolean> = {
      le__clickable: true,
      le__toast: true,
      'le__toast--removed': this.isClosed,
    };

    if (this.config.classes) {
      for (const classname of this.config.classes) {
        classes[classname] = true;
      }
    }

    return classes;
  }

  handleNotificationClick(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();
    showNotification(this.config.notification);
    this.hide();
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  template(editor: LiveEditor): TemplateResult {
    if (!this.isVisible) {
      return html``;
    }

    return html`<div
      class=${classMap(this.classesForToast())}
      @click=${this.handleNotificationClick.bind(this)}
    >
      <div class="le__toast__message">${this.config.notification.message}</div>
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
