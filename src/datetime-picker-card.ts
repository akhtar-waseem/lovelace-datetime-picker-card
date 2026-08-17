import {
  ActionHandlerEvent,
  handleAction,
  hasAction,
  HomeAssistant,
  LovelaceCardEditor 
} from 'custom-card-helpers';
import { actionHandler } from './action-handler-directive';
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  formatDate,
  formatTime,
  getRelativeText,
  getToday,
  toExternalTimePickerConfig
} from './utils/helpers';
import styles from './css/datetime-picker-card.css';
import {
  TimePickerCardConfig,
  TimePickerCardConfigForCustomCardHelper,
  CallServiceActionConfig
} from './types';
import { DEFAULT_CONFIG } from './const';
import './components/datetime-dialog';
import './components/confirm-dialog';
import './editor';

@customElement('datetime-picker-card')
export class DateTimePickerCard extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) private _config!: TimePickerCardConfig;
  @property({ type: Object }) private _configExternal!: TimePickerCardConfigForCustomCardHelper;

  @state() private _dialogOpen: boolean = false;
  @state() private _confirmOpen: boolean = false;

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
      show_relative: DEFAULT_CONFIG.show_relative,
      show_quick_now: DEFAULT_CONFIG.show_quick_now,
    };
  }

  public setConfig(config: TimePickerCardConfig): void {
    if (!config.entity) {
      throw new Error('Please define an input_datetime entity');
    }
    this._config = { ...DEFAULT_CONFIG, ...config };
    this._configExternal = toExternalTimePickerConfig(this._config);
  }

  private _handleQuickNow(e: Event): void {
    e.stopPropagation();
    this._confirmOpen = true;
  }

  private _closeConfirm(e?: Event): void {
    if (e) e.stopPropagation();
    this._confirmOpen = false;
  }

  private _applyNow(e: Event): void {
    e.stopPropagation();
    this._confirmOpen = false;

    const stateObj = this.hass.states[this._config.entity];
    if (!stateObj) return;

    const hasDate = stateObj.attributes?.has_date ?? true;
    const hasTime = stateObj.attributes?.has_time ?? true;

    const now = new Date();
    const pad = (n: number): string => String(n).padStart(2, '0');

    const payload: Record<string, string> = {
      entity_id: this._config.entity,
    };

    if (hasDate) {
      payload.date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    }

    if (hasTime) {
      payload.time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    this.hass.callService('input_datetime', 'set_datetime', payload);
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
    let formattedDate = '';
    let formattedTime = '';

    if (hasDate) {
      formattedDate = formatDate(currentDate, this._config.date_format, this.hass);
    }
    if (hasTime) {
      formattedTime = formatTime(currentTime, this._config.hour_mode, this.hass);
    }
    if (hasDate && hasTime) {
      formattedValue = `${formattedDate}  •  ${formattedTime}`;
    } else if (hasDate) {
      formattedValue = formattedDate;
    } else if (hasTime) {
      formattedValue = formattedTime;
    }

    // Relative timestamp subtitle
    const relativeText = getRelativeText(
      currentDate || getToday(),
      currentTime,
      this._config.show_relative, 
      this.hass
    );

    // Respect custom icon or hide settings
    const icon = this._config.icon || stateObj?.attributes?.icon || 'mdi:calendar-clock';
    const hideIcon = this._config.hide?.icon;
    const hideName = this._config.hide?.name;

    const targetTargetText = hasDate && hasTime ? 'date and time' : hasDate ? 'date' : 'time';
    const confirmMessage = `Are you sure you want to update ${name} to current ${targetTargetText}?`;

    return html`
      <ha-card @action=${this._handleAction}
        .actionHandler="${actionHandler({
        hasHold: hasAction(this._configExternal.hold_action),
        hasDoubleClick: hasAction(this._configExternal.double_tap_action),
      })}">
        <div class="card-content">
          ${!hideIcon ? html`<ha-icon .icon=${icon} class="main-icon"></ha-icon>` : ''}
          <div class="info">
            ${!hideName ? html`<div class="name">${name}</div>` : ''}
            <div class="value">${formattedValue}</div>
            ${relativeText ? html`<div class="relative">${relativeText}</div>` : ''}
          </div>

          ${this._config.show_quick_now
            ? html`
                <ha-icon-button
                  class="quick-now-btn"
                  title="Set to Now"
                  @click=${this._handleQuickNow}
                >
                  <ha-icon icon="mdi:clock-fast"></ha-icon>
                </ha-icon-button>
              `
            : ''}
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

      <datetime-confirm-dialog
        .open=${this._confirmOpen}
        .title=${entityName}
        .message=${confirmMessage}
        @confirm-closed=${this._closeConfirm}
        @confirm-approved=${this._applyNow}
      ></datetime-confirm-dialog>
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

   private _handleAction(ev: ActionHandlerEvent): void {
    const action = ev.detail.action;
    if (action === 'tap') {
      this._openDialog();
      return;
    }

    const actionConfig =
    action === 'hold'
      ? this._config.hold_action
      : action === 'double_tap'
        ? this._config.double_tap_action
        : undefined;
    if (!actionConfig) {
      return;
    }

     if (actionConfig.action === "call-service" || actionConfig.action === "perform-action") {
        this._handlePerformAction(actionConfig);
        return;
      }
    handleAction(this, this.hass, this._configExternal, action);
  }

  private _handlePerformAction(performAction: CallServiceActionConfig): void {
    if (!performAction.perform_action) {
      return;
    }

    const [domain, service] = performAction.perform_action.split('.', 2);

    this.hass.callService(
      domain,
      service,
      performAction.data,
      performAction.target
    );
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "datetime-picker-card",
  name: "DateTime Picker Card",
  description: "A Material 3 styled date and time picker card.",
  preview: true,
  /**
   * Suggest datetime-picker-card for input_datetime entities.
   * 
   * @param _hass 
   * @param entityId 
   * @returns 
   */
  getEntitySuggestion: (_hass: unknown, entityId: string) => {
    const domain = entityId.split(".")[0];

    if (domain !== "input_datetime") {
      return null;
    }

    return {
      config: {
        type: "custom:datetime-picker-card",
        entity: entityId,
      },
    };
  },
});