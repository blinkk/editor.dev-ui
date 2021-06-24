const COPIED_CLASS = 'local__instruction__command--copied';

export class LocalPartial {
  instructionContainer: HTMLElement | null;
  inputTimeout?: number;

  constructor(container: HTMLElement) {
    this.instructionContainer = container.querySelector(
      '.local__instruction__command'
    );
    this.bindCommandInput();
  }

  bindCommandInput() {
    if (!this.instructionContainer) {
      return;
    }
    const commandInput = this.instructionContainer.querySelector('input');

    if (!commandInput) {
      console.error('Unable to find the command input.');
    }

    commandInput?.addEventListener('click', this.handleCommandClick.bind(this));
  }

  handleCommandClick(evt: Event) {
    // Clean any existing input timeout.
    if (this.inputTimeout) {
      window.clearTimeout(this.inputTimeout);
    }

    const target = evt.target as HTMLInputElement;
    if (target) {
      target.select();
      document.execCommand('copy');

      this.instructionContainer?.classList.add(COPIED_CLASS);
      this.inputTimeout = window.setTimeout(() => {
        this.instructionContainer?.classList.remove(COPIED_CLASS);
      }, 10000);
    }
  }
}
