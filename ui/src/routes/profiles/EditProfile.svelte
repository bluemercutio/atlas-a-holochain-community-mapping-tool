<script lang="ts">
import { createEventDispatcher, getContext } from 'svelte';
import type { AppAgentClient, Record, EntryHash, AgentPubKey, ActionHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { clientContext } from '../../contexts';
import type { Profile } from './types';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import type { Snackbar } from '@material/mwc-snackbar';

import '@material/mwc-textarea';
let client: AppAgentClient = (getContext(clientContext) as any).getClient();

const dispatch = createEventDispatcher();

export let originalProfileHash!: ActionHash;

export let currentRecord!: Record;
let currentProfile: Profile = decode((currentRecord.entry as any).Present.entry) as Profile;

let userName: string | undefined = currentProfile.user_name;

let errorSnackbar: Snackbar;

$: userName ;
$: isProfileValid = true && userName !== undefined;

async function updateProfile() {

  const profile: Profile = { 
    user_name: userName!,
    owner: currentProfile.owner,
  };

  try {
    const updateRecord: Record = await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'profiles',
      fn_name: 'update_profile',
      payload: {
        original_profile_hash: originalProfileHash,
        previous_profile_hash: currentRecord.signed_action.hashed.hash,
        updated_profile: profile
      }
    });
  
    dispatch('profile-updated', { actionHash: updateRecord.signed_action.hashed.hash });
  } catch (e) {
    errorSnackbar.labelText = `Error updating the profile: ${e.data.data}`;
    errorSnackbar.show();
  }
}

</script>
<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>
<div style="display: flex; flex-direction: column">
  <span style="font-size: 18px">Edit Profile</span>
  
  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="User Name" value={ userName } on:input={e => { userName = e.target.value;} } required></mwc-textarea>    
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
      disabled={!isProfileValid}
      on:click={() => updateProfile()}
      style="flex: 1;"
    ></mwc-button>
  </div>
</div>
