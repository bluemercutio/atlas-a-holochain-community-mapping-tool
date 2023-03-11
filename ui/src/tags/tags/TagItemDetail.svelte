<script lang="ts">
  import { createEventDispatcher, onMount, getContext } from "svelte";
  import "@material/mwc-circular-progress";
  import { decode } from "@msgpack/msgpack";
  import type {
    Record,
    ActionHash,
    AppAgentClient,
    EntryHash,
    AgentPubKey,
  } from "@holochain/client";
  import { clientContext } from "../../contexts";
  import type { TagItem } from "./types";
  import "@material/mwc-circular-progress";
  import type { Snackbar } from "@material/mwc-snackbar";
  import "@material/mwc-snackbar";
  import "@material/mwc-icon-button";
  import EditTagItem from "./EditTagItem.svelte";

  const dispatch = createEventDispatcher();

  export let tagItemHash: ActionHash;

  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  let loading = true;
  let error: any = undefined;

  let record: Record | undefined;
  let tagItem: TagItem | undefined;

  let editing = false;

  let errorSnackbar: Snackbar;

  $: editing, error, loading, record, tagItem;

  onMount(() => fetchTagItem());

  async function fetchTagItem() {
    loading = true;
    error = undefined;
    record = undefined;
    tagItem = undefined;

    try {
      record = await client.callZome({
        cap_secret: null,
        role_name: "tags",
        zome_name: "tags",
        fn_name: "get_tag_item",
        payload: tagItemHash,
      });
      if (record) {
        tagItem = decode((record.entry as any).Present.entry) as TagItem;
      }
    } catch (e) {
      error = e;
    }

    loading = false;
  }

  async function deleteTagItem() {
    try {
      await client.callZome({
        cap_secret: null,
        role_name: "tags",
        zome_name: "tags",
        fn_name: "delete_tag_item",
        payload: tagItemHash,
      });
      dispatch("tag-item-deleted", { tagItemHash: tagItemHash });
    } catch (e: any) {
      errorSnackbar.labelText = `Error deleting the tag item: ${e.data.data}`;
      errorSnackbar.show();
    }
  }
</script>

<mwc-snackbar bind:this={errorSnackbar} leading />

{#if loading}
  <div
    style="display: flex; flex: 1; align-items: center; justify-content: center"
  >
    <mwc-circular-progress indeterminate />
  </div>
{:else if error}
  <span>Error fetching the tag item: {error.data.data}</span>
{:else if editing}
  <EditTagItem
    originalTagItemHash={tagItemHash}
    currentRecord={record}
    on:tag-item-updated={async () => {
      editing = false;
      await fetchTagItem();
    }}
    on:edit-canceled={() => {
      editing = false;
    }}
  />
{:else}
  <div style="display: flex; flex-direction: column">
    <div style="display: flex; flex-direction: row">
      <span style="flex: 1" />
      <mwc-icon-button
        style="margin-left: 8px"
        icon="edit"
        on:click={() => {
          editing = true;
        }}
      />
      <mwc-icon-button
        style="margin-left: 8px"
        icon="delete"
        on:click={() => deleteTagItem()}
      />
    </div>

    <div style="display: flex; flex-direction: row; margin-bottom: 16px">
      <span style="margin-right: 4px"><strong>Name:</strong></span>
      <span style="white-space: pre-line">{tagItem.name}</span>
    </div>
    <div style="display: flex; flex-direction: row; margin-bottom: 16px">
      <span style="margin-right: 4px"><strong>Description:</strong></span>
      <span style="white-space: pre-line">{tagItem.description}</span>
    </div>
    <div style="display: flex; flex-direction: row; margin-bottom: 16px">
      <span style="margin-right: 4px"><strong>Latitude:</strong></span>
      <span style="white-space: pre-line">{tagItem.latitude}</span>
    </div>
    <div style="display: flex; flex-direction: row; margin-bottom: 16px">
      <span style="margin-right: 4px"><strong>Longitude:</strong></span>
      <span style="white-space: pre-line">{tagItem.longitude}</span>
    </div>
    <div style="display: flex; flex-direction: row; margin-bottom: 16px">
      <button on:click={() => null}>Show on Map</button>

    </div>
  </div>
{/if}
