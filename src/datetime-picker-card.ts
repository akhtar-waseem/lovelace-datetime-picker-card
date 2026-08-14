import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, relativeTime } from 'custom-card-helpers';
import styles from './css/datetime-picker-card.css';
import { TimePickerCardConfig } from './types';
import { DEFAULT_CONFIG } from './const';
import './components/datetime-dialog';
import './editor';

@customElement('datetime-picker-card')
export class DateTimePickerCard extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) private _config!: TimePickerCardConfig;

  @state() private _dialogOpen: boolean = false;

  static styles = styles;

  // Static reference to editor element (no dynamic chunking)
  public static getConfigElement(): LovelaceCardEditor {
    return document.createElement('datetime-picker-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): Record<string, unknown> {
    return {
      entity: '',
      hour_mode: DEFAULT_CONFIG.hour_mode,
      date_format: DEFAULT_CONFIG.date_format,
      minute_step: DEFAULT_CONFIG.minute_step,
      show_relative: DEFAULT_CONFIG.show_relative,
      show_quick_now: DEFAULT_CONFIG.show_quick_now,
    };
  }

  public setConfig(config: TimePickerCardConfig): void {
    if (!config.entity) {
      throw new Error('Please define an input_datetime entity');
    }
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Helper to format raw time (HH:MM:SS) based on hour_mode (12h vs 24h)
   */
  private _formatTime(timeStr: string): string {
    if (!timeStr || timeStr === 'Unknown') return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;

    if (Number(this._config.hour_mode) === 12) {
      const date = new Date();
      date.setHours(h, m, 0, 0);
      return new Intl.DateTimeFormat(this.hass.language || 'en', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    }

    // Default 24-hour format (HH:mm)
    const pad = (n: number): string => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}`;
  }

  /**
   * Helper to format YYYY-MM-DD based on date_format selection
   */
  private _formatDate(dateStr: string): string {
    if (!dateStr || dateStr === 'Unknown') return dateStr;
    const [year, month, day] = dateStr.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

    const date = new Date(year, month - 1, day);
    const lang = this.hass.language || 'en';
    const format = this._config.date_format || 'default';

    if (format === 'default') {
      return new Intl.DateTimeFormat(lang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    }

    let options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    switch (format) {
      case 'YYYY-MM-DD':
        return dateStr;
      case 'DD/MM/YYYY':
      case 'MM/DD/YYYY':
        options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        break;
      case 'MMM D, YYYY':
      case 'D MMM YYYY':
        options = { year: 'numeric', month: 'short', day: 'numeric' };
        break;
      case 'MMMM D, YYYY':
        options = { year: 'numeric', month: 'long', day: 'numeric' };
        break;
      case 'dddd, MMM D':
        options = { weekday: 'long', month: 'short', day: 'numeric' };
        break;
    }
    return new Intl.DateTimeFormat(lang, options).format(date);
  }

  /**
   * Helper for computing relative text (e.g. "In 2 days", "Yesterday")
   */
  private _getRelativeText(dateStr: string, timeStr?: string): string | null {
    if (!this._config.show_relative || !dateStr || dateStr === 'Unknown') return null;

    const [y, m, d] = dateStr.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

    const targetDate = new Date(y, m - 1, d);

    if (timeStr) {
      const [h, min] = timeStr.split(':').map(Number);
      if (!isNaN(h) && !isNaN(min)) targetDate.setHours(h, min, 0, 0);
    }

    // Leverage native Home Assistant helper
    return relativeTime(targetDate, this.hass.locale);
  }

  render(): TemplateResult {
    if (!this.hass || !this._config) return html``;

    const stateObj = this.hass.states[this._config.entity];
    const name = this._config.name || stateObj?.attributes?.friendly_name || 'Date & Time';
    const entityName = stateObj?.attributes?.friendly_name ?? this._config.entity;
    const rawState = stateObj ? stateObj.state : 'Unknown';

    // Read entity capabilities
    const hasDate = stateObj?.attributes?.has_date ?? true;
    const hasTime = stateObj?.attributes?.has_time ?? true;

    // Split raw state into components
    let currentDate = '';
    let currentTime = '';

    if (hasDate && hasTime) {
      [currentDate, currentTime] = rawState.includes(' ')
        ? rawState.split(' ')
        : [rawState, '12:00:00'];
    } else if (hasDate) {
      currentDate = rawState;
    } else if (hasTime) {
      currentTime = rawState;
    }

    // Apply custom formatting based on entity capabilities
    let formattedValue = rawState;
    if (hasDate && hasTime) {
      formattedValue = `${this._formatDate(currentDate)}  •  ${this._formatTime(currentTime)}`;
    } else if (hasDate) {
      formattedValue = this._formatDate(currentDate);
    } else if (hasTime) {
      formattedValue = this._formatTime(currentTime);
    }

    // Relative timestamp subtitle
    const relativeText = hasDate ? this._getRelativeText(currentDate, currentTime) : null;

    // Respect custom icon or hide settings
    const icon = this._config.icon || stateObj?.attributes?.icon || 'mdi:calendar-clock';
    const hideIcon = this._config.hide?.icon;
    const hideName = this._config.hide?.name;

    return html`
      <ha-card @click=${this._openDialog}>
        <div class="card-content">
          ${!hideIcon ? html`<ha-icon .icon=${icon}></ha-icon>` : ''}
          <div class="info">
            ${!hideName ? html`<div class="name">${name}</div>` : ''}
            <div class="value">${formattedValue}</div>
            ${relativeText ? html`<div class="relative">${relativeText}</div>` : ''}
          </div>
        </div>
      </ha-card>

      <datetime-dialog
        .hass=${this.hass}
        .open=${this._dialogOpen}
        .entityName=${entityName}
        .hasDate=${hasDate}
        .hasTime=${hasTime}
        .initialDate=${currentDate}
        .initialTime=${currentTime}
        @datetime-dialog-closed=${this._closeDialog}
        @datetime-saved=${this._handleSave}
      ></datetime-dialog>
    `;
  }

  private _openDialog(): void {
    this._dialogOpen = true;
  }

  private _closeDialog(): void {
    this._dialogOpen = false;
  }

  private _handleSave(e: CustomEvent<{ date: string; time: string }>): void {
    const { date, time } = e.detail;
    const payload: Record<string, string> = {
      entity_id: this._config.entity,
    };
    if (date) payload.date = date;
    if (time) payload.time = time;
    this.hass.callService('input_datetime', 'set_datetime', payload);
  }
}