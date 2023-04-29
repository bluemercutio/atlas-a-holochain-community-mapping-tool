import { decode } from "@msgpack/msgpack";
import type {
  Record as RecordH,
  AppAgentClient,
  EntryHash,
  AgentPubKey,
} from "@holochain/client";
import * as TE from "fp-ts/TaskEither";
import { api_config } from "./constants";
import type {
  UpdateZomeDetailType,
  ZomeDetailTypes,
  ZomeListTypes,
} from "./tags/tags.types";
import { pipe } from "fp-ts/lib/function";
import type { UpdateTagItem } from "../routes/tags/types";
import type { mdiArchiveSync } from "@mdi/js";

export const createItem = async (
  client: AppAgentClient,
  itemType: string,
  data: ZomeDetailTypes
): Promise<any> => {
  try {
    console.log(
      "api_config",
      api_config[itemType].create.role_name,
      "itemType",
      itemType
    );
    const res = await client.callZome({
      cap_secret: null,
      role_name: "tags",
      zome_name: api_config[itemType].create.zome_name,
      fn_name: api_config[itemType].create.fn_name,
      payload: data,
    });
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const getItem = async (
  client: AppAgentClient,
  itemType: string,
  itemId: EntryHash | AgentPubKey
): Promise<ZomeDetailTypes> => {
  try {
    const res = await client.callZome({
      cap_secret: null,
      role_name: "tags",
      zome_name: api_config[itemType].get.zome_name,
      fn_name: api_config[itemType].get.fn_name,
      payload: itemId,
    });
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const updateItem = async (
  client: AppAgentClient,
  itemType: string,
  payload: UpdateZomeDetailType
): Promise<ZomeDetailTypes> => {
  try {
    const res = await client.callZome({
      cap_secret: null,
      role_name: "tags",
      zome_name: api_config[itemType].update.zome_name,
      fn_name: api_config[itemType].update.fn_name,
      payload: payload,
    });
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const deleteItem = async (
  client: AppAgentClient,
  itemType: string,
  itemId: EntryHash
): Promise<ZomeDetailTypes> => {
  try {
    const res = (await client.callZome({
      cap_secret: null,
      role_name: "tags",
      zome_name: api_config[itemType].update.zome_name,
      fn_name: api_config[itemType].update.fn_name,
      payload: itemId,
    })) as ZomeDetailTypes;
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const getAllItems = async (
  client: AppAgentClient,
  itemType: string
): Promise<ZomeListTypes> => {
  try {
    const res = await client.callZome({
      cap_secret: null,
      role_name: "tags",
      zome_name: api_config[itemType].get_all.zome_name,
      fn_name: api_config[itemType].get_all.fn_name,
      payload: null,
    });
    const decodedValues = res.map((i: RecordH) =>
      decode((i.entry as any).Present.entry)
    );
    return decodedValues;
  } catch (error) {
    console.error(error);
  }
};
