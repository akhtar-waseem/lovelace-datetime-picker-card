import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TimePickerCardConfig } from './types';

const NAME_TO_LABEL_MAP = {
  entity: 'input_datetime Entity',
  name: 'Custom Name',
  hour_mode: 'Clock Display Format',
  icon: 'Hide Icon',
};

const SCHEMA = [
  { name: 'entity', selector: { entity: { domain: 'input_datetime' } } },
  { name: 'name', selector: { text: {} } },
  {
    name: 'hour_mode',
    type: 'select',
    options: [
      [12, '12-Hour Format (AM/PM)'],
      [24, '24-Hour Format'],
    ],
  },
  {
    type: 'expandable',
    name: 'hide',
    title: 'Display Options',
    schema: [
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'name', type: 'boolean' },
          { name: 'icon', type: 'boolean' },
        ],
      },
    ],
  },
  {
    type: 'expandable',
    title: 'Actions',
    schema: [
      { name: 'tap_action', selector: { action: {} } },
      { name: 'double_tap_action', selector: { action: {} } },
      { name: 'hold_action', selector: { action: {} } },
    ],
  },
];

@customElement('datetime-picker-card-editor')
export class TimePickerCardEditor extends LitElement implements LovelaceCardEditor {
  private static readonly CONFIG_CHANGED_EVENT = 'config-changed';

  @property({ type: Object }) hass!: HomeAssistant;
  @property() private config!: TimePickerCardConfig;

  private computeLabel({ name }: { name: string }): string {
    return NAME_TO_LABEL_MAP[name as keyof typeof NAME_TO_LABEL_MAP] || name;
  }

  private valueChanged(ev: CustomEvent): void {
    const newConfig = { ...this.config, ...ev.detail.value };
    this.dispatch(newConfig);
  }

  render(): TemplateResult {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${SCHEMA}
        .computeLabel=${this.computeLabel}
        @value-changed=${this.valueChanged}
      ></ha-form>
    `;
  }

  setConfig(config: TimePickerCardConfig): void {
    this.config = config;
  }

  private dispatch(config: TimePickerCardConfig): void {
    const event = new CustomEvent(TimePickerCardEditor.CONFIG_CHANGED_EVENT, {
      bubbles: true,
      composed: true,
      detail: { config },
    });

    this.dispatchEvent(event);
  }
}