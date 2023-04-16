import { writable } from "svelte/store";
import type { MapState } from "../map/type.mapState";
import type { TagStore } from "./types.tags";

const initialState: TagStore = {
  createTagState: {
    showCreateTagModal: false,
    name: "",
    description: "",
    coordinates: { latitude: 0, longitude: 0 },
  },
  allTags: [],
};

export const createTagState = writable<TagStore>(initialState);
