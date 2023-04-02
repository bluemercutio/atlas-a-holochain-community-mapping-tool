<script lang="ts">
import { createEventDispatcher, getContext } from 'svelte';
import type { AppAgentClient, Record, EntryHash, AgentPubKey, ActionHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { clientContext } from '../../contexts';
import type { Community } from './types';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import type { Snackbar } from '@material/mwc-snackbar';

import '@material/mwc-checkbox';
import '@material/mwc-textarea';
import '@vaadin/date-time-picker/theme/material/vaadin-date-time-picker.js';
import '@material/mwc-formfield';
let client: AppAgentClient = (getContext(clientContext) as any).getClient();

const dispatch = createEventDispatcher();

export let originalCommunityHash!: ActionHash;

export let currentRecord!: Record;
let currentCommunity: Community = decode((currentRecord.entry as any).Present.entry) as Community;

let name: string | undefined = currentCommunity.name;
let location: string | undefined = currentCommunity.location;
let description: string | undefined = currentCommunity.description;
let createdAt: number | undefined = currentCommunity.created_at;
let public_community: boolean | undefined = currentCommunity.public_community;

let errorSnackbar: Snackbar;

$: name, location, description, createdAt, public_community;
$: isCommunityValid = true && name !== undefined && location !== undefined && description !== undefined && createdAt !== undefined && public_community !== undefined;

async function updateCommunity() {

  const community: Community = { 
    name: name!,
    location: location!,
    description: description!,
    created_at: createdAt!,
    public_community: public_community!,
    members: currentCommunity.members,
    owner: currentCommunity.owner,
  };

  try {
    const updateRecord: Record = await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'communities',
      fn_name: 'update_community',
      payload: {
        original_community_hash: originalCommunityHash,
        previous_community_hash: currentRecord.signed_action.hashed.hash,
        updated_community: community
      }
    });
  
    dispatch('community-updated', { actionHash: updateRecord.signed_action.hashed.hash });
  } catch (e) {
    errorSnackbar.labelText = `Error updating the community: ${e.data.data}`;
    errorSnackbar.show();
  }
}

</script>
<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>
<div style="display: flex; flex-direction: column">
  <span style="font-size: 18px">Edit Community</span>
  
  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Name" value={ name } on:input={e => { name = e.target.value;} } required></mwc-textarea>    
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Location" value={ location } on:input={e => { location = e.target.value;} } required></mwc-textarea>    
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Description" value={ description } on:input={e => { description = e.target.value;} } required></mwc-textarea>    
  </div>

  <div style="margin-bottom: 16px">
    <vaadin-date-time-picker label="Created At" value={new Date(createdAt / 1000).toISOString()} on:change={e => { createdAt = new Date(e.target.value).valueOf() * 1000;} } required></vaadin-date-time-picker>    
  </div>

  <div style="margin-bottom: 16px">
    <mwc-formfield label="Public">
      <mwc-checkbox checked={ public_community } on:change={e => { public_community = e.target.checked;} }></mwc-checkbox>
    </mwc-formfield>    
  </div>


  <div style="display: flex; flex-direction: row">
    <mwc-button
      outlined
      label="Cancel"
      on:click={() => dispatch('edit-canceled')}
      style="flex: 1; margin-right: 16px"
    ></mwc-button>
    <mwc-button 
      raised
      label="Save"
      disabled={!isCommunityValid}
      on:click={() => updateCommunity()}
      style="flex: 1;"
    ></mwc-button>
  </div>
</div>
