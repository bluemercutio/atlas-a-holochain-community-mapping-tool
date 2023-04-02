import type { AgentPubKey, AppAgentClient } from "@holochain/client";
import { clientState } from ".";
import type { Coordinates } from "../map/type.mapState";
import type { Profile } from "../../routes/profiles/types";

export const setClient = (client: AppAgentClient, profile: Profile): void => {
  clientState.set({
    client,
    pub_key: client.myPubKey,
    profile,
  });
};
