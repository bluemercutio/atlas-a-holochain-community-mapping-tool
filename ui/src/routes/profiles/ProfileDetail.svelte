<script lang="ts">
import { createEventDispatcher, onMount, getContext } from 'svelte';
import '@material/mwc-circular-progress';
import { decode } from '@msgpack/msgpack';
import type { Record, ActionHash, AppAgentClient, EntryHash, AgentPubKey } from '@holochain/client';
import { clientContext } from '../../contexts';
import type { Profile } from './types';
import '@material/mwc-circular-progress';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-snackbar';
import '@material/mwc-icon-button';
import EditProfile from './EditProfile.svelte'; 

const dispatch = createEventDispatcher();

export let profileHash: ActionHash;

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

let loading = true;
let error: any = undefined;

let record: Record | undefined;
let profile: Profile | undefined;

let editing = false;

let errorSnackbar: Snackbar;
  
$: editing,  error, loading, record, profile;

onMount(() => fetchProfile());

async function fetchProfile() {
  loading = true;
  error = undefined;
  record = undefined;
  profile = undefined;
  
  try {
    record = await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'profiles',
      fn_name: 'get_profile',
      payload: profileHash,
    });
    if (record) {
      profile = decode((record.entry as any).Present.entry) as Profile;
    }
  } catch (e) {
    error = e;
  }

  loading = false;
}

async function deleteProfile() {
  try {
    await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'profiles',
      fn_name: 'delete_profile',
      payload: profileHash,
    });
    dispatch('profile-deleted', { profileHash: profileHash });
  } catch (e: any) {
    errorSnackbar.labelText = `Error deleting the profile: ${e.data.data}`;
    errorSnackbar.show();
  }
}
</script>

<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>

{#if loading}
<div style="display: flex; flex: 1; align-items: center; justify-content: center">
  <mwc-circular-progress indeterminate></mwc-circular-progress>
</div>
{:else if error}
<span>Error fetching the profile: {error.data.data}</span>
{:else if editing}
<EditProfile
  originalProfileHash={ profileHash}
  currentRecord={record}
  on:profile-updated={async () => {
    editing = false;
    await fetchProfile()
  } }
  on:edit-canceled={() => { editing = false; } }
></EditProfile>
{:else}

<div style="display: flex; flex-direction: column">
  <div style="display: flex; flex-direction: row">
    <span style="flex: 1"></span>
    <mwc-icon-button style="margin-left: 8px" icon="edit" on:click={() => { editing = true; } }></mwc-icon-button>
    <mwc-icon-button style="margin-left: 8px" icon="delete" on:click={() => deleteProfile()}></mwc-icon-button>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>User Name:</strong></span>
    <span style="white-space: pre-line">{ profile.user_name }</span>
  </div>

</div>
{/if}

