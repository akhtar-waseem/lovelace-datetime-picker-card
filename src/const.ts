import { TimePickerCardConfig } from './types';
import * as pkg from '../package.json';

export const CARD_VERSION = pkg.version;
export const CARD_SIZE = 2; // Reduced to 2 since it's a sleek single card button
export const ENTITY_DOMAIN = 'input_datetime';

// Single Source of Truth for Default Configuration
export const DEFAULT_CONFIG: Partial<TimePickerCardConfig> = {
  hour_mode: '24',
  date_format: 'default',
  show_relative: true,
  show_quick_now: false,
};