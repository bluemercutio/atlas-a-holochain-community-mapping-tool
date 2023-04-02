import { mapState } from "./store";
import { SMITS } from "./constants";
import type { Coordinates, DisplayMode } from "./types";
import {
  darkDisplayMode,
  defaultDisplayMode,
} from "../components/map/map.constants";

export const openMapModal = (): void => {
  mapState.update((state) => ({
    ...state,
    showModal: true,
  }));
};

export const closeMapModal = (): void => {
  mapState.update((state) => ({
    ...state,
    showModal: false,
  }));
};

export const moveMapTo = (coordinates: Coordinates): void => {
  mapState.update((state) => ({
    ...state,
    coordinates,
  }));
};

export const openMapModalAndMoveTo = (
  coordinates: Coordinates,
  display_mode: DisplayMode
): void => {
  mapState.set({
    showModal: true,
    coordinates,
    display_mode: display_mode,
  });
};

export const toggleDisplayMode = () => {
  mapState.update((state) => ({
    ...state,
    display_mode:
      state.display_mode.type === "DARK" ? defaultDisplayMode : darkDisplayMode,
  }));
};
