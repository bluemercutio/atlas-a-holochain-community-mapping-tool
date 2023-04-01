import { mapState } from "./store";
import { SMITS } from "./constants";
import type { Coordinates } from "./types";

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

//Higher Order Functions

export const openMapModalAndMoveTo = (coordinates: Coordinates): void => {
  mapState.set({
    showModal: true,
    coordinates,
  });
};
