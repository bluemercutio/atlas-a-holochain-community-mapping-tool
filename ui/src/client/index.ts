import type {
  AgentPubKey,
  AppAgentClient,
  Record as HRecord,
} from "@holochain/client";
import type { Profile } from "../routes/profiles/types";
import { decode } from "@msgpack/msgpack";
import type { TagItem } from "../routes/tags/types";
import type { CreateTagForm } from "../types/forms/createTag";

export const getCurrentProfile = async (
  key: AgentPubKey,
  client: AppAgentClient
) => {
  try {
    console.log("Fetch data: ", { key, client });
    const record = await client.callZome({
      cap_secret: null,
      role_name: "tags",
      zome_name: "profiles",
      fn_name: "get_profiles_for_owner",
      payload: key,
    });
    if (record) {
      console.log("Record found. Record: ", record);
      const profile = decode((record[0].entry as any).Present.entry) as Profile;
      console.log("Profile: ", profile);

      return profile;
    }
    console.log("none foumd");
  } catch (e) {
    console.error("error trying to get current profile: ", e);

    return new Error(e);
  }
};

export const createTagItem = async (
  client: AppAgentClient,
  fieldValues: CreateTagForm
) => {
  const tagItemEntry: TagItem = {
    name: fieldValues["Name"],
    description: fieldValues["Description"],
    latitude: fieldValues["Latitude"],
    longitude: fieldValues["Longitude"],
  };

  const record = await client.callZome({
    cap_secret: null,
    role_name: "tags",
    zome_name: "tags",
    fn_name: "create_tag_item",
    payload: tagItemEntry,
  });

  return {
    tagItemHash: record.signed_action.hashed.hash,
  };
};
