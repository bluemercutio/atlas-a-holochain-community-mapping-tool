import type {
  AgentPubKey,
  AppAgentClient,
  Record as RecordH,
} from "@holochain/client";
import { createItem, getAllItems, getItem, updateItem } from "./client";
import type { TagItem, UpdateTagItem } from "../routes/tags/types";
import type { Profile, UpdateProfile } from "../routes/profiles/types";
import { flap } from "fp-ts/lib/Functor";
import { flow } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";

export const api = {
  getAllTags: async (client: AppAgentClient, itemId: Uint8Array) => {
    try {
      const res = await getAllItems(client, "tags");
      return res;
    } catch (error) {
      console.error(error);
    }
  },
  getTag: async (client: AppAgentClient, itemId: Uint8Array) => {
    try {
      const res = await getItem(client, "tags", itemId);
      return res;
    } catch (error) {
      console.error(error);
    }
  },
  createTag: async (client: AppAgentClient, data: TagItem) => {
    try {
      const res = await createItem(client, "tags", data);
      return res;
    } catch (error) {
      console.error(error);
    }
  },
  updateTag: async (client: AppAgentClient, payload: UpdateTagItem) => {
    try {
      const res = await updateItem(client, "tags", payload);
      return res;
    } catch (error) {
      console.error(error);
    }
  },
  getAllProfiles: async (client: AppAgentClient, itemId: Uint8Array) => {
    try {
      const res = await getAllItems(client, "profiles");
      return res;
    } catch (error) {
      console.error(error);
    }
  },
  getProfile: async (client: AppAgentClient, agentKey: AgentPubKey) => {
    try {
      const res = await getItem(client, "profiles", agentKey);
      return res;
    } catch (error) {
      console.error(error);
    }
  },
  createProfile: async (client: AppAgentClient, data: Profile) => {
    const res = await createItem(client, "profiles", data);
    return res;
  },
  updateProfile: async (client: AppAgentClient, payload: UpdateProfile) => {
    try {
      const res = await updateItem(client, "profiles", payload);
      return res;
    } catch (error) {
      console.error(error);
    }
  },
};
