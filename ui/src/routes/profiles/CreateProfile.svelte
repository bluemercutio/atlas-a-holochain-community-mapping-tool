
<script lang="ts">
  import { getContext } from "svelte";
  import type { AppAgentClient, Record, AgentPubKey } from "@holochain/client";
  import { clientContext } from "../../contexts";
  import type { Profile } from "./types";
  import GenericModal from "../../components/GenericModal.svelte";
  import { createEventDispatcher } from "svelte";
  import { getFieldsForCreateProfile } from "./profiles.utils";
  import { setClient } from "../../store/client/actions.client";
  import { api } from "../../api";

  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  export let owner!: AgentPubKey;
  export let showModal = false;

  const dispatch = createEventDispatcher();

  const createProfile = async (fieldValues: Profile) => {
    console.log("fieldValues ", fieldValues.user_name);
    const profileEntry: Profile = {
      user_name: fieldValues.user_name,
      owner: owner,
    };
    console.log("profileEntry ", profileEntry)

    const record = await api.createProfile(client, profileEntry)
    return { profileHash: record.signed_action.hashed.hash };
  };

  const updateParent = () => {
    dispatch("child-update", showModal);
  };

  const closeCreateProfileModal = (e, success = false) => {
    if (e.target.className === "backdrop" || success) {
      showModal = false;
      updateParent();
    }
  };
  const setStoreClient = (client: AppAgentClient, profile: Profile) => {
    setClient(client, profile)
  };
</script>

{#if showModal}
  <GenericModal
    title="Create Profile"
    fields={getFieldsForCreateProfile()}
    createItemFunction={createProfile}
    updateStoreFunction={setStoreClient}
    closeFunction={closeCreateProfileModal}
    itemType="profile"
  />
{/if}
