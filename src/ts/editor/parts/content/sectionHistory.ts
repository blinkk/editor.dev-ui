import {ContentSectionPart, ContentSectionPartConfig} from './section';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';
import {LiveEditor} from '../../editor';
import TimeAgo from 'javascript-time-ago';

export class HistoryPart extends ContentSectionPart {
  timeAgo: TimeAgo;

  constructor(config: ContentSectionPartConfig) {
    super(config);
    this.timeAgo = new TimeAgo('en-US');
  }

  get canChangeSection(): boolean {
    return true;
  }

  get label() {
    return 'History';
  }

  get section(): string {
    return 'history';
  }

  templateAction(editor: LiveEditor): TemplateResult {
    return html``;
  }

  templateChanges(editor: LiveEditor): TemplateResult {
    if (!editor.state.file?.history) {
      return html`<div class="le__part__content__history__title">
          Change history
        </div>
        <div class="le__list">
          <div class="le__list__item le__list__item--pad_small">
            <div class="le__list__item__label">Change history unavailable.</div>
          </div>
        </div>`;
    }

    return html`<div class="le__part__content__history__title">
        Change history
      </div>
      <div class="le__list">
        ${repeat(
          editor.state.file.history,
          change => change.hash,
          (change, index) => html`<div
            class=${classMap({
              le__list__item: true,
              'le__list__item--pad': true,
              'le__list__item--selected': index === 0,
              le__change: true,
            })}
          >
            <span class="material-icons">notes</span>
            <div class="le__change__details">
              <div class="le__change__meta">
                <strong>${change.hash.slice(0, 5)}</strong>
                by
                <strong>${change.author?.name}</strong>
                (${this.timeAgo.format(
                  new Date(change.timestamp || new Date())
                )})
              </div>
              <div class="le__change__summary">
                ${this.trimSummary(change.summary)}
              </div>
            </div>
          </div>`
        )}
      </div>`;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__content__history__title">
        Current workspace
      </div>
      <div class="le__part__content__history__current le__list">
        <div
          class="le__list__item le__list__item--pad le__list__item--emphasis"
        >
          <span class="material-icons">dashboard</span>
          ${editor.state.workspace?.name}
        </div>
      </div>
      ${this.templateChanges(editor)}`;
  }

  trimSummary(summary?: string): string {
    if (!summary) {
      return '';
    }

    if (summary.includes('\n')) {
      return summary.slice(0, summary.indexOf('\n'));
    }

    return summary;
  }
}
