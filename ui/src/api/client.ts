import { decode } from "@msgpack/msgpack";
import type {
  Record as RecordH,
  AppAgentClient,
  EntryHash,
  AgentPubKey,
} from "@holochain/client";
import * as TE from "fp-ts/TaskEither";
import { api_config } from "./constants";
import type { ZomeDetailTypes, ZomeListTypes } from "./tags/tags.types";
import { pipe } from "fp-ts/lib/function";
import type { UpdateTagItem } from "../routes/tags/types";

export const createItem = (
  client: AppAgentClient,
  itemType: string,
  data: ZomeDetailTypes
): TE.TaskEither<Error, ZomeDetailTypes> =>
  TE.tryCatch(
    () =>
      client.callZome({
        cap_secret: null,
        role_name: api_config[itemType].create.role_name,
        zome_name: api_config[itemType].create.zome_name,
        fn_name: api_config[itemType].create.fn_name,
        payload: data,
      }) as Promise<ZomeDetailTypes>,
    (error) => error as Error
  );

export const getItem = (
  client: AppAgentClient,
  itemType: string,
  itemId: EntryHash
): TE.TaskEither<Error, ZomeDetailTypes> =>
  TE.tryCatch(
    () =>
      client.callZome({
        cap_secret: null,
        role_name: api_config[itemType].get.role_name,
        zome_name: api_config[itemType].get.zome_name,
        fn_name: api_config[itemType].get.fn_name,
        payload: itemId,
      }) as Promise<ZomeDetailTypes>,
    (error) => error as Error
  );

export const updateItem = (
  client: AppAgentClient,
  itemType: string,
  payload: UpdateTagItem
): TE.TaskEither<Error, ZomeDetailTypes> =>
  TE.tryCatch(
    () =>
      client.callZome({
        cap_secret: null,
        role_name: api_config[itemType].update.role_name,
        zome_name: api_config[itemType].update.zome_name,
        fn_name: api_config[itemType].update.fn_name,
        payload: payload,
      }) as Promise<ZomeDetailTypes>,
    (error) => error as Error
  );

export const deleteItem = (
  client: AppAgentClient,
  itemType: string,
  itemId: EntryHash
): TE.TaskEither<Error, ZomeDetailTypes> =>
  TE.tryCatch(
    () =>
      client.callZome({
        cap_secret: null,
        role_name: api_config[itemType].update.role_name,
        zome_name: api_config[itemType].update.zome_name,
        fn_name: api_config[itemType].update.fn_name,
        payload: itemId,
      }) as Promise<ZomeDetailTypes>,
    (error) => error as Error
  );

export const getAllItems = (
  client: AppAgentClient,
  itemType: string
): TE.TaskEither<Error, ZomeListTypes[]> =>
  pipe(
    TE.tryCatch(
      () =>
        client.callZome({
          cap_secret: null,
          role_name: api_config[itemType].get_all.role_name,
          zome_name: api_config[itemType].get_all.zome_name,
          fn_name: api_config[itemType].get_all.fn_name,
          payload: null,
        }) as Promise<RecordH[]>,
      (error) => error as Error
    ),
    TE.map(
      (records: RecordH[]) =>
        records.map((record) =>
          decode((record.entry as any).Present.entry)
        ) as ZomeListTypes[]
    )
  );
