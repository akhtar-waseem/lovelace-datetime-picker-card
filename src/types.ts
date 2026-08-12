import { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers';

export type HourMode = 12 | 24;

export interface TimePickerCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  hour_mode?: HourMode;
  tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  hide?: TimePickerHideConfig;
}

export interface TimePickerHideConfig {
  name?: boolean;
  icon?: boolean;
}