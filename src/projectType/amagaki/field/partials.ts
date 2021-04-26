import {GenericPartialsField} from '../../generic/field/partials';

export class AmagakiPartialsField extends GenericPartialsField {
  initPartials() {
    this.partials = this.globalConfig.state.projectTypes.amagaki.partials;
    this.globalConfig.state.projectTypes.amagaki.addListener(
      'getPartials',
      partials => {
        this.partials = partials;
        this.items = null;
        this.render();
      }
    );

    // Load the partials if not loaded.
    if (this.partials === undefined) {
      this.globalConfig.state.projectTypes.amagaki.getPartials();
    }
  }
}
