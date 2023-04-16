<script lang="ts">
  import { onMount, getContext } from "svelte";
  import "@material/mwc-circular-progress";
  import type {
    EntryHash,
    Record,
    AgentPubKey,
    ActionHash,
    AppAgentClient,
    NewEntryAction,
  } from "@holochain/client";
  import { clientContext } from "../../contexts";
  import TagItemDetail from "./TagItemDetail.svelte";
  import type { TagsSignal } from "./types";

  export let author: AgentPubKey;

  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  let hashes: Array<ActionHash> | undefined;
  let loading = true;
  let error: any = undefined;
  let isGridView = true;

  $: hashes, loading, error;

  onMount(async () => {
    await fetchTagItems();
    client.on("signal", (signal) => {
      if (signal.zome_name !== "tags") return;
      const payload = signal.payload as TagsSignal;
      if (payload.type !== "EntryCreated") return;
      if (payload.app_entry.type !== "TagItem") return;
      if (author.toString() !== client.myPubKey.toString()) return;
      hashes = [...hashes, payload.action.hashed.hash];
    });
  });

  async function fetchTagItems() {
    try {
      const records = await client.callZome({
        cap_secret: null,
        role_name: "tags",
        zome_name: "tags",
        fn_name: "get_all_tags",
        payload: author,
      });
      hashes = records.map((r) => r.signed_action.hashed.hash);
    } catch (e) {
      error = e;
    }
    loading = false;
  }

  function toggleView() {
    isGridView = !isGridView;
  }
</script>

{#if loading}
  <div class="loading-container">
    <mwc-circular-progress indeterminate />
  </div>
{:else if error}
  <span>Error fetching the tag items: {error.data.data}.</span>
{:else if hashes.length === 0}
  <span>No tag items found for this author.</span>
{:else}
  <div class="tags-container">
    <div class="header">
      <h2>My Tags</h2>
      <button on:click={toggleView}
        >{isGridView ? "Switch to List View" : "Switch to Grid View"}</button
      >
    </div>
    <div class={`tag-items-container ${isGridView ? "grid" : "list"}`}>
      {#each hashes as hash}
        <div
          class={`tag-item-wrapper ${isGridView ? "grid-item" : "list-item"}`}
        >
          <TagItemDetail
            tagItemHash={hash}
            on:tag-item-deleted={() => fetchTagItems()}
          />
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .loading-container {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .tags-container {
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tag-items-container.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 8px;
  }

  .tag-items-container.list {
    display: flex;
    flex-direction: column;
  }

  .tag-item-wrapper.grid-item {
    width: calc(50% - 8px);
    aspect-ratio: 1/1;
    position: relative;
    border: 2px;
    border-color: black;
    border-style: solid;
  }
  .tag-item-wrapper.list-item {
  width: 100%;
  height: auto;
  display: flex;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  padding: 5px;
}
  .tag-item-wrapper.list-item .tagItemDetail {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
  }

  .tag-item-wrapper.list-item .tagItemDetail .coordinates {
    color: grey;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
