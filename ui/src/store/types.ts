export interface MapState {
  showModal: boolean;
  coordinates: Coordinates;
  display_mode: DisplayMode;
}

export type Coordinates = [number, number];

export type DisplayModeType = "DARK" | "DEFAULT";

export interface DisplayMode {
  type: DisplayModeType;
  url: string;
  attribution: string;
}
