<script lang="ts">
  import { onMount } from "svelte";
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import { getContext } from "svelte";
  import { decode } from "@msgpack/msgpack";
  import type {
    AppAgentClient,
    Record,
    AgentPubKey,
    ActionHash,
  } from "@holochain/client";
  import { clientContext } from "../../contexts";
  import type { TagItem, TagsSignal } from "../../routes/tags/types";
  import "@material/mwc-button";
  import "@material/mwc-snackbar";
  import "@material/mwc-textfield";
  import "@material/mwc-circular-progress";
  import "@material/mwc-textarea";
  import type {
    Coordinates,
    DisplayMode,
    DisplayModeType,
  } from "../../store/map/type.mapState";
  import { mapState } from "../../store/map";
  import MapControls from "../map_controls/MapControls.svelte";
  import { darkDisplayMode, defaultDisplayMode } from "./map.constants";
  import { openCreateTagModal } from "../../store/tag/actions.createTag";
  import { closeMapModal } from "../../store/map/actions.mapState";
  export let author: AgentPubKey;
  export let defaultCoordinates: Coordinates;
  export let displayMode: DisplayMode;

  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  let hashes: Array<ActionHash> | undefined;
  let loading = true;
  let error: any = undefined;
  let leafletMap: L.Map;

  let record: Record | undefined;
  let tagItem: TagItem | undefined;
  let specialMarker;

  let editing = false;

  let tileLayer;

  $: editing,
    error,
    loading,
    record,
    tagItem,
    hashes,
    tags,
    error,
    leafletMap,
    defaultCoordinates,
    specialMarker;

  let tags: TagItem[] = [];

  let currentTileLayer: L.TileLayer;

  function updateMapStyle(style: DisplayModeType) {
    if (currentTileLayer) {
      leafletMap.removeLayer(currentTileLayer);
    }

    if (style === defaultDisplayMode.type) {
      currentTileLayer = L.tileLayer(defaultDisplayMode.url, {
        attribution: defaultDisplayMode.attribution,
      });
    } else if (style === darkDisplayMode.type) {
      currentTileLayer = L.tileLayer(darkDisplayMode.url, {
        attribution: darkDisplayMode.attribution,
      });
    }
    console.log("CUrrent Tile Layer: ", currentTileLayer);

    currentTileLayer.addTo(leafletMap);
  }

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

      hashes.map(async (hash) => {
        let item = await fetchTagItem(hash);
        console.log("ITEM", item);
        tags = [...tags, item];
      });
    } catch (e) {
      error = e;
    }
    loading = false;
  }
  async function fetchTagItem(tagItemHash) {
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
        console.log("marker", {
          lat_str: tagItem.latitude,
          lat_int: parseFloat(tagItem.latitude),
          lon_str: tagItem.latitude,
          lon_int: parseFloat(tagItem.longitude),
        });
        console.log("TAG ITEM: ", tagItem);
        console.log(
          "TESTING",
          parseFloat(tagItem.latitude),
          parseFloat(tagItem.longitude)
        );

        L.marker([
          parseFloat(tagItem.latitude),
          parseFloat(tagItem.longitude),
        ]).addTo(leafletMap);

        return tagItem;
      }
    } catch (e) {
      error = e;
    }
  }

  const createCustomMarker = (): L.Icon => {
    return L.icon({
      iconUrl: "/icons/circle-dashed-4-16.ico",
      iconSize: [25, 25],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  const addSpecialMarker = (lat: number, lon: number) => {
    if (specialMarker) {
      leafletMap.removeLayer(specialMarker);
    }
    const customMarker = createCustomMarker();
    specialMarker = L.marker([lat, lon], { icon: customMarker }).addTo(
      leafletMap
    );
    // ... the rest of the function

    const popupContent =
      '<button id="createTagButton" style="cursor:pointer">Create Tag</button>';
    const popup = L.popup({
      closeButton: false,
      className: "custom-popup",
      autoClose: false,
      closeOnClick: false,
    }).setContent(popupContent);
    specialMarker.bindPopup(popup);

    specialMarker.on("mouseover", () => {
      specialMarker.openPopup();
    });

    specialMarker.on("popupopen", () => {
      const createTagButton = document.getElementById("createTagButton");
      createTagButton.addEventListener("click", () => {
        // Add your logic here for creating a tag
        console.log("Create tag button clicked");
        closeMapModal();
        openCreateTagModal({ latitude: lat, longitude: lon });

        specialMarker.closePopup(); // Close the popup when the button is clicked
      });

      // Close the popup when the user clicks outside it
      leafletMap.on("click", () => {
        specialMarker.closePopup();
      });

      // Set a 4-second timeout for the popup to disappear
      setTimeout(() => {
        specialMarker.closePopup();
      }, 2000);
    });
  };

  onMount(async () => {
    await fetchTagItems();
    client.on("signal", (signal) => {
      if (signal.zome_name !== "tags") {
        return;
      }
      const payload = signal.payload as TagsSignal;
      if (payload.type !== "EntryCreated") {
        return;
      }
      if (payload.app_entry.type !== "TagItem") {
        return;
      }
      if (author.toString() !== client.myPubKey.toString()) {
        return;
      }
      hashes = [...hashes, payload.action.hashed.hash];
    });

    console.log("LEAFLET CONFIG", {
      lat: $mapState.coordinates.latitude,
      lng: $mapState.coordinates.longitude,
    });

    // Initialize the Leaflet.js map
    leafletMap = L.map("map").setView(
      [$mapState.coordinates.latitude, $mapState.coordinates.longitude],
      16
    );

    // Add a click event listener to the map
    leafletMap.on("click", (e) => {
      const { lat, lng } = e.latlng;
      // if (specialMarker) {
      //   specialMarker.setLatLng(e.latlng);
      // } else {
      //   addSpecialMarker(lat, lng);
      // }
      addSpecialMarker(lat, lng);
    });

    updateMapStyle("DEFAULT");
  });

  $: if (leafletMap && $mapState.coordinates) {
    leafletMap.setView(
      [$mapState.coordinates.latitude, $mapState.coordinates.longitude],
      16
    );
    if (defaultCoordinates.latitude && defaultCoordinates.longitude) {
      addSpecialMarker(
        defaultCoordinates.latitude,
        defaultCoordinates.longitude
      );
    }
  }
  $: if (leafletMap && $mapState.display_mode) {
    updateMapStyle($mapState.display_mode.type);
  }
</script>

{#if loading}
  <div class="loading-container">
    <mwc-circular-progress indeterminate />
  </div>
{:else if error}
  <span>Error fetching the tag items: {error.data.data}.</span>
{:else}
  <div id="map" class="map-container" />
  <MapControls {displayMode} />
{/if}

<style>
  .loading-container {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .map-container {
    height: 600px;
  }
</style>
