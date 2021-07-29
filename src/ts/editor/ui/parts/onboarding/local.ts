import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {ProjectData, UserData} from '../../../api';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {EditorState} from '../../../state';

export interface LocalOnboardingPartConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
}

export class LocalOnboardingPart extends BasePart implements UiPartComponent {
  config: LocalOnboardingPartConfig;
  users?: Array<UserData>;

  constructor(config: LocalOnboardingPartConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__onboarding__local: true,
    };
  }

  loadProject() {
    this.users = this.config.state.getProject((project: ProjectData) => {
      // Default to array so it does not try to keep reloading the project data.
      this.users = project.users || [];
      this.render();
    })?.users;
  }

  template(): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__onboarding__local__title">
        Searching for local project...
      </div>

      <div class="le__part__onboarding__local__body">
        Run the following command in the main directory of your local project:
      </div>

      <div class="le__part__onboarding__local__instruction">
        <pre><code><div class="le__part__onboarding__local__instruction__version"># Requires <a href="https://nodejs.org/" target="_blank">Node.js</a> &gt;= 14</div>
<div class="le__part__onboarding__local__instruction__command"><input readonly value="npx @blinkk/editor.dev"></div></code></pre>
      </div>
    </div>`;
  }
}