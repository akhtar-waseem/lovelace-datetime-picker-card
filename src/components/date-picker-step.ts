import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('date-picker-step')
export class DatePickerStep extends LitElement {
  @property({ type: String }) public value: string = '';

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
        // Fallback
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

  static styles = css`
    .date-step-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      width: 100%;
    }
    .date-label {
      font-size: 1rem;
      font-weight: 500;
      color: var(--secondary-text-color, #aaa);
    }
    .date-input {
      font-size: 1.25rem;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid var(--primary-color, #03a9f4);
      background: var(--card-background-color, #222);
      color: var(--primary-text-color, #fff);
      color-scheme: dark;
      cursor: pointer;
      outline: none;
      width: 220px;
      text-align: center;
    }
  `;
}