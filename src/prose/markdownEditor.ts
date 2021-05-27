import {baseKeymap, toggleMark, wrapIn} from 'prosemirror-commands';
import {history, redo, undo} from 'prosemirror-history';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {keymap} from 'prosemirror-keymap';
import {menuPlugin} from './menu';
import {schema} from 'prosemirror-schema-basic';

export class MarkdownEditor {
  container: HTMLElement;
  state: EditorState;
  view: EditorView;

  constructor(container: HTMLElement) {
    this.container = container;

    const menu = menuPlugin([
      {
        command: toggleMark(schema.marks.strong),
        dom: icon('format_bold', 'strong'),
      },
      {command: toggleMark(schema.marks.em), dom: icon('format_italic', 'em')},
      {
        command: wrapIn(schema.nodes.blockquote),
        dom: icon('format_indent_increase', 'blockquote'),
      },
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
  span.className = 'material-icons';
  span.title = name;
  span.textContent = text;
  return span;
}
