import { writable } from "svelte/store";
import { SMITS } from "./constants.mapState";
import type { MapState } from "./type.mapState";

const initialState: MapState = {
  showMapModal: false,
  coordinates: SMITS,
  display_mode: {
    type: "DEFAULT",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "Map data &copy; OpenStreetMap contributors",
  },
};

export const mapState = writable<MapState>(initialState);
