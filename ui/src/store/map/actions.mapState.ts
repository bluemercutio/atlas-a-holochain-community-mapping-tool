import { mapState } from ".";
import { SMITS } from "./constants.mapState";
import type { Coordinates, DisplayMode } from "./type.mapState";
import {
  darkDisplayMode,
  defaultDisplayMode,
} from "../../components/map/map.constants";
import { createTagState } from "../tag";

export const openMapModal = (): void => {
  mapState.update((state) => ({
    ...state,
    showCreateTagModal: false,
    showMapModal: true,
  }));
};

export const closeMapModal = (): void => {
  mapState.update((state) => ({
    ...state,
    showMapModal: false,
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
    showMapModal: true,
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
