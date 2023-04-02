<script lang="ts">
import { createEventDispatcher, onMount, getContext } from 'svelte';
import '@material/mwc-circular-progress';
import { decode } from '@msgpack/msgpack';
import type { Record, ActionHash, AppAgentClient, EntryHash, AgentPubKey } from '@holochain/client';
import { clientContext } from '../../contexts';
import type { Community } from './types';
import '@material/mwc-circular-progress';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-snackbar';
import '@material/mwc-icon-button';
import EditCommunity from './EditCommunity.svelte'; 

const dispatch = createEventDispatcher();

export let communityHash: ActionHash;

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

let loading = true;
let error: any = undefined;

let record: Record | undefined;
let community: Community | undefined;

let editing = false;

let errorSnackbar: Snackbar;
  
$: editing,  error, loading, record, community;

onMount(() => fetchCommunity());

async function fetchCommunity() {
  loading = true;
  error = undefined;
  record = undefined;
  community = undefined;
  
  try {
    record = await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'communities',
      fn_name: 'get_community',
      payload: communityHash,
    });
    if (record) {
      community = decode((record.entry as any).Present.entry) as Community;
    }
  } catch (e) {
    error = e;
  }

  loading = false;
}

async function deleteCommunity() {
  try {
    await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'communities',
      fn_name: 'delete_community',
      payload: communityHash,
    });
    dispatch('community-deleted', { communityHash: communityHash });
  } catch (e: any) {
    errorSnackbar.labelText = `Error deleting the community: ${e.data.data}`;
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
<span>Error fetching the community: {error.data.data}</span>
{:else if editing}
<EditCommunity
  originalCommunityHash={ communityHash}
  currentRecord={record}
  on:community-updated={async () => {
    editing = false;
    await fetchCommunity()
  } }
  on:edit-canceled={() => { editing = false; } }
></EditCommunity>
{:else}

<div style="display: flex; flex-direction: column">
  <div style="display: flex; flex-direction: row">
    <span style="flex: 1"></span>
    <mwc-icon-button style="margin-left: 8px" icon="edit" on:click={() => { editing = true; } }></mwc-icon-button>
    <mwc-icon-button style="margin-left: 8px" icon="delete" on:click={() => deleteCommunity()}></mwc-icon-button>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Name:</strong></span>
    <span style="white-space: pre-line">{ community.name }</span>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Location:</strong></span>
    <span style="white-space: pre-line">{ community.location }</span>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Description:</strong></span>
    <span style="white-space: pre-line">{ community.description }</span>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Created At:</strong></span>
    <span style="white-space: pre-line">{ new Date(community.created_at / 1000).toLocaleString() }</span>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Public:</strong></span>
    <span style="white-space: pre-line">{ community.public_community ? 'Yes' : 'No' }</span>
  </div>

</div>
{/if}

