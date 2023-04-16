<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import MdRadioButtonUnchecked from "svelte-icons/md/MdRadioButtonUnchecked.svelte";
  import MdRadioButtonChecked from "svelte-icons/md/MdRadioButtonChecked.svelte";
  import { toggleDisplayMode } from "../../store/map/actions.mapState";
  import type { DisplayMode } from "../../store/map/type.mapState";
  import GeoSearch from "../geosearch/GeoSearch.svelte";

  export let displayMode: DisplayMode;

  function toggleStyle() {
    toggleDisplayMode();
  }
</script>

<div class="map-style-control">
  <div class="mode-container">
    <p class="mode-default">Dark Mode</p>
    <button class="mode-toggle-btn" on:click={toggleStyle}>
      {#if displayMode.type === "DEFAULT"}
        <div class="mode-icon">
          <MdRadioButtonUnchecked class="mode-icon" viewBox="0 0 20 20" />
        </div>
      {:else}
        <div class="mode-icon">
          <MdRadioButtonChecked class="mode-icon" viewBox="0 0 20 20" />
        </div>
      {/if}
    </button>
    <GeoSearch />
  </div>
</div>

<style>
  .map-style-control {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    padding: 5px;
    z-index: 999; /* Ensure the map controls are displayed above the map but below the search results */
  }

  .mode-container {
    display: flex;
    align-items: center;
    padding-right: 10%;
  }

  .mode-default {
    margin-right: 5px;
  }

  .mode-toggle-btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 2px;
    margin: 2px;
  }

  .mode-icon {
    width: 16px;
    height: 16px;
    margin: 2px;
  }
</style>
