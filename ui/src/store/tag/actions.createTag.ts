import { createTagState } from ".";
import type { Coordinates } from "../map/type.mapState";

export const openCreateTagModal = (coordinates: Coordinates): void => {
  createTagState.update((state) => ({
    ...state,
    showCreateTagModal: true,
    coordinates: coordinates,
  }));
};

export const closeCreateTagModal = (): void => {
  createTagState.update((state) => ({
    ...state,
    showCreateTagModal: false,
  }));
};
