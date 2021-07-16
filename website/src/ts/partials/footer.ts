export class FooterPartial {
  toggle: HTMLElement | null;
  icon: HTMLElement | null;
  inputTimeout?: number;
  /**
   * Whether the user prefers dark mode.
   */
  prefersDarkScheme: boolean;
  /**
   * Scheme for the UI.
   */
  scheme: string;

  constructor(container: HTMLElement) {
    this.toggle = container.querySelector('.scheme__toggle');
    this.icon = container.querySelector('.scheme__toggle .material-icons');

    // Load the preferred scheme.
    this.prefersDarkScheme =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.scheme = localStorage.getItem('live.scheme') || '';
    this.bindToggle();
  }

  bindToggle() {
    if (!this.toggle) {
      return;
    }
    this.updateScheme();

    this.toggle.addEventListener('click', this.handleToggleClick.bind(this));
  }

  handleToggleClick(evt: Event) {
    evt.preventDefault();

    // Toggle the scheme.
    if (this.scheme === 'Light') {
      this.scheme = 'Dark';
    } else if (this.scheme === 'Dark') {
      this.scheme = 'Light';
    } else {
      this.scheme = this.prefersDarkScheme ? 'Light' : 'Dark';
    }

    if (
      (this.scheme === 'Light' && !this.prefersDarkScheme) ||
      (this.scheme === 'Dark' && this.prefersDarkScheme)
    ) {
      // If the new scheme is the same as the preferred scheme
      // remove the storage item so that changing the preferred
      // scheme correctly changes the color scheme.
      localStorage.removeItem('live.scheme');
    } else {
      // Store when using a scheme that is not the preferred.
      localStorage.setItem('live.scheme', this.scheme);
    }

    this.updateScheme();
  }

  updateScheme() {
    if (!this.icon) {
      return;
    }

    if (
      this.scheme === 'Dark' ||
      (this.scheme === '' && this.prefersDarkScheme)
    ) {
      document.body.classList.remove('scheme-light');
      document.body.classList.add('scheme-dark');
      this.icon.textContent = 'light_mode';
    } else {
      document.body.classList.remove('scheme-dark');
      document.body.classList.add('scheme-light');
      this.icon.textContent = 'dark_mode';
    }
  }
}
