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
  import { getContext } from 'svelte';
  import type { AppAgentClient, Record, AgentPubKey } from '@holochain/client';
  import { clientContext } from '../../contexts';
  import type { Profile } from './types';
  import GenericModal from '../../components/Modal.svelte';
  import { createEventDispatcher } from 'svelte';

  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  export let owner!: AgentPubKey;
  export let showModal = false;

  const dispatch = createEventDispatcher();

  async function createProfile(fieldValues) {
    const profileEntry: Profile = {
      user_name: fieldValues["User Name"],
      owner: owner!,
    };

    const record: Record = await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'profiles',
      fn_name: 'create_profile',
      payload: profileEntry,
    });
    return { profileHash: record.signed_action.hashed.hash };
  }

  function updateParent() {
    dispatch('child-update', showModal);
  }

  function closeCreateProfileModal(e, success = false) {
    if (e.target.className === "backdrop" || success) {
      showModal = false;
      updateParent();
    }
  }
</script>

{#if showModal}
  <GenericModal
    title="Create Profile"
    fields={[{ label: "User Name", required: true }]}
    createItemFunction={createProfile}
    closeFunction={closeCreateProfileModal}
    itemType="profile"
  />
{/if}
