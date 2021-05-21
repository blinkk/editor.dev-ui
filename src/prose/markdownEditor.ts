import {EditorState, Plugin} from 'prosemirror-state';
import {
  baseKeymap,
  setBlockType,
  toggleMark,
  wrapIn,
} from 'prosemirror-commands';
import {history, redo, undo} from 'prosemirror-history';
import {EditorView} from 'prosemirror-view';
import {keymap} from 'prosemirror-keymap';
import {schema} from 'prosemirror-schema-basic';

export class MarkdownEditor {
  container: HTMLElement;
  state: EditorState;
  view: EditorView;

  constructor(container: HTMLElement) {
    this.container = container;

    const menu = menuPlugin([
      {command: toggleMark(schema.marks.strong), dom: icon('B', 'strong')},
      {command: toggleMark(schema.marks.em), dom: icon('i', 'em')},
      {
        command: setBlockType(schema.nodes.paragraph),
        dom: icon('p', 'paragraph'),
      },
      heading(1),
      heading(2),
      heading(3),
      {command: wrapIn(schema.nodes.blockquote), dom: icon('>', 'blockquote')},
    ]);

    const state = EditorState.create({
      schema,
      plugins: [
        menu,
        history(),
        keymap({'Mod-z': undo, 'Mod-y': redo}),
        keymap(baseKeymap),
      ],
    });
    this.state = state;
    this.view = new EditorView(this.container, {state});
  }
}

// Helper function to create menu icons
function icon(text: string, name: string) {
  const span = document.createElement('span');
  span.className = 'menuicon ' + name;
  span.title = name;
  span.textContent = text;
  return span;
}

// Create an icon for a heading at the given level
function heading(level: number) {
  return {
    command: setBlockType(schema.nodes.heading, {level}),
    dom: icon(`H${level}`, 'heading'),
  };
}

function menuPlugin(items: Array<any>) {
  return new Plugin({
    view(editorView) {
      const menuView = new MenuView(items, editorView);
      editorView.dom.parentNode?.insertBefore(menuView.dom, editorView.dom);
      return menuView;
    },
  });
}

class MenuView {
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
