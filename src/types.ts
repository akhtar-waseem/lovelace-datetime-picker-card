import { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers';

export type DateFormat = 'default'
    | 'YYYY-MM-DD'
    | 'DD/MM/YYYY'
    | 'MM/DD/YYYY'
    | 'MMM D, YYYY'
    | 'D MMM YYYY'
    | 'MMMM D, YYYY'
    | 'dddd, MMM D';
    
export type HourMode = '12' | '24';
export type MinuteStep = '1' | '5' | '15' | '30';

export interface TimePickerCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  hour_mode?: HourMode;
  date_format?: DateFormat;
  show_relative?: boolean;
  show_quick_now?: boolean;
  minute_step?: MinuteStep;
  tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  hide?: TimePickerHideConfig;
}

export interface TimePickerHideConfig {
  name?: boolean;
  icon?: boolean;
}