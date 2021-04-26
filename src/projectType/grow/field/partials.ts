import {GenericPartialsField} from '../../generic/field/partials';

export class GrowPartialsField extends GenericPartialsField {
  initPartials() {
    this.partials = this.globalConfig.state.projectTypes.grow.partials;
    this.globalConfig.state.projectTypes.grow.addListener(
      'getPartials',
      partials => {
        this.partials = partials;
        this.items = null;
        this.render();
      }
    );

    // Load the partials if not loaded.
    if (this.partials === undefined) {
      this.globalConfig.state.projectTypes.grow.getPartials();
    }
  }
}
