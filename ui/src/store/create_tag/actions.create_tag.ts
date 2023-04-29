import { CreateTagStore } from ".";
import type { TagItem } from "../../routes/tags/types";
import type { Coordinates } from "../map/type.mapState";

export const openCreateTagModal = (coordinates: Coordinates): void => {
  CreateTagStore.update((state) => ({
    ...state,

    showCreateTagModal: true,
    coordinates: coordinates,
  }));
};

export const closeCreateTagModal = (): void => {
  CreateTagStore.update((state) => ({
    ...state,
    showCreateTagModal: false,
  }));
};
