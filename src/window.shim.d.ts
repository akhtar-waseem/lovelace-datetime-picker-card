export interface CustomCardSuggestion {
  config: Record<string, unknown>;
}

export interface CustomCardEntry {
  type: string;
  name?: string;
  description?: string;
  preview?: boolean;
  getEntitySuggestion?: (
    hass: unknown,
    entityId: string
  ) => CustomCardSuggestion | CustomCardSuggestion[] | null;
}

declare global {
  interface Window {
    customCards: Array<CustomCardEntry>;
  }
}
