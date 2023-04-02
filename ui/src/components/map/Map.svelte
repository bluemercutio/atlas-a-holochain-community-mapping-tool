<script lang="ts">
  import { beforeUpdate, onMount } from "svelte";
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
  import type { Snackbar } from "@material/mwc-snackbar";
  import "@material/mwc-textfield";
  import "@material/mwc-circular-progress";
  import "@material/mwc-textarea";
  import type { Coordinates, DisplayMode, DisplayModeType } from "../../store/types";
  import { mapState } from "../../store/store";
  import MdRadioButtonChecked from "svelte-icons/md/MdRadioButtonChecked.svelte";
  import MdRadioButtonUnchecked from "svelte-icons/md/MdRadioButtonUnchecked.svelte";
  import MapControls from "./MapControls.svelte";
  import { darkDisplayMode, defaultDisplayMode } from "./map.constants";
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
    defaultCoordinates;

  let tags: TagItem[] = [];

  // mapState.subscribe((value) => {
  //   coordinates = value.coordinates;
  // });
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
    console.log('CUrrent Tile Layer: ', currentTileLayer)

    currentTileLayer.addTo(leafletMap);
  }

  // function createMapStyleControl() {
  //   const mapStyleControl = L.Control.extend({
  //     options: {
  //       position: "topright",
  //     },

  //     onAdd: function (map) {
  //       const container = L.DomUtil.create("div", "map-style-control");
  //       L.DomEvent.disableClickPropagation(container);

  //       const defaultStyleBtn = L.DomUtil.create(
  //         "button",
  //         "map-style-btn",
  //         container
  //       );

  //       // Add the icon and text for Default option
  //       const colorLensIcon = new MdRadioButtonUnchecked({ target: defaultStyleBtn });
  //       defaultStyleBtn.appendChild(document.createTextNode(" Default"));
  //       L.DomEvent.on(defaultStyleBtn, "click", () =>
  //         updateMapStyle("default")
  //       );

  //       const darkStyleBtn = L.DomUtil.create(
  //         "button",
  //         "map-style-btn",
  //         container
  //       );

  //       // Add the icon and text for Dark option
  //       const nightsStayIcon = new MdRadioButtonChecked({ target: darkStyleBtn });
  //       darkStyleBtn.appendChild(document.createTextNode(" Dark"));
  //       L.DomEvent.on(darkStyleBtn, "click", () =>
  //         updateMapStyle("blackAndWhite")
  //       );

  //       return container;
  //     },
  //   });

  //   return new mapStyleControl();
  // }

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

    console.log("TAGS", tags);

    // Initialize the Leaflet.js map
    leafletMap = L.map("map").setView($mapState.coordinates, 16);

    updateMapStyle("DEFAULT");
  });

  $: if (leafletMap && $mapState.coordinates) {
    leafletMap.setView($mapState.coordinates, 16);
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
  .map-style-control {
    display: flex;
    justify-content: space-between;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 5px;
    border-radius: 5px;
    margin-top: 10px;
    width: 100%;
  }
  .loading-container {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .map-container {
    height: 600px;
  }

  .map-style-control {
    background-color: rgba(255, 255, 255, 0.8);
    padding: 5px;
    border-radius: 5px;
  }

  .dropdown-btn {
    display: block;
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 5px;
    font-size: 14px;
  }

  .dropdown-list {
    display: none;
  }

  .map-style-btn {
    display: flex;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 5px;
    font-size: 14px;
    width: 100%;
  }

  .map-style-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .map-style-btn svg {
    margin-right: 5px;
  }
</style>
