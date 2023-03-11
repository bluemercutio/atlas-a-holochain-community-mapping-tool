<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type {
    AppAgentClient,
    Record,
    EntryHash,
    AgentPubKey,
    ActionHash,
  } from "@holochain/client";
  import { clientContext } from "../../contexts";
  import type { TagItem } from "./types";
  import "@material/mwc-button";
  import "@material/mwc-snackbar";
  import type { Snackbar } from "@material/mwc-snackbar";
  import "@material/mwc-textfield";
  import "@material/mwc-textarea";

  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  const dispatch = createEventDispatcher();

  export let closeCreateTagModal;

  let name: string | undefined;
  let description: string | undefined;
  let latitude: string | undefined;
  let longitude: string | undefined;

  let errorSnackbar: Snackbar;

  $: name, description;
  $: isTagItemValid =
    true &&
    name !== undefined &&
    description !== undefined &&
    latitude !== undefined &&
    longitude !== undefined;

  async function createTagItem(e) {
    const tagItemEntry: TagItem = {
      name: name!,
      description: description!,
      latitude: latitude!,
      longitude: longitude!,
    };

    try {
      const record: Record = await client.callZome({
        cap_secret: null,
        role_name: "tags",
        zome_name: "tags",
        fn_name: "create_tag_item",
        payload: tagItemEntry,
      });
      dispatch("tag-item-created", {
        tagItemHash: record.signed_action.hashed.hash,
      });
      console.log(e.target);
      closeCreateTagModal(e, true);
    } catch (e) {
      errorSnackbar.labelText = `Error creating the tag item: ${e.data.data}`;
      errorSnackbar.show();
    }
  }
</script>

<mwc-snackbar bind:this={errorSnackbar} leading />
<div class="backdrop" on:click={(e) => closeCreateTagModal(e)}>
  <div class="modal">
    <div style="display: flex; flex-direction: column">
      <span style="font-size: 18px">Create a tag</span>

      <div style="margin-bottom: 16px">
        <mwc-textfield
          outlined
          label="Name"
          on:input={(e) => {
            name = e.target.value;
          }}
          required
        />
      </div>

      <div style="margin-bottom: 16px">
        <mwc-textarea
          outlined
          label="Description"
          on:input={(e) => {
            description = e.target.value;
          }}
          required
        />
      </div>
      <div style="margin-bottom: 16px">
        <mwc-textarea
          outlined
          label="Latitude"
          on:input={(e) => {
            latitude = e.target.value;
          }}
          required
        />
      </div>
      <div style="margin-bottom: 16px">
        <mwc-textarea
          outlined
          label="Longitude"
          on:input={(e) => {
            longitude = e.target.value;
          }}
          required
        />
      </div>

      <mwc-button
        raised
        label="Create TagItem"
        disabled={!isTagItemValid}
        on:click={(e) => createTagItem(e)}
      />
      <mwc-button
        class="close-button"
        raised
        label="Close"
        on:click={closeCreateTagModal}
      />
      <!-- <button class="close-button"  on:click={closeCreateTagModal}>Close</button> -->
    </div>
  </div>
</div>

<style>
  .backdrop {
    width: 100%;
    height: 100%;
    position: fixed;
    background: rgba(0, 0, 0, 0.8);
  }
  .modal {
    padding: 10px;
    border-radius: 10px;
    max-width: 400px;
    margin: 10% auto;
    text-align: center;
    background: white;
  }
  .close-button {
    font-family: inherit;
    font-size: inherit;
    -webkit-padding: 0.4em 0;
    padding: 0.4em;
    margin: 0 0 0.5em 0;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 2px;
  }
</style>
