<script lang="ts">
    import { createEventDispatcher, getContext } from "svelte";
    import type { AppAgentClient } from "@holochain/client";
    import { clientContext } from "../contexts";
    import "@material/mwc-button";
    import "@material/mwc-snackbar";
    import type { Snackbar } from "@material/mwc-snackbar";
    import "@material/mwc-textfield";
    import "@material/mwc-textarea";
  
    let client: AppAgentClient = (getContext(clientContext) as any).getClient();
  
    const dispatch = createEventDispatcher();
  
    export let title: string = "Create Item";
    export let fields: Array<{ label: string; required?: boolean }> = [];
    export let createItemFunction: Function;
    export let closeFunction: Function;
    export let itemType: string;
  
    let errorSnackbar: Snackbar;
  
    let fieldValues: Record<string, string | undefined> = {};
    fields.forEach(field => {
      fieldValues[field.label] = undefined;
    });
  
    $: isFormValid = fields.every(field => fieldValues[field.label] !== undefined);
  
    async function createItem(e) {
      try {
        const result = await createItemFunction(fieldValues);
        dispatch(`${itemType}-created`, result);
        closeFunction(e, true);
      } catch (e) {
        errorSnackbar.labelText = `Error creating the ${itemType}: ${e.data.data}`;
        errorSnackbar.show();
      }
    }
  </script>
  
  <mwc-snackbar bind:this={errorSnackbar} leading />
  <div class="backdrop" on:click={(e) => closeFunction(e)}>
    <div class="modal">
      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">{title}</span>
  
        {#each fields as field (field.label)}
          <div style="margin-bottom: 16px">
            <mwc-textfield
              outlined
              label={field.label}
              on:input={(e) => {
                fieldValues[field.label] = e.target.value;
              }}
              required={field.required}
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
  