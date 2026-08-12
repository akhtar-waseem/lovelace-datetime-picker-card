import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from '../css/date-picker-step.css';

@customElement('date-picker-step')
export class DatePickerStep extends LitElement {
  @property({ type: String }) public value: string = '';

  static styles = styles;

  render(): TemplateResult {
    return html`
      <div class="date-step-container">
        <label class="date-label">Select Date</label>
        <input
          type="date"
          class="date-input"
          .value=${this.value}
          @click=${this._triggerPicker}
          @change=${this._onDateChange}
        />
      </div>
    `;
  }

  private _triggerPicker(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input && 'showPicker' in HTMLInputElement.prototype) {
      try {
        input.showPicker();
      } catch {
        // Fallback for unsupported browsers
      }
    }
  }

  private _onDateChange(e: Event): void {
    const selectedDate = (e.target as HTMLInputElement).value;
    if (selectedDate) {
      this.value = selectedDate;
      this.dispatchEvent(
        new CustomEvent('date-changed', {
          detail: { value: selectedDate },
          bubbles: true,
          composed: true,
        })
      );
    }
  }
}