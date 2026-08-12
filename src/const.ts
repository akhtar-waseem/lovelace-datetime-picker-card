import * as pkg from '../package.json';

export const CARD_VERSION = pkg.version;
export const CARD_SIZE = 2; // Reduced to 2 since it's a sleek single card button

export const ENTITY_DOMAIN = 'input_datetime';

// Default Card Configuration
export const DEFAULT_HOUR_MODE = 24; // 12h or 24h for timepicker-ui