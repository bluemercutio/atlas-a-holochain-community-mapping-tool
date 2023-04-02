import { writable } from "svelte/store";
import type { Client } from "./type.client";

const initialState: Client = {
  client: null,
  pub_key: null,
  profile: null,
};

export const clientState = writable<Client>(initialState);
