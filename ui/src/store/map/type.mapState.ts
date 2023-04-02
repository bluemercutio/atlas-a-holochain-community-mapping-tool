export interface MapState {
  showMapModal: boolean;
  coordinates: Coordinates;
  display_mode: DisplayMode;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type DisplayModeType = "DARK" | "DEFAULT";

export interface DisplayMode {
  type: DisplayModeType;
  url: string;
  attribution: string;
}
