import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import styles from '../css/date-picker-step.css';

@customElement('date-picker-step')
export class DatePickerStep extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: String }) public value: string = '';

  static styles = styles;

  /**
   * Strips out any time components (e.g. "2026-09-16 12:00:00" -> "2026-09-16")
   */
  private get _dateOnlyValue(): string {
    if (!this.value) return '';
    return this.value.split('T')[0].split(' ')[0];
  }

  /**
   * Formats "YYYY-MM-DD" into a localized date label (e.g., "Sep 18, 2026")
   */
  private get _formattedDisplayDate(): string {
    if (!this._dateOnlyValue) return 'Select Date';

    const parts = this._dateOnlyValue.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);

      const lang =
        this.hass?.locale?.language || this.hass?.language || navigator.language || 'en-US';

      return new Intl.DateTimeFormat(lang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(dateObj);
    }

    return this._dateOnlyValue;
  }

  /**
   * Triggers the underlying HA Date Input picker programmatically
   */
  private _openCalendar(): void {
    const dateInput = this.shadowRoot?.querySelector('ha-date-input') as HTMLElement & {
      focus?: () => void;
    } | null;

    if (!dateInput) return;

    // Trigger focus on the ha-date-input
    dateInput.focus?.();

    // Traverse shadowRoot to trigger click on internal input elements (ha-input / wa-input)
    const internalInput = dateInput.shadowRoot?.querySelector(
      'ha-input, wa-input, paper-input, input'
    ) as HTMLElement | null;

    if (internalInput) {
      internalInput.click();
      if (internalInput.shadowRoot) {
        const deepInput = internalInput.shadowRoot.querySelector(
          'input, .control'
        ) as HTMLElement | null;
        deepInput?.click();
      }
    } else {
      dateInput.click();
    }
  }

  /**
   * Intercepts HA's popup launch to listen for the "OK" click even if date hasn't changed
   */
  private _handleShowDialog(e: CustomEvent): void {
    if (e.detail?.dialogTag === 'ha-dialog-date-picker' && e.detail?.dialogParams) {
      const origOnChange = e.detail.dialogParams.onChange;

      e.detail.dialogParams.onChange = (newValue: string) => {
        if (origOnChange) {
          origOnChange(newValue);
        }

        if (newValue) {
          this.value = newValue;
          this.dispatchEvent(
            new CustomEvent('date-changed', {
              detail: { value: newValue, autoNext: true },
              bubbles: true,
              composed: true,
            })
          );
        }
      };
    }
  }

  render(): TemplateResult {
    return html`
      <div class="date-step-container" @show-dialog=${this._handleShowDialog}>
        <div class="date-badge-wrapper" @click=${this._openCalendar}>
          <!-- Styled Label Badge -->
          <div class="date-label-badge">
            <ha-icon icon="mdi:calendar-month"></ha-icon>
            <span class="date-text">${this._formattedDisplayDate}</span>
          </div>

          <!-- Hidden HA Date Input for internal logic & popup generation -->
          <ha-date-input
            class="hidden-picker"
            .hass=${this.hass}
            .value=${this._dateOnlyValue}
            .locale=${this.hass?.locale}
            @value-changed=${this._onDateChange}
          ></ha-date-input>
        </div>
      </div>
    `;
  }

  private _onDateChange(e: CustomEvent<{ value: string }>): void {
    const selectedDate = e.detail?.value;

    if (selectedDate) {
      this.value = selectedDate;
      this.dispatchEvent(
        new CustomEvent('date-changed', {
          detail: { value: selectedDate, autoNext: true },
          bubbles: true,
          composed: true,
        })
      );
    }
  }
}