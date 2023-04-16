import type { AppAgentClient, Record as RecordH } from "@holochain/client";
import { createItem, getAllItems, getItem, updateItem } from "./client";
import type { TagItem, UpdateTagItem } from "../routes/tags/types";

export const api = {
  getAllTags: async (client: AppAgentClient, itemId: Uint8Array) => {
    try {
      const res = await getAllItems(client, "tags")();
      return res;
    } catch (error) {
      console.error(error);
    }
  },
  getTag: async (client: AppAgentClient, itemId: Uint8Array) => {
    try {
      const res = await getItem(client, "tags", itemId)();
      return res;
    } catch (error) {
      console.error(error);
    }
  },
  createTag: async (client: AppAgentClient, data: TagItem) => {
    try {
      const res = await createItem(client, "tags", data)();
      return res;
    } catch (error) {
      console.error(error);
    }
  },
  updateTag: async (client: AppAgentClient, payload: UpdateTagItem) => {
    try {
      const res = await updateItem(client, "tags", payload)();
      return res;
    } catch (error) {
      console.error(error);
    }
  },
};
