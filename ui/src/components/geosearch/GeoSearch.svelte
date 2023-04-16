<script lang="ts">
  import { onMount } from "svelte";
  import { moveMapTo, openMapModalAndMoveTo } from "../../store/map/actions.mapState";
  import type { SearchResult } from "../../types/search/types.search";
  import { mapState } from "../../store/map";
  let searchQuery = "";
  let searchResults: SearchResult[] = [];

  async function search() {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}`
    );
    searchResults = await response.json();
  }

  const handleResultClick = (result: SearchResult) => {
    console.log("Clicked result:", result);
    openMapModalAndMoveTo(
      {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      },
      $mapState.display_mode
    );
    // Perform any desired action with the selected result
  };

  const getAlphaResult = (result: SearchResult) => {
    const items = result.display_name.split(", ");
    const alpha = items[0];

    const metadata = items.slice(1);
    return { alpha, metadata };
  };
  const getMetadataLists = (result: SearchResult) => {
    const metadata = result.display_name.split(", ").slice(1);
    const midpoint = Math.ceil(metadata.length / 2);
    const firstHalf = metadata.slice(0, midpoint);
    const secondHalf = metadata.slice(midpoint);

    return { firstHalf, secondHalf };
  };
</script>

<div class="search-container">
  <input
    type="text"
    placeholder="Search for a location"
    bind:value={searchQuery}
    on:input={search}
  />

  {#if searchResults.length > 0}
    {console.log("searchResults: ", searchResults)}
    <ul class="search-results">
      {#each searchResults as result}
        <li
          class="search-result"
          on:click={() => handleResultClick(result)}
          on:keydown={(event) => {
            if (event.key === "Enter") {
              handleResultClick(result);
            }
          }}
        >
          <span class="main-name">{getAlphaResult(result).alpha}</span>
          <div class="metadata">
            <span class="metadata-display"
              >{getMetadataLists(result).firstHalf.join(", ")}</span
            >
            <span class="metadata-display"
              >{getMetadataLists(result).secondHalf.join(", ")}</span
            >
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    display: inline-block;
  }

  input[type="text"] {
    width: 100%;
    padding: 6px 12px;
    box-sizing: border-box;
    border: 2px solid black;
    border-radius: 4px;
    font-size: 16px;
  }

  .search-results {
    position: absolute;
    z-index: 1000; /* Change from -1 to 1000 to bring the results in front of other elements */
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 150%;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    bottom: calc(
      100% - 2px
    ); /* Change from top to bottom and account for the border thickness */

    /* Add the following two lines */
    display: flex;
    flex-wrap: wrap;
    padding-left: 2px;
  }

  .search-result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    list-style-type: none;
  }

  .search-result > .main-name {
    font-weight: bold;
    color: black;
    padding-right: 25px;
  }

  .search-result > .metadata {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: small;
  }

  .search-result > .metadata > .metadata-display {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    font-size: small;
  }
  .search-result:hover {
    background-color: #f1f1f1;
  }
</style>
