<script lang="ts">
  import CreateTagItem from "../routes/tags/CreateTagItem.svelte";
  import type {
    EntryHash,
    Record,
    AgentPubKey,
    ActionHash,
    AppAgentClient,
    NewEntryAction,
  } from "@holochain/client";
  import { clientContext } from "../contexts";
  import { getContext } from "svelte";
  import { mapState } from "../store/store";
  import {
    closeMapModal,
    openMapModal,
    openMapModalAndMoveTo,
  } from "../store/actions";


  let showCreateTagModal = false;
  let showMapModal: boolean;
  let client: AppAgentClient = (getContext(clientContext) as any).getClient();
  $: showMapModal


  mapState.subscribe((value) => {
    showMapModal = value.showModal;
  });

  function handleModalUpdate(event) {
    showCreateTagModal = event.detail;
  }
  const openCreateTagModal = () => {
    showCreateTagModal = !showCreateTagModal;
  };
  const toggleMapModal = () => {
    showMapModal ? closeMapModal() : openMapModal();
  };

  // const closeCreateTagModal = (e, force: boolean = false) => {
  //   const backdrop = document.querySelector(".backdrop");
  //   const closeButton = document.querySelector(".close-button");
  //   console.log(backdrop);
  //   if (e.target === backdrop || e.target === closeButton || force) {
  //     showCreateTagModal = false;
  //   }
  // };
</script>



<CreateTagItem
  on:child-update={handleModalUpdate}
  {client}
  showModal={showCreateTagModal}
/>

<div class="top-bar">
  <h3>ATLAS</h3>
  <div>
    <button on:click={() => openCreateTagModal()}>Create Tag</button>
    <button on:click={() => toggleMapModal()}>Map</button>
  </div>
</div>

<style>
  /* body {
    margin: 0;
    padding: 0;
  } */
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #333;
    color: #fff;
    font-size: 1.2rem;
    height: 40px;
    position: sticky;
    top: 0;
    z-index: 10;
    width: 100%;
  }
  .top-bar button {
    padding: 8px 15px;
    background-color: #555;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    text-transform: uppercase;
    font-weight: bold;
  }
  .top-bar button:hover {
    background-color: #777;
  }
</style>
