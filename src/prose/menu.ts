import {EditorState, Plugin} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';

export interface PluginViewComponent {
  update?: (view: EditorView, prevState: EditorState) => void;
  destroy?: () => void;
}

export class MenuView implements PluginViewComponent {
  dom: HTMLElement;
  editorView: EditorView;
  items: Array<any>;

  constructor(items: Array<any>, editorView: EditorView) {
    this.items = items;
    this.editorView = editorView;

    this.dom = document.createElement('div');
    this.dom.className = 'menubar';
    items.forEach(({dom}) => this.dom.appendChild(dom));
    this.update();

    this.dom.addEventListener('mousedown', e => {
      e.preventDefault();
      editorView.focus();
      items.forEach(({command, dom}) => {
        if (dom.contains(e.target))
          command(editorView.state, editorView.dispatch, editorView);
      });
    });
  }

  update() {
    this.items.forEach(({command, dom}) => {
      const active = command(this.editorView.state, null, this.editorView);
      dom.style.display = active ? '' : 'none';
    });
  }

  destroy() {
    this.dom.remove();
  }
}

export function menuPlugin(items: Array<any>) {
  return new Plugin({
    view(editorView) {
      const menuView = new MenuView(items, editorView);
      editorView.dom.parentNode?.insertBefore(menuView.dom, editorView.dom);
      return menuView;
    },
  });
}
