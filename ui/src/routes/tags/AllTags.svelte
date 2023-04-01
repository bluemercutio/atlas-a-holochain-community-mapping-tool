<script lang="ts">
import { onMount, getContext } from 'svelte';
import '@material/mwc-circular-progress';
import type { EntryHash, Record, AgentPubKey, ActionHash, AppAgentClient, NewEntryAction } from '@holochain/client';
import { clientContext } from '../../contexts';
import TagItemDetail from './TagItemDetail.svelte';
import type { TagsSignal } from './types';

export let author: AgentPubKey;

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

let hashes: Array<ActionHash> | undefined;
let loading = true;
let error: any = undefined;

$: hashes, loading, error;

onMount(async () => {
  await fetchTagItems();
  client.on('signal', signal => {
    if (signal.zome_name !== 'tags') return;
    const payload = signal.payload as TagsSignal;
    if (payload.type !== 'EntryCreated') return;
    if (payload.app_entry.type !== 'TagItem') return;
    if (author.toString() !== client.myPubKey.toString()) return;
    hashes = [...hashes, payload.action.hashed.hash];
  });
});

async function fetchTagItems() {
  try {
    const records = await client.callZome({
      cap_secret: null,
      role_name: 'tags',
      zome_name: 'tags',
      fn_name: 'get_all_tags',
      payload: author,
    });
    hashes = records.map(r => r.signed_action.hashed.hash);
  } catch (e) {
    error = e;
  }
  loading = false;
}

</script>

{#if loading}
<div style="display: flex; flex: 1; align-items: center; justify-content: center">
  <mwc-circular-progress indeterminate></mwc-circular-progress>
</div>
{:else if error}
<span>Error fetching the tag items: {error.data.data}.</span>
{:else if hashes.length === 0}
<span>No tag items found for this author.</span>
{:else}
<div style="display: flex; flex-direction: column">
  <h2>My Tags</h2>
  {#each hashes as hash}
    <div style="margin-bottom: 8px;">
      <TagItemDetail tagItemHash={hash}  on:tag-item-deleted={() => fetchTagItems()}></TagItemDetail>
    </div>
  {/each}
</div>
{/if}

