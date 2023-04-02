<script lang="ts">
import { createEventDispatcher, getContext } from 'svelte';
import type { AppAgentClient, Record, EntryHash, AgentPubKey, ActionHash } from '@holochain/client';
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

export let members!: Array<AgentPubKey>;

export let owner!: AgentPubKey;


let name: string | undefined;
let location: string | undefined;
let description: string | undefined;
let createdAt: number | undefined;
let public_community: boolean | undefined;

let errorSnackbar: Snackbar;

$: name, location, description, members, owner, createdAt, public_community;
$: isCommunityValid = true && name !== undefined && location !== undefined && description !== undefined && createdAt !== undefined && public_community !== undefined;

async function createCommunity() {  
  const communityEntry: Community = { 
    name: name!,
    location: location!,
    description: description!,
    members: members,
    owner: owner!,
    created_at: createdAt!,
    public_community: public_community!,
  };
  
  try {
    const record: Record = await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'communities',
      fn_name: 'create_community',
      payload: communityEntry,
    });
    dispatch('community-created', { communityHash: record.signed_action.hashed.hash });
  } catch (e) {
    errorSnackbar.labelText = `Error creating the community: ${e.data.data}`;
    errorSnackbar.show();
  }
}

</script>
<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>
<div style="display: flex; flex-direction: column">
  <span style="font-size: 18px">Create Community</span>
  

  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Name"  on:input={e => { name = e.target.value;} } required></mwc-textarea>          
  </div>
            
  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Location"  on:input={e => { location = e.target.value;} } required></mwc-textarea>          
  </div>
            
  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Description"  on:input={e => { description = e.target.value;} } required></mwc-textarea>          
  </div>
            
  <div style="margin-bottom: 16px">
    <vaadin-date-time-picker label="Created At"  on:change={e => { createdAt = new Date(e.target.value).valueOf() * 1000;} } required></vaadin-date-time-picker>          
  </div>
            
  <div style="margin-bottom: 16px">
    <mwc-formfield label="Public">
      <mwc-checkbox  on:change={e => { public_community = e.target.checked;} }></mwc-checkbox>
    </mwc-formfield>          
  </div>
            

  <mwc-button 
    raised
    label="Create Community"
    disabled={!isCommunityValid}
    on:click={() => createCommunity()}
  ></mwc-button>
</div>
