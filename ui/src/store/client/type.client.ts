import type { AgentPubKey, AppAgentClient } from "@holochain/client";
import type { Coordinates } from "../map/type.mapState";
import type { Profile } from "../../routes/profiles/types";

export interface Client {
  client: AppAgentClient;
  pub_key: AgentPubKey;
  profile: Profile;
}
