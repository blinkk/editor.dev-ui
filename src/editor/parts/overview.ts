import {BasePart, Part} from '.';
import {TemplateResult, expandClasses, html} from '@blinkk/selective-edit';
import {EditorState} from '../state';
import {LiveEditor} from '../editor';

export interface OverviewPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
}

export class OverviewPart extends BasePart implements Part {
  config: OverviewPartConfig;

  constructor(config: OverviewPartConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Array<string> {
    return ['le__part__overview'];
  }

  loadProject() {
    this.config.state.getProject();
  }

  loadWorkspace() {
    this.config.state.getWorkspace();
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      ${this.templateMenu(editor)} ${this.templateProject(editor)}
      ${this.templateWorkspace(editor)}
      ${editor.parts.notifications.template(editor)}
    </div>`;
  }

  templateMenu(editor: LiveEditor): TemplateResult {
    if (editor.parts.menu.isDocked) {
      return html``;
    }

    const handleMenuClick = () => {
      editor.parts.menu.toggle();
    };

    return html`<div
      class="le__part__overview__menu le__clickable"
      @click=${handleMenuClick}
    >
      <span class="material-icons">menu</span>
    </div>`;
  }

  templateProject(editor: LiveEditor): TemplateResult {
    const project = this.config.state.project;

    // Lazy load the project.
    if (!project) {
      this.loadProject();
    }

    let projectName = project?.title || html`&nbsp;`;

    // Menu shows the project name when it is docked.
    if (editor.parts.menu.isDocked) {
      projectName = html`&nbsp;`;
    }

    return html`<div class="le__part__overview__title">${projectName}</div>`;
  }

  templateWorkspace(editor: LiveEditor): TemplateResult {
    const workspace = this.config.state.workspace;

    // Lazy load the workspace.
    if (!workspace) {
      this.loadWorkspace();
    }

    return html`<div class="le__part__overview__workspace">
      <span>Workspace:</span>
      <strong>${workspace?.name || '...'}</strong> @
      <strong>${(workspace?.branch.commit || '...').slice(0, 5)}</strong>
      by
      <strong>${workspace?.branch.author.name || '...'}</strong>
      (time ago)
    </div>`;
  }
}
