import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import styles from './css/datetime-picker-card.css';
import { TimePickerCardConfig } from './types';
import './components/datetime-dialog';
import './editor'; // Static import prevents code-splitting

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
    return { entity: '' };
  }

  public setConfig(config: TimePickerCardConfig): void {
    if (!config.entity) {
      throw new Error('Please define an input_datetime entity');
    }
    this._config = config;
  }

render(): TemplateResult {
  if (!this.hass || !this._config) return html``;

  const stateObj = this.hass.states[this._config.entity];
  const name = this._config.name || stateObj?.attributes?.friendly_name || 'Date & Time';
  const entityName = stateObj?.attributes?.friendly_name ?? this._config.entity;
  const rawState = stateObj ? stateObj.state : 'Unknown';

  // Read entity capabilities (default to true if missing)
  const hasDate = stateObj?.attributes?.has_date ?? true;
  const hasTime = stateObj?.attributes?.has_time ?? true;

  // Derive date and time parts dynamically based on attributes
  let currentDate = '';
  let currentTime = '';
  let formattedValue = rawState;

  if (hasDate && hasTime) {
    [currentDate, currentTime] = rawState.includes(' ')
      ? rawState.split(' ')
      : [rawState, '12:00:00'];
    formattedValue = rawState.includes(' ') ? `${currentDate}  •  ${currentTime}` : rawState;
  } else if (hasDate) {
    currentDate = rawState;
    formattedValue = currentDate;
  } else if (hasTime) {
    currentTime = rawState;
    formattedValue = currentTime;
  }

  return html`
    <ha-card @click=${this._openDialog}>
      <div class="card-content">
        <ha-icon icon="mdi:calendar-clock"></ha-icon>
        <div class="info">
          <div class="name">${name}</div>
          <div class="value">${formattedValue}</div>
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