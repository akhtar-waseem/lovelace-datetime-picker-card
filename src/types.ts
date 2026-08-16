import {
  LovelaceCardConfig, 
  NavigateActionConfig,
  ToggleActionConfig,
  UrlActionConfig,
  MoreInfoActionConfig,
  NoActionConfig,
  CustomActionConfig,
  ToggleMenuActionConfig,
  ActionConfig as ExternalActionConfig,
} from 'custom-card-helpers';
import { HassServiceTarget } from 'home-assistant-js-websocket';

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

export interface BaseActionConfig {
  action: string;
  confirmation?: ConfirmationRestrictionConfig;
}

export interface ConfirmationRestrictionConfig {
  text?: string;
  title?: string;
  confirm_text?: string;
  dismiss_text?: string;
  exemptions?: RestrictionConfig[];
}

export interface RestrictionConfig {
  user: string;
}

export interface CallServiceActionConfig extends BaseActionConfig {
  action: "call-service" | "perform-action";
  /** @deprecated "service" is kept for backwards compatibility. Replaced by "perform_action". */
  service?: string;
  perform_action: string;
  target?: HassServiceTarget;
  /** @deprecated "service_data" is kept for backwards compatibility. Replaced by "data". */
  service_data?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export type ActionConfig = ToggleActionConfig | CallServiceActionConfig | NavigateActionConfig | UrlActionConfig | MoreInfoActionConfig | NoActionConfig | CustomActionConfig | ToggleMenuActionConfig;

export interface TimePickerCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  hour_mode?: HourMode;
  date_format?: DateFormat;
  show_relative?: boolean;
  show_quick_now?: boolean;
  minute_step?: MinuteStep;
  double_tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  hide?: TimePickerHideConfig;
}

export interface TimePickerCardConfigForCustomCardHelper extends LovelaceCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  hour_mode?: HourMode;
  date_format?: DateFormat;
  show_relative?: boolean;
  show_quick_now?: boolean;
  minute_step?: MinuteStep;
  double_tap_action?: ExternalActionConfig;
  hold_action?: ExternalActionConfig;
  hide?: TimePickerHideConfig;
}

export interface TimePickerHideConfig {
  name?: boolean;
  icon?: boolean;
}