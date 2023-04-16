<script lang="ts">
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import type { AppAgentClient } from "@holochain/client";
  import { clientContext } from "../contexts";
  import "@material/mwc-button";
  import "@material/mwc-snackbar";
  import type { Snackbar } from "@material/mwc-snackbar";
  import "@material/mwc-textfield";
  import "@material/mwc-textarea";
  import type { CreateTagForm } from "../types/forms/form.createTag";
  import type { FormEntry } from "../types/forms/form.formEntry";
  import type { CreateProfileForm } from "../types/forms/form.createProfile";

  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  const dispatch = createEventDispatcher();

  export let title: string = "Create Item";
  export let fields: CreateTagForm | CreateProfileForm; //TODO: fix this
  export let createItemFunction: Function;
  export let updateStoreFunction: Function;
  export let closeFunction: Function;
  export let itemType: string;

  let errorSnackbar: Snackbar;

  $: isFormValid = Object.keys(fields).every(
    (key: string) => fields[key].value !== undefined
  );

  const createItem = async (e) => {
    try {
      console.log("Fields", fields);
      const submissionValues = {};
      Object.keys(fields).map(
        (key: string) => (submissionValues[key] = fields[key].value)
      );

      console.log("test", submissionValues);
      const result = await createItemFunction(submissionValues);
      updateStoreFunction(result);
      dispatch(`${itemType}-created`, result);
      closeFunction(e);
    } catch (e) {
      errorSnackbar.labelText = `Error creating the ${itemType}: ${e.data.data}`;
      errorSnackbar.show();
    }
  };

  onMount(() => {
    console.log("fields", fields);
  });
</script>

<!-- Add a "keydown" event listener to the window to listen for ESC key -->
<svelte:window
  on:keydown={(e) => {
    if (e.key === "Escape") closeFunction(e);
  }}
/>

<mwc-snackbar bind:this={errorSnackbar} leading />
<div
  class="backdrop"
  on:click={(e) => closeFunction(e)}
  on:keydown={(e) => {
    if (e.key === "Enter" || e.key === " ") closeFunction(e);
  }}
  tabindex="0"
>
  <!-- Prevent closing the modal when clicking inside the modal -->
  <div class="modal" on:click={(e) => e.stopPropagation()}>
    <div style="display: flex; flex-direction: column">
      <span style="font-size: 18px">{title}</span>
      {#each Object.keys(fields) as field_key (fields[field_key].label)}
        <div style="margin-bottom: 16px">
          <mwc-textfield
            outlined
            label={fields[field_key].label}
            value={fields[field_key].value || ""}
            on:input={(e) => {
              fields[field_key].value = e.target.value;
            }}
            required={fields[field_key].required}
          />
        </div>
      {/each}

      <mwc-button
        raised
        label={`Create ${itemType}`}
        disabled={!isFormValid}
        on:click={(e) => createItem(e)}
      />
      <mwc-button
        class="close-button"
        raised
        label="Close"
        on:click={(e) => closeFunction(e, true)}
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") closeFunction(e, true);
        }}
      />
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
