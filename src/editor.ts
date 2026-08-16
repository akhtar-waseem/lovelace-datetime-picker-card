import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TimePickerCardConfig } from './types';
import { DEFAULT_CONFIG } from './const';

const NAME_TO_LABEL_MAP = {
  entity: 'Entity of the type: input_datetime',
  name: 'Custom Name',
  icon: 'Custom Icon',
  hour_mode: 'Clock Display Format',
  date_format: 'Date Display Format',
  show_relative: 'Show Relative Time (e.g. "In 2 days")',
  show_quick_now: 'Show "Set to Now" Button',
  minute_step: 'Minute Selection Interval',
};

const SCHEMA = [
  { name: 'entity', selector: { entity: { domain: 'input_datetime' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'icon', selector: { icon: {} } },
  {
    type: 'expandable',
    title: 'Display & Formatting',
    schema: [
      {
        name: 'hour_mode',
        type: 'select',
        options: [
          ['12', '12-Hour Dial (AM/PM)'],
          ['24', '24-Hour Dial (00-23)'],
        ],
      },
      {
        name: 'date_format',
        type: 'select',
        options: [
          ['default', 'Default (Language / Profile Settings)'],
          ['YYYY-MM-DD', '2026-09-18 (YYYY-MM-DD)'],
          ['DD/MM/YYYY', '18/09/2026 (DD/MM/YYYY)'],
          ['MM/DD/YYYY', '09/18/2026 (MM/DD/YYYY)'],
          ['MMM D, YYYY', 'Sep 18, 2026 (Short Month)'],
          ['D MMM YYYY', '18 Sep 2026 (Short Month)'],
          ['MMMM D, YYYY', 'September 18, 2026 (Full Month)'],
          ['dddd, MMM D', 'Friday, Sep 18 (Day of Week)'],
        ],
      },
      { name: 'show_relative', type: 'boolean' },
      { name: 'show_quick_now', type: 'boolean' },
    ],
  },
  {
    type: 'expandable',
    title: 'Time Selection Configuration',
    schema: [
      {
        name: 'minute_step',
        type: 'select',
        options: [
          ['1', '1 Minute'],
          ['5', '5 Minutes'],
          ['15', '15 Minutes'],
          ['30', '30 Minutes'],
        ],
      },
    ],
  },
  {
    type: 'expandable',
    title: 'Actions',
    schema: [
      { name: 'double_tap_action', selector: { ui_action: {} } },
      { name: 'hold_action', selector: { ui_action: {} } },
    ],
  },
];

@customElement('datetime-picker-card-editor')
export class TimePickerCardEditor extends LitElement implements LovelaceCardEditor {
  private static readonly CONFIG_CHANGED_EVENT = 'config-changed';

  @property({ type: Object }) hass!: HomeAssistant;
  @property({ type: Object }) private config!: TimePickerCardConfig;

  private computeLabel({ name }: { name: string }): string {
    return NAME_TO_LABEL_MAP[name as keyof typeof NAME_TO_LABEL_MAP] || name;
  }

  private valueChanged(ev: CustomEvent): void {
    this.config = { ...this.config, ...ev.detail.value };
    this.dispatch(this.config);
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
    // Fill in default values if not explicitly set in card YAML
    this.config = { ...DEFAULT_CONFIG, ...config };
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