import type {
  AgentPubKey,
  AppAgentClient,
  Record as HRecord,
} from "@holochain/client";
import type { Profile } from "../routes/profiles/types";
import { decode } from "@msgpack/msgpack";

export const getCurrentProfile = async (
  key: AgentPubKey,
  client: AppAgentClient
) => {
  try {
    const record = await client.callZome({
      cap_secret: null,
      role_name: "tags",
      zome_name: "profiles",
      fn_name: "get_profile",
      payload: key,
    });
    if (record) {
      const profile = decode((record.entry as any).Present.entry) as Profile;
      console.log(profile);

      return profile;
    }
    console.log("none foumd");
  } catch (e) {
    console.error("error: ", e);

    return new Error(e);
  }
};
