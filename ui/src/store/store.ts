import { writable } from "svelte/store";
import { SMITS } from "./constants";
import type { MapState } from "./types";

const initialState: MapState = {
  showModal: false,
  coordinates: SMITS,
};

export const mapState = writable<MapState>(initialState);
