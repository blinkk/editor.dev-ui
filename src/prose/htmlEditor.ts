import {baseKeymap, toggleMark, wrapIn} from 'prosemirror-commands';
import {history, redo, undo} from 'prosemirror-history';
import {menuIcon, menuPlugin} from './menu';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {keymap} from 'prosemirror-keymap';
import {schema} from 'prosemirror-schema-basic';

export class HtmlEditor {
  container: HTMLElement;
  state: EditorState;
  view: EditorView;

  constructor(container: HTMLElement) {
    this.container = container;

    const menu = menuPlugin([
      {
        command: toggleMark(schema.marks.strong),
        dom: menuIcon('format_bold', 'strong'),
      },
      {
        command: toggleMark(schema.marks.em),
        dom: menuIcon('format_italic', 'em'),
      },
      {
        command: wrapIn(schema.nodes.blockquote),
        dom: menuIcon('format_indent_increase', 'blockquote'),
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
