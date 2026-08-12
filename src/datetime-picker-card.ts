import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { TimePickerCardConfig } from './types';
import './components/datetime-dialog';
import './editor'; // Static import prevents code-splitting

@customElement('datetime-picker-card')
export class DateTimePickerCard extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) private _config!: TimePickerCardConfig;

  @state() private _dialogOpen: boolean = false;

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
    const rawState = stateObj ? stateObj.state : 'Unknown';

    // Format display string cleanly: "YYYY-MM-DD • HH:MM:SS"
    const [currentDate, currentTime] = rawState.includes(' ')
      ? rawState.split(' ')
      : [rawState, '12:00:00'];

    const formattedValue = rawState.includes(' ')
      ? `${currentDate}  •  ${currentTime}`
      : rawState;

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
        .open=${this._dialogOpen}
        .initialDate=${currentDate}
        .initialTime=${currentTime}
        @dialog-closed=${this._closeDialog}
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
    this.hass.callService('input_datetime', 'set_datetime', {
      entity_id: this._config.entity,
      date,
      time,
    });
  }

  static styles = css`
    ha-card {
      cursor: pointer;
      user-select: none;
    }
    .card-content {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 16px;
    }
    ha-icon {
      color: var(--primary-color, #03a9f4);
      --mdc-icon-size: 28px;
    }
    .info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .name {
      font-weight: 500;
      font-size: 0.85rem;
      color: var(--secondary-text-color, #a0a0a0);
      line-height: 1.2;
    }
    .value {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--primary-text-color, #ffffff);
      line-height: 1.3;
      white-space: nowrap;
    }
  `;
}