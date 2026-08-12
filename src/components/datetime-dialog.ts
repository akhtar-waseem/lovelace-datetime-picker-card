import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './date-picker-step';
import './time-picker-step';

@customElement('datetime-dialog')
export class DateTimeDialog extends LitElement {
  @property({ type: Boolean }) public open: boolean = false;
  @property({ type: String }) public initialDate: string = '';
  @property({ type: String }) public initialTime: string = '';

  @state() private _step: 'date' | 'time' = 'date';
  @state() private _tempDate: string = '';
  @state() private _tempTime: string = '';

  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('open') && this.open) {
      this._step = 'date';
      this._tempDate = this.initialDate;
      this._tempTime = this.initialTime || '12:00:00';
    }
  }

  render(): TemplateResult {
    if (!this.open) return html``;

    return html`
      <ha-dialog
        open
        heading=${this._step === 'date' ? 'Select Date' : 'Select Time'}
        @closed=${this._close}
      >
        <div class="dialog-body">
          ${this._step === 'date'
            ? html`
                <date-picker-step
                  .value=${this._tempDate}
                  @date-changed=${(e: CustomEvent<{ value: string }>) =>
                    (this._tempDate = e.detail.value)}
                ></date-picker-step>
              `
            : html`
                <time-picker-step
                  .value=${this._tempTime}
                  @time-changed=${(e: CustomEvent<{ value: string }>) =>
                    (this._tempTime = e.detail.value)}
                ></time-picker-step>
              `}

          <!-- Explicit Navigation / Action Buttons -->
          <div class="button-row">
            ${this._step === 'time'
              ? html`
                  <button class="btn btn-secondary" @click=${() => (this._step = 'date')}>
                    Back
                  </button>
                `
              : html`
                  <button class="btn btn-secondary" @click=${this._close}>
                    Cancel
                  </button>
                `}

            ${this._step === 'date'
              ? html`
                  <button class="btn btn-primary" @click=${() => (this._step = 'time')}>
                    Next
                  </button>
                `
              : html`
                  <button class="btn btn-primary" @click=${this._save}>
                    Save
                  </button>
                `}
          </div>
        </div>
      </ha-dialog>
    `;
  }

  private _close(): void {
    this.dispatchEvent(new CustomEvent('dialog-closed', { bubbles: true, composed: true }));
  }

  private _save(): void {
    this.dispatchEvent(
      new CustomEvent('datetime-saved', {
        detail: {
          date: this._tempDate,
          time: this._tempTime,
        },
        bubbles: true,
        composed: true,
      })
    );
    this._close();
  }

  static styles = css`
    .dialog-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 8px;
      min-width: 260px;
    }
    .button-row {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      width: 100%;
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid var(--divider-color, #333);
    }
    .btn {
      padding: 8px 18px;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      transition: background 0.2s ease;
    }
    .btn-secondary {
      background: transparent;
      color: var(--primary-text-color, #fff);
      border: 1px solid var(--divider-color, #555);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .btn-primary {
      background: var(--primary-color, #03a9f4);
      color: #ffffff;
    }
    .btn-primary:hover {
      opacity: 0.9;
    }
  `;
}