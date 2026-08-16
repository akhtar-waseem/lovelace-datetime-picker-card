import {
  ActionConfig as ExternalActionConfig,
  HomeAssistant,
  relativeTime
} from 'custom-card-helpers';
import {
  ActionConfig,
  CallServiceActionConfig,
  TimePickerCardConfig,
  TimePickerCardConfigForCustomCardHelper
} from '../types';
import { DEFAULT_CONFIG } from '../const';

/**
 * Format raw time string (HH:MM:SS) based on hour_mode (12h vs 24h)
 */
export function formatTime(timeStr: string, hourMode: string | undefined, hass: HomeAssistant): string {
  if (!timeStr || timeStr === 'Unknown') return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;

  const mode = hourMode || DEFAULT_CONFIG.hour_mode;
  if (Number(mode) === 12) {
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat(hass.language || 'en', {
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
 * Format YYYY-MM-DD based on selected date_format
 */
export function formatDate(dateStr: string, dateFormat: string | undefined, hass: HomeAssistant): string {
  if (!dateStr || dateStr === 'Unknown') return dateStr;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

  const date = new Date(year, month - 1, day);
  const lang = hass.language || 'en';
  const format = dateFormat || DEFAULT_CONFIG.date_format;

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
 * Compute relative text string (e.g. "a few seconds ago", "In 2 days")
 */
export function getRelativeText(
  dateStr: string,
  timeStr: string | undefined,
  showRelative: boolean | undefined,
  hass: HomeAssistant
): string | null {
  if (!showRelative || !dateStr || dateStr === 'Unknown') return null;

  const [y, m, d] = dateStr.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

  const targetDate = new Date(y, m - 1, d);

  if (timeStr) {
    const [h, min, s] = timeStr.split(':').map(Number);
    if (!isNaN(h) && !isNaN(min)) {
      targetDate.setHours(h, min, !isNaN(s) ? s : 0, 0);
    }
  }

  return relativeTime(targetDate, hass.locale);
}

export function getToday(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Convert internal ActionConfig to ExternalActionConfig for custom-card-helpers
 */
export function toExternalActionConfig(action?: ActionConfig): ExternalActionConfig| undefined {
  if (!action) return undefined;

  if (action.action === 'perform-action' || action.action === 'call-service') {
    const serviceAction = action as CallServiceActionConfig;
    return {
      action: 'call-service',
      service: serviceAction.perform_action || serviceAction.service || '',
      service_data: serviceAction.data || serviceAction.service_data,
      target: serviceAction.target,
      confirmation: serviceAction.confirmation,
    } as ExternalActionConfig;
  }

  return action as unknown as ExternalActionConfig;
}

/**
 * Convert internal TimePickerCardConfig to TimePickerCardConfigForCustomCardHelper
 */
export function toExternalTimePickerConfig(
  config: TimePickerCardConfig
): TimePickerCardConfigForCustomCardHelper {
  return {
    ...config,
    double_tap_action: toExternalActionConfig(config.double_tap_action),
    hold_action: toExternalActionConfig(config.hold_action),
  };
}