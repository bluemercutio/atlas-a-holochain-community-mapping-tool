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
  import { openMapModalAndMoveTo } from "../../store/map/actions.mapState";
  import { mapState } from "../../store/map";

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

  const handleMapModal = (
    e: MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement;
    }
  ) => {
    e.preventDefault();
    console.log("handleMapModal");
    openMapModalAndMoveTo(
      {
        latitude: parseFloat(tagItem.latitude),
        longitude: parseFloat(tagItem.longitude),
      },
      $mapState.display_mode
    );
  };
</script>

<mwc-snackbar bind:this={errorSnackbar} leading />

{#if loading}
  <div class="loading-container">
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
  <div class="tag-item-container">
    <div class="tag-item-header">
      <h3>{tagItem.name}</h3>
      <div class="icon-buttons">
        <mwc-icon-button
          class="icon-button"
          icon="edit"
          on:click={() => {
            editing = true;
          }}
        />
        <mwc-icon-button
          class="icon-button"
          icon="delete"
          on:click={() => deleteTagItem()}
        />
      </div>
    </div>
    <div class="tag-item-row">
      <span class="value">{tagItem.description}</span>
    </div>
    <div class="tag-item-row">
      <div class="coordinates">
        <span class="label">Coordinates</span>
      </div>
    </div>
    <div class="tag-item-row">
      <div class="coordinates">
        <span class="value">{tagItem.latitude}</span>
      </div>
      <div class="spacer">|</div>
      <div class="coordinates">
        <span class="value">{tagItem.longitude}</span>
      </div>
    </div>
    <div class="tag-item-row">
      <button class="show-map-button" on:click={(e) => handleMapModal(e)}>
        Show on Map
      </button>
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

  .tag-item-container {
    display: flex;
    flex-direction: column;
  }

  .tag-item-header {
    display: flex;
    flex-direction: row;
  }

  .spacer {
    flex: 2;
  }

  .icon-button {
    margin-left: 8px;
  }

  .tag-item-row {
    display: flex;
    flex-direction: row;
    margin-bottom: 16px;
  }

  .label {
    margin-right: 4px;
    font-family: "Roboto", sans-serif;
  }

  .value {
    white-space: pre-line;
    font-family: "Roboto Mono", monospace;
    font-size: 10px;
  }

  .show-map-button {
    border: 1px solid black;
    padding: 4px 8px;
    background-color: transparent;
    font-family: "Roboto", sans-serif;
    font-size: 14px;
    cursor: pointer;
  }

  .show-map-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .tag-item-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .icon-buttons {
    display: flex;
    flex-direction: row;
  }

  /* Update the styles for .coordinates */
  .coordinates {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    align-items: start;
  }
</style>
