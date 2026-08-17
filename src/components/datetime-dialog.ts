import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import styles from '../css/datetime-dialog.css';
import { formatDate, formatTime } from '../utils/helpers';
import './date-picker-step';
import './time-picker-step';

@customElement('datetime-dialog')
export class DateTimeDialog extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: String }) public entityName: string = '';
  @property({ type: Boolean }) public open: boolean = false;
  @property({ type: Boolean }) public hasDate: boolean = true;
  @property({ type: Boolean }) public hasTime: boolean = true;
  @property({ type: String }) public initialDate: string = '';
  @property({ type: String }) public initialTime: string = '';

  @state() private _step: 'date' | 'time' = 'date';
  @state() private _tempDate: string = '';
  @state() private _tempTime: string = '';

  static styles = styles;

  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('open') && this.open) {
      this._step = this.hasDate ? 'date' : 'time';
      this._tempDate = this.initialDate;
      this._tempTime = this.initialTime || '12:00:00';
    }
  }

  private _getFormattedValue(): string {
    const parts: string[] = [];
    if (this.hasDate && this._tempDate) {
      parts.push(formatDate(this._tempDate, 'MMM D, YYYY', this.hass));
    }
    if (this.hasTime && this._tempTime) {
      parts.push(formatTime(this._tempTime, undefined, this.hass));
    }
    return parts.join(' • ');
  }

  render(): TemplateResult {
    if (!this.open) return html``;

    const isBoth = this.hasDate && this.hasTime;
    const isDateStep = this._step === 'date';
    const primaryLabel = isBoth && isDateStep ? 'Next' : 'Save';

    return html`
      <ha-adaptive-dialog
        open
        width="small"
        @closed=${this._handleHaDialogClosed}
      >
        <span slot="headerTitle">${this.entityName}</span>
        <div class="dialog-body">
          <!-- Clean Selected Value Row -->
          <span class="selected-summary">${this._getFormattedValue()}</span>

          <!-- Step Content Area -->
          <div class="step-content">
            ${isDateStep
              ? html`
                  <date-picker-step
                    .hass=${this.hass}
                    .value=${this._tempDate}
                    @date-changed=${(e: CustomEvent<{ value: string }>) => {
                      this._tempDate = e.detail.value;
                    }}
                  ></date-picker-step>
                `
              : html`
                  <time-picker-step
                    .value=${this._tempTime}
                    @time-changed=${(e: CustomEvent<{ value: string }>) =>
                      (this._tempTime = e.detail.value)}
                  ></time-picker-step>
                `}
          </div>

          <!-- Button Row with Top Separator -->
          <div class="button-row">
            ${isBoth && !isDateStep
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

            <button
              class="btn btn-primary"
              @click=${isBoth && isDateStep ? () => (this._step = 'time') : this._save}
            >
              ${primaryLabel}
            </button>
          </div>
        </div>
      </ha-adaptive-dialog>
    `;
  }

  private _handleHaDialogClosed(e: Event): void {
    e.stopPropagation();
    this._close();
  }

  private _close(): void {
    this.dispatchEvent(
      new CustomEvent('datetime-dialog-closed', { bubbles: true, composed: true })
    );
  }

  private _save(): void {
    this.dispatchEvent(
      new CustomEvent('datetime-saved', {
        detail: {
          date: this.hasDate ? this._tempDate : undefined,
          time: this.hasTime ? this._tempTime : undefined,
        },
        bubbles: true,
        composed: true,
      })
    );
    this._close();
  }
}