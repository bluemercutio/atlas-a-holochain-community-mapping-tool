import type { DisplayMode } from "../../store/types";

export const defaultDisplayMode: DisplayMode = {
  type: "DEFAULT",
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "Map data &copy; OpenStreetMap contributors",
};

export const darkDisplayMode: DisplayMode = {
  type: "DARK",
  url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
};
