import { writable } from "svelte/store";
import type { MapState } from "../map/type.mapState";
import type { CreateTagState } from "./type.createTag";

const initialState: CreateTagState = {
  showCreateTagModal: false,
  name: "",
  description: "",
  coordinates: { latitude: 0, longitude: 0 },
};

export const createTagState = writable<CreateTagState>(initialState);
