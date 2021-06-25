import {Constructor} from '@blinkk/selective-edit/dist/mixins';

export interface ListenersMixinComponent {
  addListener(eventName: string, callback: (...args: any) => void): void;
  listeners: Record<string, Array<(...args: any) => void>>;
  triggerListener(eventName: string, ...args: any): void;
}

export function ListenersMixin<TBase extends Constructor>(Base: TBase) {
  return class ListenersClass extends Base implements ListenersMixinComponent {
    _listeners?: Record<string, Array<(...args: any) => void>>;

    /**
     * Add a new event listener for watching for events to happen.
     *
     * @param eventName Event name for the listener.
     * @param callback Callback to know when the listener triggers.
     */
    addListener(eventName: string, callback: (...args: any) => void) {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName].push(callback);
    }

    get listeners(): Record<string, Array<(...args: any) => void>> {
      if (!this._listeners) {
        this._listeners = {};
      }
      return this._listeners;
    }

    /**
     * Trigger the listener callbacks for a given event.
     *
     * @param eventName Event name to trigger.
     */
    triggerListener(eventName: string, ...args: any) {
      if (this.listeners[eventName]) {
        for (const listener of this.listeners[eventName]) {
          listener(...args);
        }
      }
    }
  };
}
