<script lang="ts">
import { createEventDispatcher, getContext } from 'svelte';
import type { AppAgentClient, Record, EntryHash, AgentPubKey, ActionHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { clientContext } from '../../contexts';
import type { TagItem } from './types';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-textarea';

import '@material/mwc-textfield';
let client: AppAgentClient = (getContext(clientContext) as any).getClient();

const dispatch = createEventDispatcher();

export let originalTagItemHash!: ActionHash;

export let currentRecord!: Record;
let currentTagItem: TagItem = decode((currentRecord.entry as any).Present.entry) as TagItem;

let name: string | undefined = currentTagItem.name;
let description: string | undefined = currentTagItem.description;
let coordinates: string | undefined = currentTagItem.coordinates;

let errorSnackbar: Snackbar;

$: name, description, coordinates;
$: isTagItemValid = true && name !== undefined && description !== undefined && coordinates !== undefined;

async function updateTagItem() {

  const tagItem: TagItem = { 
    name: name!,
    description: description!,
    coordinates: coordinates!,
  };

  try {
    const updateRecord: Record = await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'tags',
      fn_name: 'update_tag_item',
      payload: {
        original_tag_item_hash: originalTagItemHash,
        previous_tag_item_hash: currentRecord.signed_action.hashed.hash,
        updated_tag_item: tagItem
      }
    });
  
    dispatch('tag-item-updated', { actionHash: updateRecord.signed_action.hashed.hash });
  } catch (e) {
    errorSnackbar.labelText = `Error updating the tag item: ${e.data.data}`;
    errorSnackbar.show();
  }
}

</script>
<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>
<div style="display: flex; flex-direction: column">
  <span style="font-size: 18px">Edit TagItem</span>
  
  <div style="margin-bottom: 16px">
    <mwc-textfield outlined label="Name" value={ name } on:input={e => { name = e.target.value; } } required></mwc-textfield>    
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Description" value={ description } on:input={e => { description = e.target.value;} } required></mwc-textarea>    
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Coordinates" value={ coordinates } on:input={e => { coordinates = e.target.value;} } required></mwc-textarea>    
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
      disabled={!isTagItemValid}
      on:click={() => updateTagItem()}
      style="flex: 1;"
    ></mwc-button>
  </div>
</div>
