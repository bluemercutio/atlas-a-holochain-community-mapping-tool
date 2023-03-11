<script lang="ts">
  import CreateTagItem from "../tags/tags/CreateTagItem.svelte";
  import Map from "./Map.svelte";
  import type {
    EntryHash,
    Record,
    AgentPubKey,
    ActionHash,
    AppAgentClient,
    NewEntryAction,
  } from "@holochain/client";

  let showCreateTagModal = false;
  let showMapModal = false;
  export let author: AgentPubKey;
  let showHelp = false

  const openCreateTagModal = () => {
    showCreateTagModal = true;
    showMapModal = false;
  };
  const openMapModal = () => {
    showMapModal = true;
  };

  const showHelpDivs = () => {
    showHelp = !showHelp
  };

  const closeCreateTagModal = (e, force: boolean = false) => {
    const backdrop = document.querySelector(".backdrop");
    const closeButton = document.querySelector(".close-button");
    console.log(backdrop);
    if (e.target === backdrop || e.target === closeButton || force) {
      showCreateTagModal = false;
    }
  };
  const closeMapModal = (e: any, force: boolean = false): void => {
    const backdrop = document.querySelector(".backdrop");
    const closeButton = document.querySelector(".close-button");
    console.log(backdrop);
    if (e.target === backdrop || e.target === closeButton || force) {
      showMapModal = false;
    }
  };
</script>

{#if showMapModal}
<!-- smits -34.264478833198794, 18.464277119200723 -->
<!-- ct -33.94894079496996, 18.396664895093583 -->
  <Map {author} defaultCoordinates={[ -34.264478833198794, 18.464277119200723 ]}/>  
{/if}

{#if showCreateTagModal}
  <CreateTagItem {closeCreateTagModal} />
{/if}

<div class="top-bar">
  <h3>ATLAS</h3>
  <div>
    <button on:click={() => openCreateTagModal()}>Create Tag</button>
    <button on:click={() => openMapModal()}>Map</button>

  </div>
</div>

<style>
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
