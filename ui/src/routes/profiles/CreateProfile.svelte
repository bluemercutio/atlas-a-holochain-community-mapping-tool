<!-- <script lang="ts">
import { createEventDispatcher, getContext } from 'svelte';
import type { AppAgentClient, Record, EntryHash, AgentPubKey, ActionHash } from '@holochain/client';
import { clientContext } from '../../contexts';
import type { Profile } from './types';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-textarea';

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

const dispatch = createEventDispatcher();

export let owner!: AgentPubKey;

export let closeCreateProfileModal;


let userName: string | undefined;

let errorSnackbar: Snackbar;

$: userName, owner;
$: isProfileValid = true && userName !== undefined;

async function createProfile() {  
  const profileEntry: Profile = { 
    user_name: userName!,
    owner: owner!,
  };
  
  try {
    const record: Record = await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'profiles',
      fn_name: 'create_profile',
      payload: profileEntry,
    });
    dispatch('profile-created', { profileHash: record.signed_action.hashed.hash });
  } catch (e) {
    errorSnackbar.labelText = `Error creating the profile: ${e.data.data}`;
    errorSnackbar.show();
  }
}

</script>
<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>
<div style="display: flex; flex-direction: column">
  <span style="font-size: 18px">Create Profile</span>
  

  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="User Name"  on:input={e => { userName = e.target.value;} } required></mwc-textarea>          
  </div>
            

  <mwc-button 
    raised
    label="Create Profile"
    disabled={!isProfileValid}
    on:click={() => createProfile()}
  ></mwc-button>
</div> -->
<script lang="ts">
  import { getContext } from "svelte";
  import type { AppAgentClient, Record, AgentPubKey } from "@holochain/client";
  import { clientContext } from "../../contexts";
  import type { Profile } from "./types";
  import GenericModal from "../../components/GenericModal.svelte";
  import { createEventDispatcher } from "svelte";
  import { getFieldsForCreateProfile } from "./profiles.utils";
  import type { CreateProfileForm } from "../../types/forms/form.createProfile";
  import { setClient } from "../../store/client/actions.client";

  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  export let owner!: AgentPubKey;
  export let showModal = false;

  const dispatch = createEventDispatcher();

  const createProfile = async (fieldValues: CreateProfileForm) => {
    console.log("fieldValues", fieldValues);
    const profileEntry: Profile = {
      user_name: fieldValues["username"].value,
      owner: owner,
    };

    const record: Record = await client.callZome({
      cap_secret: null,
      role_name: "tags",
      zome_name: "profiles",
      fn_name: "create_profile",
      payload: profileEntry,
    });
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
