import { writable } from "svelte/store";
import type { MapState } from "../map/type.mapState";
import type { AllTags } from "./types.all_tags.ts";

const initialState = [];

export const AllTagsStore = writable<AllTags>(initialState);
